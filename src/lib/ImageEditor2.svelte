<script>
    import {Canvas, Rect, FabricImage, Triangle, Line, Group, filters, Point, util, Circle} from 'fabric';
    import {onMount} from "svelte";

    let canvas
    let canvasElement

    let canvasImage
    let rotation = 0
    let flipH = false
    let flipV = false

    let imageElement
    let cropRect

    let brightness = 0
    let contrast = 0

    let markers = []
    let activeMarker

    $: flipHorizontal(flipH)

    function flipHorizontal(flipValue) {
        if (canvasImage !== undefined) {
            canvasImage.flipX = flipValue
            canvas.renderAll()
        }
    }

    $: flipVertical(flipV)

    function flipVertical(flipValue) {
        if (canvasImage !== undefined) {
            canvasImage.flipY = flipValue
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

    onMount(() => {
        canvas = new Canvas(canvasElement)
        canvas.backgroundColor = "#333"

        FabricImage.fromURL('src/assets/4k-90.webp').then((img) => {
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
                top: canvasImage.top,
                left: canvasImage.left,
                width: canvasImage.width,
                height: canvasImage.height,
                fill: 'transparent',
            })
            cropRect.selectable = false
            cropRect.minScaleLimit = 0.2
            cropRect.lockScalingFlip = true
            cropRect.cornerSize = img.width * 0.02
            cropRect.borderScaleFactor = 3
            cropRect.transparentCorners = false
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

            canvas.add(cropRect)

            canvas.on("object:moving", (e) => {
                const obj = e.target
                if (obj === cropRect) {
                    obj.setCoords()

                    // top-left corner
                    if (obj.getBoundingRect().top < canvasImage.getBoundingRect().top) {
                        obj.top = canvasImage.getBoundingRect().top
                    }

                    if (obj.getBoundingRect().left < canvasImage.getBoundingRect().left) {
                        obj.left = canvasImage.getBoundingRect().left
                    }

                    // bot-right corner
                    if (obj.getBoundingRect().top + obj.getBoundingRect().height > canvasImage.getBoundingRect().top + canvasImage.getBoundingRect().height) {
                        obj.top = canvasImage.getBoundingRect().top + canvasImage.getBoundingRect().height - obj.getBoundingRect().height
                    }

                    if (obj.getBoundingRect().left + obj.getBoundingRect().width > canvasImage.getBoundingRect().left + canvasImage.getBoundingRect().width) {
                        obj.left = canvasImage.getBoundingRect().left + canvasImage.getBoundingRect().width - obj.getBoundingRect().width
                    }
                }
            })

            canvas.on('object:scaling', (e) => {
                const obj = e.target
                if (obj === cropRect) {
                    const obj_bb = obj.getBoundingRect()
                    const image_bb = canvasImage.getBoundingRect()

                    if (obj_bb.top < image_bb.top
                        || obj_bb.top + obj_bb.height > image_bb.top + image_bb.height) {
                        if (obj.scaleY > obj.lastGoodScale) {
                            obj.left = obj.lastGoodLeft
                            obj.top = obj.lastGoodTop
                            obj.scaleX = obj.lastGoodScale
                            obj.scaleY = obj.lastGoodScale
                        }
                    }

                    if (obj_bb.left < image_bb.left
                        || obj_bb.left + obj_bb.width > image_bb.left + image_bb.width) {
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
                }
            })

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

        canvas.renderAll()
    }

    function activateCrop() {
        canvas.setActiveObject(cropRect)
        canvas.renderAll()
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

    function downloadImage() {
        cropRect.hasControls = false
        cropRect.hasBorders = false

        canvas.discardActiveObject()
        canvas.renderAll()

        const coords = cropRect.getCoords()
        const x_min = Math.min(coords[0].x, coords[1].x, coords[2].x, coords[3].x)
        const x_max = Math.max(coords[0].x, coords[1].x, coords[2].x, coords[3].x)
        const y_min = Math.min(coords[0].y, coords[1].y, coords[2].y, coords[3].y)
        const y_max = Math.max(coords[0].y, coords[1].y, coords[2].y, coords[3].y)

        imageElement.src = canvas.toDataURL({
            left: x_min,
            top: y_min,
            width: x_max - x_min - 1,
            height: y_max - y_min - 1
        })

        cropRect.hasControls = true
        cropRect.hasBorders = true
        canvas.renderAll()
    }

    function reset() {
        for (const arrow of markers) {
            canvas.remove(arrow)
        }

        rotate(-rotation)
        flipH = false
        flipV = false

        contrast = 0
        brightness = 0

        canvas.renderAll()
    }
</script>

<div style="display: flex; gap: 1rem; max-width: 1180px">
    <div class="main" style="flex-grow: 1">
        <div id="canvasContainer">
            <canvas bind:this={canvasElement}></canvas>
        </div>
    </div>

    <div style="display: flex; flex-direction: column; padding: 1rem">
        <div style="display: flex; flex-grow: 1; gap: 1rem">
            <div style="display: flex; flex-direction: column">
                <div class="info">
                    Orientation
                </div>

                <div>
                    <button type="button" class="btn btn-outline-secondary" class:active={flipH}
                            on:click={() => flipH = !flipH}>
                        <i class="bi bi-symmetry-vertical"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary" class:active={flipV}
                            on:click={() => flipV = !flipV}>
                        <i class="bi bi-symmetry-horizontal"></i>
                    </button>
                </div>

                <div>
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

                <button class="btn btn-outline-secondary" on:click={activateCrop}>
                    <i class="bi bi-crop me-2"></i>
                    Crop
                </button>
            </div>

            <div style="display: flex; flex-direction: column">
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

                    <button class="btn btn-danger" on:click={deleteSelectedMarker} disabled={!markers.includes(activeMarker)}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <div>
            <div class="alert alert-warning">
                Low resolution
            </div>

            <div class="alert alert-warning">
                Text?
            </div>
        </div>

        <hr>

        <div>
            <button class="btn btn-secondary" on:click={() => reset()}>
                Reset
            </button>

            <button class="btn btn-primary" on:click={() => downloadImage()}>
                Download image
            </button>
        </div>
    </div>
</div>

<div class="main">
    <img alt="Result" bind:this={imageElement}>
</div>

<style>
    .main {
        padding: 1rem;
        border: 2px dashed darkblue;
        max-height: 800px;
    }

    #canvasContainer {
        max-height: 800px;
        aspect-ratio: 1 / 1;
        padding: 0;
    }

    canvas {
        width: 100%;
        height: 100%;
    }

    img {
        max-height: 100%;
    }

    .info {
        font-size: 120%;
        font-weight: bold;
        margin-bottom: 1rem;
    }

    .info:not(:first-child) {
        margin-top: 1rem
    }

    button {
        margin-bottom: 0.5rem
    }
</style>