<svelte:options customElement={{tag: "image-editor", shadow: 'none'}}/>
<script>
    import {createEventDispatcher, onMount} from "svelte";
    import {flip} from "svelte/animate";

    const dispatch = createEventDispatcher()

    export let id = "ID"

    let canvasElement

    // Create an image to render the blob on the canvas
    let canvasImage = new Image()

    let originalImageBlob = null
    let saving = false

    let flipH = false
    let flipV = false
    let rotate = 0

    let crop = null

    let drawing = false
    let isDrawing = false
    let startPoint = null
    let endPoint = null

    $: drawCanvas(originalImageBlob, flipH, flipV, rotate, crop, startPoint, endPoint)

    function drawCanvas(originalImageBlob, flipH, flipV, rotate, crop, startPoint, endPoint) {
        if (originalImageBlob !== null) {
            const canvasContext = canvasElement.getContext('2d')

            // Once the image loads, render the canvasImage on the canvas
            canvasImage.onload = function (event) {
                // Update dimensions of the canvas with the dimensions of the image
                if (rotate === 90 || rotate === 270) {
                    canvasElement.width = this.height
                    canvasElement.height = this.width
                } else {
                    canvasElement.width = this.width
                    canvasElement.height = this.height
                }

                canvasContext.resetTransform()
                canvasContext.clearRect(0, 0, this.width, this.height)

                switch (rotate) {
                    case 90:
                        canvasContext.transform(0, 1, -1, 0, this.height, 0)
                        break;
                    case 180:
                        canvasContext.transform(-1, 0, 0, -1, this.width, this.height)
                        break;
                    case 270:
                        canvasContext.transform(0, -1, 1, 0, 0, this.width)
                        break;
                }

                if (flipH) {
                    canvasContext.transform(-1, 0, 0, 1, this.width, 0)
                }

                if (flipV) {
                    canvasContext.transform(1, 0, 0, -1, 0, this.height)
                }

                canvasContext.drawImage(canvasImage, 0, 0)

                if (startPoint !== null && endPoint !== null) {
                    const transform = canvasContext.getTransform()

                    const startT = getTransformedPoint(startPoint, transform)
                    const endT = getTransformedPoint(endPoint, transform)

                    canvasContext.fillStyle = "slategray"
                    canvasContext.fillRect(startT.x, startT.y, endT.x - startT.x, endT.y - startT.y)
                }
            }

            // Cross-browser support for URL
            const URLObj = window.URL || window.webkitURL

            // Creates a DOMString containing a URL representing the object given in the parameter
            // namely the original Blob
            canvasImage.src = URLObj.createObjectURL(originalImageBlob)
        }
    }

    function setImage(imageBlob) {
        originalImageBlob = imageBlob
        resetImage()
    }

    function saveImage() {
        originalImageBlob = null
        saving = true

        const image = canvasElement.toDataURL("image/webp", 0.99)
        dispatch('imageReady', {image: image})
    }

    function resetImage() {
        flipH = false
        flipV = false
        rotate = 0

        crop = null

        drawing = false
        startPoint = null
        endPoint = null
    }

    function handleFlipH() {
        flipH = !flipH
        startPoint = null
        endPoint = null
        drawing = false
    }
    function handleFlipV() {
        flipV = !flipV
        startPoint = null
        endPoint = null
        drawing = false
    }

    function handleRotateCW() {
        rotate += 90
        if (rotate >= 360) {
            rotate -= 360
        }

        startPoint = null
        endPoint = null
        drawing = false
    }

    function handleRotateCCW() {
        rotate -= 90
        if (rotate < 0) {
            rotate += 360
        }

        startPoint = null
        endPoint = null
        drawing = false
    }

    function handleDraw() {
        drawing = !drawing
    }

    function getPointerPosition(ev) {
        const position = {
            x: ev.offsetX * canvasElement.width / canvasElement.clientWidth | 0,
            y: ev.offsetY * canvasElement.height / canvasElement.clientHeight | 0
        }

        return position
    }

    function getTransformedPoint(point, matrix) {
        return {
            x: matrix.a * point.x + matrix.c * point.y + matrix.e,
            y: matrix.b * point.x + matrix.d * point.y + matrix.f,
        }
    }

    function handleStart(ev) {
        if (drawing) {
            isDrawing = true
            startPoint = getPointerPosition(ev)
            endPoint = null
        }
    }

    function handleEnd(ev) {
        if (isDrawing) {
            isDrawing = false
            endPoint = getPointerPosition(ev)
        }
    }

    function handleCancel() {
        if (isDrawing) {
            isDrawing = false
            startPoint = null
            endPoint = null
        }
    }

    function handleMove(ev) {
        if (isDrawing) {
            endPoint = getPointerPosition(ev)
        }
    }

    onMount(() => {
        const containerElement = document.getElementById(`${id}_container`)

        containerElement.addEventListener("dragover", (event) => {
            event.preventDefault()
        })

        containerElement.addEventListener('drop', (ev) => {
            ev.preventDefault()

            if (ev.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                [...ev.dataTransfer.items].forEach((item, i) => {
                    // If dropped items aren't files, reject them
                    if (item.kind === "file") {
                        const file = item.getAsFile();
                        setImage(file)
                    }
                })
            } else {
                // Use DataTransfer interface to access the file(s)
                [...ev.dataTransfer.files].forEach((file, i) => {
                    setImage(file)
                })
            }
        })

        document.addEventListener('paste', async (e) => {
            e.preventDefault()

            for (const clipboardItem of e.clipboardData.files) {
                if (clipboardItem.type.startsWith('image/')) {
                    setImage(clipboardItem)
                }
            }
        })
    })
</script>

<div {id}>
    <div id={`${id}_container`} class="editor-container">
        <canvas bind:this={canvasElement} id={`${id}_canvas`} style="touch-action: none"
                on:pointerdown={handleStart} on:pointerup={handleEnd}
                on:pointercancel={handleCancel} on:pointermove={handleMove}>
        </canvas>
    </div>

    <div class="mt-2 d-flex justify-content-between gap-5">
        <div>
            <button type="button" disabled={originalImageBlob === null}
                    class="save-button btn btn-primary"
                    on:click={saveImage}>
                {#if saving}
                    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Saving
                {:else}
                    Save image
                {/if}
            </button>
        </div>

        <div>
            <button type="button" disabled={originalImageBlob === null}
                    class="reset-button btn btn-outline-secondary"
                    on:click={resetImage}>
                Reset
            </button>
            <button type="button" disabled={originalImageBlob === null || drawing}
                    class="flip-h-button btn" class:btn-outline-secondary={!flipH} class:btn-secondary={flipH}
                    on:click={handleFlipH}>
                <i class="bi bi-symmetry-vertical"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null || drawing}
                    class="flip-v-button btn" class:btn-outline-secondary={!flipV} class:btn-secondary={flipV}
                    on:click={handleFlipV}>
                <i class="bi bi-symmetry-horizontal"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null || drawing}
                    class="rotate-cw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 270}
                    class:btn-secondary={rotate === 90 || rotate === 180}
                    on:click={handleRotateCW}>
                <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null || drawing}
                    class="rotate-ccw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 90}
                    class:btn-secondary={rotate === 270 || rotate === 180}
                    on:click={handleRotateCCW}>
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>

            <button type="button" disabled={originalImageBlob === null || rotate === 90 || rotate === 270}
                    class="btn"
                    class:btn-outline-secondary={!drawing}
                    class:btn-secondary={drawing}
                    on:click={handleDraw}>
                <i class="bi bi-pencil-square"></i>
            </button>
        </div>
    </div>
</div>

<style>
    .editor-container {
        display: flex;
        aspect-ratio: 3 / 2;
        background-color: #eee;
        border: 3px dashed #ddd
    }

    .editor-container canvas {
        max-width: 100%;
        max-height: 100%;
        margin: auto
    }
</style>