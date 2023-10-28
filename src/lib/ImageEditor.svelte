<svelte:options customElement={{tag: "image-editor", shadow: 'none'}} />
<script>
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher()

    export let id = "ID"

    let originalImageBlob = null

    let crop = null
    let flipH = false
    let flipV = false
    let rotate = 0

    $: if (originalImageBlob !== null) {
        const canvasElement = document.getElementById(`${id}_canvas`)
        const canvasContext = canvasElement.getContext('2d')

        // Create an image to render the blob on the canvas
        const img = new Image()

        // Once the image loads, render the img on the canvas
        img.onload = function () {
            // Update dimensions of the canvas with the dimensions of the image
            if (rotate === 90 || rotate == 270) {
                canvasElement.width = this.height
                canvasElement.height = this.width
            } else {
                canvasElement.width = this.width
                canvasElement.height = this.height
            }

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

            canvasContext.drawImage(img, 0, 0)
        }

        // Cross-browser support for URL
        const URLObj = window.URL || window.webkitURL

        // Creates a DOMString containing a URL representing the object given in the parameter
        // namely the original Blob
        img.src = URLObj.createObjectURL(originalImageBlob)
    }

    onMount(() => {
        const containerElement = document.getElementById(`${id}_container`)

        function setImage(imageBlob) {
            originalImageBlob = imageBlob
            resetImage()
        }

        function resetImage() {
            crop = null
            flipH = false
            flipV = false
            rotate = 0
        }

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

        document.querySelector(`#${id} .save-button`).addEventListener('click', () => {
            const canvasElement = document.getElementById(`${id}_canvas`)
            const image = canvasElement.toDataURL("image/webp", 0.99)
            dispatch('imageReady', {image: image})
        })

        document.querySelector(`#${id} .reset-button`).addEventListener('click', () => {
            resetImage()
        })

        document.querySelector(`#${id} .flip-h-button`).addEventListener('click', () => {
            flipH = !flipH
        })

        document.querySelector(`#${id} .flip-v-button`).addEventListener('click', () => {
            flipV = !flipV
        })

        document.querySelector(`#${id} .rotate-cw-button`).addEventListener('click', () => {
            rotate += 90
            if (rotate >= 360) {
                rotate -= 360
            }
        })

        document.querySelector(`#${id} .rotate-ccw-button`).addEventListener('click', () => {
            rotate -= 90
            if (rotate < 0) {
                rotate += 360
            }
        })
    })
</script>

<div {id}>
    <div id={`${id}_container`} class="editor-container">
        <canvas id={`${id}_canvas`}></canvas>
    </div>

    <div class="mt-2 d-flex justify-content-between gap-5">
        <div>
            <button type="button" disabled={originalImageBlob === null}
                    class="save-button btn btn-primary">Save image</button>
        </div>
        <div>
            <button type="button" disabled={originalImageBlob === null}
                    class="reset-button btn btn-outline-secondary">
                Reset
            </button>
            <button type="button" disabled={originalImageBlob === null}
                    class="flip-h-button btn" class:btn-outline-secondary={!flipH} class:btn-secondary={flipH}>
                <i class="bi bi-symmetry-vertical"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null}
                    class="flip-v-button btn" class:btn-outline-secondary={!flipV} class:btn-secondary={flipV}>
                <i class="bi bi-symmetry-horizontal"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null}
                    class="rotate-cw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 270}
                    class:btn-secondary={rotate === 90 || rotate === 180}>
                <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button type="button" disabled={originalImageBlob === null}
                    class="rotate-ccw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 90}
                    class:btn-secondary={rotate === 270 || rotate === 180}>
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
        </div>
    </div>
</div>

<style>
    .editor-container {
        display: flex;
        max-width: 70vw;
        max-height: 70vh;
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