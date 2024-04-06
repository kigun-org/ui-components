<script>
    import {Canvas, Rect, FabricImage, Triangle, Line, Group, filters, Point, util, Circle, Path} from 'fabric';
    import {onMount} from "svelte";

    export let originalImageBlob

    export let validators
    let warnings = []

    export let saveCallback

    let saving = false

    let canvasElement

    let canvas
    let canvasImage

    let flipH = false
    let flipV = false
    let rotation = 0

    let darkRect
    let cropRect

    let brightness = 0
    let contrast = 0

    let markers = []
    let activeMarker

    function updateClipPath(boundingRect) {
        const path = `M ${boundingRect.left - 2} ${boundingRect.top - 2} h ${boundingRect.width + 4} v ${boundingRect.height + 4} h -${boundingRect.width + 4} Z`
        darkRect.clipPath = new Path(path, {
            absolutePositioned: true,
            inverted: true
        })

        canvas.renderAll()
    }

    function validate(imageDataURL, validators) {
        const testImage = new Image()

        testImage.onload = () => {
            warnings = []
            for (const validator of validators) {
                if (validator.test(testImage)) {
                    warnings = [...warnings, validator.message]
                }
            }
        }

        testImage.src = imageDataURL
    }

    function hideWarning(ev) {
        ev.target.parentElement.classList.add("d-none")
    }

    onMount(() => {
        canvas = new Canvas(canvasElement, {
            backgroundColor: "dimgray",
            preserveObjectStacking: true
        })

        const URLObj = window.URL || window.webkitURL
        const imageDataURL = URLObj.createObjectURL(originalImageBlob)

        validate(imageDataURL, validators)

        FabricImage.fromURL(imageDataURL).then((img) => {
            canvasImage = img

            canvasImage.filters.push(new filters.Contrast({contrast: 0})) // 0
            canvasImage.filters.push(new filters.Brightness({brightness: 0})) // 1

            const maxDimension = Math.max(canvasImage.width, canvasImage.height)

            canvas.setDimensions({width: maxDimension, height: maxDimension}, {backstoreOnly: true})
            canvas.setDimensions({width: "100%", height: "100%"}, {cssOnly: true})

            canvasImage.selectable = false

            canvas.add(canvasImage)
            canvas.centerObject(canvasImage)

            // crop rectangle
            cropRect = new Rect({
                left: canvasImage.left,
                top: canvasImage.top,
                width: canvasImage.width,
                height: canvasImage.height,
                fill: 'transparent',
                selectable: false,
                minScaleLimit: 0.2,
                lockScalingFlip: true,
                cornerSize: img.width * 0.02,
                borderScaleFactor: 3,
                transparentCorners: false,
            })
            cropRect.setControlsVisibility({
                mt: false,
                mr: false,
                mb: false,
                ml: false,
                mtr: false
            })
            cropRect.lastGoodTop = canvasImage.top
            cropRect.lastGoodLeft = canvasImage.left
            cropRect.lastGoodScale = 1

            // dark overlay
            darkRect = new Rect({
                top: canvasImage.top,
                left: canvasImage.left,
                width: canvasImage.width,
                height: canvasImage.height,
                fill: "rgba(0,0,0,0.6)",
                selectable: false
            })
            canvas.add(darkRect)

            canvas.add(cropRect)

            updateClipPath(cropRect.getBoundingRect())


            /*
             * Handle canvas events
             */

            // Limit crop rectangle position to not exceed image boundaries
            canvas.on("object:moving", (e) => {
                const obj = e.target
                if (obj === cropRect) {
                    obj.setCoords()

                    // top-left corner
                    if (obj.getBoundingRect().top < canvasImage.getBoundingRect().top) {
                        obj.top = obj.lastGoodTop
                    }

                    if (obj.getBoundingRect().left < canvasImage.getBoundingRect().left) {
                        obj.left = obj.lastGoodLeft
                    }

                    // bot-right corner
                    if (obj.getBoundingRect().top + obj.getBoundingRect().height > canvasImage.getBoundingRect().top + canvasImage.getBoundingRect().height) {
                        obj.top = obj.lastGoodTop
                    }

                    if (obj.getBoundingRect().left + obj.getBoundingRect().width > canvasImage.getBoundingRect().left + canvasImage.getBoundingRect().width) {
                        obj.left = obj.lastGoodLeft
                    }

                    obj.lastGoodTop = obj.top
                    obj.lastGoodLeft = obj.left

                    obj.setCoords()
                    updateClipPath(obj.getBoundingRect())
                }
            })

            // Limit crop rectangle scale to not exceed image boundaries
            canvas.on('object:scaling', (e) => {
                const obj = e.target
                if (obj === cropRect) {
                    obj.setCoords()

                    const cropRect_bb = obj.getBoundingRect()
                    const image_bb = canvasImage.getBoundingRect()

                    if (cropRect_bb.top < image_bb.top
                        || cropRect_bb.top + cropRect_bb.height > image_bb.top + image_bb.height) {
                        if (obj.scaleY > obj.lastGoodScale) {
                            obj.left = obj.lastGoodLeft
                            obj.top = obj.lastGoodTop
                            obj.scaleX = obj.lastGoodScale
                            obj.scaleY = obj.lastGoodScale
                        }
                    }

                    if (cropRect_bb.left < image_bb.left
                        || cropRect_bb.left + cropRect_bb.width > image_bb.left + image_bb.width) {
                        if (obj.scaleY > obj.lastGoodScale) {
                            obj.left = obj.lastGoodLeft
                            obj.top = obj.lastGoodTop
                            obj.scaleX = obj.lastGoodScale
                            obj.scaleY = obj.lastGoodScale
                        }
                    }

                    obj.lastGoodTop = obj.top
                    obj.lastGoodLeft = obj.left
                    obj.lastGoodScale = obj.scaleX

                    obj.setCoords()
                    updateClipPath(obj.getBoundingRect())
                }
            })

            // Select crop rectangle when clicking on the darker (to be cropped) part
            darkRect.on("mousedown", function handleDarkRectClick(e) {
                if (e.target === darkRect) {
                    canvas.setActiveObject(cropRect)
                    canvas.renderAll()
                }
            })

            /**
             * On selection change, set `activeMarker`
             * to new selected marker or undefined.
             *
             * @param e
             */
            function onSelectionUpdated(e) {
                if (e.selected === undefined) {
                    activeMarker = undefined
                    return
                }

                const obj = e.selected[0]
                if (markers.includes(obj)) {
                    activeMarker = obj
                } else {
                    activeMarker = undefined
                }
            }

            canvas.on("selection:created", onSelectionUpdated)
            canvas.on("selection:updated", onSelectionUpdated)
            canvas.on("selection:cleared", onSelectionUpdated)
        })
    })

    $: flipHorizontal(flipH)

    function flipHorizontal(flipValue) {
        if (canvasImage !== undefined) {
            canvasImage.flipX = flipValue

            // flip crop rect and dark (clip) rectangle

            updateClipPath(cropRect.getBoundingRect())

            // flip markers

            canvas.renderAll()
        }
    }

    $: flipVertical(flipV)

    function flipVertical(flipValue) {
        if (canvasImage !== undefined) {
            canvasImage.flipY = flipValue
            updateClipPath(cropRect.getBoundingRect())
            canvas.renderAll()
        }
    }

    function rotate(degrees) {
        rotation += degrees

        const canvasCenter = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2) // center of canvas
        const radians = util.degreesToRadians(degrees)

        canvas.getObjects().forEach((obj) => {
            const objectOrigin = new Point(obj.left, obj.top)
            // let new_loc = util.rotatePoint(objectOrigin, canvasCenter, radians)
            let new_loc = objectOrigin.rotate(radians, canvasCenter)
            obj.top = new_loc.y
            obj.left = new_loc.x
            obj.angle += degrees //rotate each object buy the same angle
            obj.setCoords()
        });

        updateClipPath(cropRect.getBoundingRect())
        canvas.renderAll()
    }

    function activateCrop() {
        canvas.setActiveObject(cropRect)
        canvas.renderAll()
    }

    function resetCrop() {
        cropRect.set({
            left: canvasImage.left,
            top: canvasImage.top,
            width: canvasImage.width,
            height: canvasImage.height,
            scaleX: 1,
            scaleY: 1
        })
        cropRect.lastGoodTop = canvasImage.top
        cropRect.lastGoodLeft = canvasImage.left
        cropRect.lastGoodScale = 1
        cropRect.setCoords()

        canvas.discardActiveObject()

        updateClipPath(cropRect.getBoundingRect())
    }

    let keepAspectRatio = true
    $: updateKeepAspectRatio(keepAspectRatio)

    function updateKeepAspectRatio(value) {
        if (cropRect !== undefined) {
            cropRect.setControlsVisibility({mt: !value, mr: !value, mb: !value, ml: !value})
            canvas.renderAll()
        }
    }

    $: adjustContrast(contrast)

    function adjustContrast(contrast) {
        if (canvasImage !== undefined) {
            canvasImage.filters[0] = new filters.Contrast({contrast: contrast * 0.01})
            canvasImage.applyFilters()
            canvas.renderAll()
        }
    }

    $: adjustBrightness(brightness)

    function adjustBrightness(brightness) {
        if (canvasImage !== undefined) {
            canvasImage.filters[1] = new filters.Brightness({brightness: brightness * 0.01})
            canvasImage.applyFilters()
            canvas.renderAll()
        }
    }

    function drawArrow() {
        const triangle = new Triangle({
            left: 500,
            top: 500,
            width: 100,
            height: 150,
            fill: 'yellow',
            angle: 0
        })
        const line = new Line([0, 0, 0, 150], {
            left: 540,
            top: 600,
            stroke: 'yellow',
            strokeWidth: 20
        });

        const arrow = new Group([line, triangle]);
        arrow.rotate(90)

        arrow.cornerSize = 2000 * 0.02
        arrow.borderScaleFactor = 2
        arrow.transparentCorners = false
        arrow.setControlsVisibility({
            tl: false, tr: false, br: false,
            mt: false, mr: false, mb: false, ml: false,
        })
        arrow.lockScalingFlip = true
        arrow.minScaleLimit = 0.5

        markers.push(arrow)

        canvas.add(arrow)
        canvas.setActiveObject(arrow)
        canvas.renderAll()
    }

    function drawCircle() {
        const circle = new Circle({
            left: 500,
            top: 500,
            radius: 100,
            stroke: 'yellow',
            strokeWidth: 15,
            fill: 'transparent'
        })

        circle.cornerSize = 2000 * 0.02
        circle.borderScaleFactor = 2
        circle.transparentCorners = false
        circle.setControlsVisibility({
            mt: false, mr: false, mb: false, ml: false, mtr: false
        })
        circle.lockScalingFlip = true
        circle.minScaleLimit = 0.5

        markers.push(circle)

        canvas.add(circle)
        canvas.setActiveObject(circle)
        canvas.renderAll()
    }


    function drawRect() {
        const rect = new Rect({
            left: 500,
            top: 500,
            width: 300,
            height: 200,
            fill: 'dimgray'
        })

        rect.cornerSize = 2000 * 0.02
        rect.borderScaleFactor = 2
        rect.transparentCorners = false
        rect.setControlsVisibility({mtr: false})

        rect.lockScalingFlip = true
        rect.minScaleLimit = 0.5

        markers.push(rect)

        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()
    }

    function deleteSelectedMarker() {
        canvas.remove(activeMarker)
        activeMarker = undefined
    }

    function reset() {
        rotate(-rotation)
        flipH = false
        flipV = false

        // reset crop
        resetCrop()

        contrast = 0
        brightness = 0

        for (const arrow of markers) {
            canvas.remove(arrow)
        }
    }

    function saveImage() {
        saving = true

        canvas.discardActiveObject()
        canvas.renderAll()

        const coords = cropRect.getCoords()
        const x_min = Math.min(coords[0].x, coords[1].x, coords[2].x, coords[3].x)
        const x_max = Math.max(coords[0].x, coords[1].x, coords[2].x, coords[3].x)
        const y_min = Math.min(coords[0].y, coords[1].y, coords[2].y, coords[3].y)
        const y_max = Math.max(coords[0].y, coords[1].y, coords[2].y, coords[3].y)

        /*
         * Output PNG (lossless) to upload to server
         * Could add ("image/webp", 1) arguments, but not supported by Safari
         */
        canvas.toCanvasElement(1, {
            left: x_min,
            top: y_min,
            width: x_max - x_min - 1,
            height: y_max - y_min - 1
        }).toBlob((blob) => {
            saveCallback(blob).then((result) => {
                saving = false
            }).catch((e) => {
                saving = false
            })
        })
    }
</script>

<div style="display: flex; gap: 1rem; max-width: 1200px">
    <div class="main" style="flex-grow: 1">
        <div id="canvasContainer">
            <canvas bind:this={canvasElement}></canvas>
        </div>

        {#if validators}
        <div class="warnings">
            {#each warnings as warning}
                <div class="alert alert-warning d-flex justify-content-between align-items-center">
                    {warning}
                    <button class="btn-close m-0" on:click={hideWarning}></button>
                </div>
            {/each}
        </div>
        {/if}
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1rem">
            <div class="info">
                Orientation
            </div>

            <div>
                <button class="btn btn-outline-secondary" class:active={flipH} on:click={() => flipH = !flipH}
                        type="button">
                    <i class="bi bi-symmetry-vertical"></i>
                </button>
                <button class="btn btn-outline-secondary" class:active={flipV} on:click={() => flipV = !flipV}
                        type="button">
                    <i class="bi bi-symmetry-horizontal"></i>
                </button>

                <button class="btn btn-outline-secondary" on:click={() => rotate(90)}>
                    <i class="bi bi-arrow-clockwise"></i>
                </button>

                <button class="btn btn-outline-secondary" on:click={() => rotate(-90)}>
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
            </div>

            <div class="info">
                Crop
            </div>

            <div>
                <button class="btn btn-outline-secondary" on:click={activateCrop}>
                    <i class="bi bi-crop me-2"></i>
                    Crop
                </button>
                <button class="btn btn-outline-danger" on:click={resetCrop}>
                    <i class="bi bi-x-lg me-2"></i>
                    Reset
                </button>
            </div>

            <div>
                <label>
                    <input type="checkbox" bind:checked={keepAspectRatio}>
                    Keep aspect ratio
                </label>
            </div>

            <div class="info">
                Adjust image
            </div>

            <div class="mx-2">
                <i class="bi bi-brightness-high"></i>
                Brightness
                <small>({brightness}%)</small>
                <br>
                <input bind:value={brightness} max="30" min="-30" step="1" type="range">
            </div>

            <div class="mx-2">
                <i class="bi bi-circle-half"></i>
                Contrast
                <small>({contrast}%)</small>
                <br>
                <input bind:value={contrast} max="30" min="-30" step="1" type="range">
            </div>

            <div class="info">
                Markers
            </div>

            <div>
                <button class="btn btn-outline-secondary" on:click={drawArrow}>
                    <i class="bi bi-arrow-right"></i>
                </button>

                <button class="btn btn-outline-secondary" on:click={drawCircle}>
                    <i class="bi bi-circle"></i>
                </button>

                <button class="btn btn-outline-secondary" on:click={drawRect}>
                    <i class="bi bi-square-fill"></i>
                </button>

                <button class="btn btn-outline-danger" disabled={!markers.includes(activeMarker)}
                        on:click={deleteSelectedMarker}>
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>

        <button class="btn btn-outline-secondary mb-2" on:click={() => reset()}>
            Reset changes
        </button>

        <div style="position: relative; width: 100%">
            <button class="btn btn-lg btn-primary w-100" on:click={saveImage}>
                <i class="bi bi-file-earmark-check me-1"></i>
                Save
            </button>
            <div class="loading" class:invisible={!saving}>
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .main {
        position: relative;
    }

    .warnings {
        position: absolute;
        top: 0;
        width: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .warnings .alert:last-child {
        margin-bottom: 0;
    }

    #canvasContainer {
        aspect-ratio: 1 / 1;
        margin: 0 auto;
    }

    canvas {
        width: 100%;
        height: 100%;
    }

    .info {
        font-size: 120%;
        font-weight: bold;
    }

    .loading {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.7);
    }
</style>