<svelte:options customElement={{tag: "image-editor", shadow: 'none'}}/>
<script>
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher()

    export let originalImageBlob
    let canvasElement
    let canvasImage = new Image()

    export let validators
    let warnings = []

    export let upload = null
    let uploadComplete = false
    let uploadMessage = null
    let uploadError = false

    let uploading = false

    let flipH = false
    let flipV = false
    let rotate = 0

    let drawing = false
    let isDrawing = false
    let startPoint = null
    let endPoint = null

    $: drawCanvas(originalImageBlob, flipH, flipV, rotate, startPoint, endPoint)

    $: buttonsDisabled = originalImageBlob === undefined || uploading || uploadComplete || uploadError

    function validate(imageBlob, validators) {
        const testImage = new Image()

        testImage.onload = () => {
            warnings = []
            for (const validator of validators) {
                if (validator.test(testImage)) {
                    warnings = [...warnings, validator.message]
                }
            }
        }

        const URLObj = window.URL || window.webkitURL
        testImage.src = URLObj.createObjectURL(imageBlob)
    }

    function drawCanvas(originalImageBlob, flipH, flipV, rotate, startPoint, endPoint) {
        if (canvasElement !== undefined && originalImageBlob !== undefined) {
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

            const URLObj = window.URL || window.webkitURL
            canvasImage.src = URLObj.createObjectURL(originalImageBlob)
        }
    }

    function uploadImage() {
        uploading = true

        canvasElement.toBlob((blob) => {
            const formData = new FormData()

            if (upload.params !== undefined) {
                for (const param in upload.params) {
                    formData.append(param, upload.params[param])
                }
            }

            const today = new Date().toISOString().slice(0, 10).replaceAll('-', '')
            formData.append('uploaded_file', blob, `${today}.webp`)

            const req = new XMLHttpRequest()
            req.open("POST", upload.url)

            // req.upload.onprogress = (event) => {
            //     console.log(event)
            //     // update progress
            // }

            req.onreadystatechange = () => {
                if (req.readyState === XMLHttpRequest.DONE) {
                    uploading = false

                    if (req.status === 200) {
                        uploadComplete = true
                        dispatch('uploadComplete', null)
                    } else {
                        uploadError = true
                        uploadMessage = `Error: ${req.status} ${req.statusText}`
                        dispatch('uploadError', null)
                    }
                }
            }

            // req.onabort = (event) => {
            //     console.log("Upload aborted.", event)
            //     uploading = false
            //     uploadMessage = "Upload aborted."
            // }

            req.onerror = (event) => {
                uploading = false
                uploadError = true
                if (event.target.statusText === '') {
                    uploadMessage = `Error uploading file.`
                } else {
                    uploadMessage = `Error: ${req.status} ${event.target.statusText}`
                }
                dispatch('uploadError', null)
            }

            req.send(formData)
        }, "image/webp", 0.99)
    }

    function resetImage() {
        flipH = false
        flipV = false
        rotate = 0

        drawing = false
        isDrawing = false
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

    function hideWarning(ev) {
        ev.target.parentElement.classList.add("d-none")
    }

    onMount(() => {
        validate(originalImageBlob, validators)
        drawCanvas(originalImageBlob, flipH, flipV, rotate, startPoint, endPoint)
    })
</script>

<div>
    <div class="editor-container">
        {#if validators}
            <div class="warnings">
                {#each warnings as warning}
                    <div class="alert alert-warning d-flex justify-content-between align-items-center">
                        <span>{warning}</span>
                        <button class="btn btn-close" on:click={hideWarning}></button>
                    </div>
                {/each}
                {#if uploadMessage}
                    <div class="alert alert-danger text-start">
                        {uploadMessage}
                    </div>
                {/if}
            </div>
        {/if}

        <canvas bind:this={canvasElement} style="touch-action: none"
                on:pointerdown={handleStart} on:pointerup={handleEnd}
                on:pointercancel={handleCancel} on:pointermove={handleMove}>
        </canvas>
    </div>

    <div class="mt-2 d-flex justify-content-between gap-5">
        <div>
            <button type="button"
                    disabled={buttonsDisabled}
                    class="save-button btn"
                    class:btn-primary={!uploadError}
                    class:btn-danger={uploadError}
                    class:btn-success={uploadComplete}
                    on:click={uploadImage}>
                {#if uploadError}
                    <span class="bi bi-exclamation-triangle me-2"></span>
                    Error
                {:else if uploadComplete}
                    <span class="bi bi-check-lg me-2"></span>
                    Saved
                {:else if uploading}
                    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Saving
                {:else}
                    Save image
                {/if}
            </button>
        </div>

        <div class="d-flex flex-wrap gap-2">
            <button type="button" disabled={originalImageBlob === undefined}
                    class="reset-button btn btn-outline-secondary"
                    on:click={resetImage}>
                Reset
            </button>
            <button type="button" disabled={buttonsDisabled || drawing}
                    class="flip-h-button btn" class:btn-outline-secondary={!flipH} class:btn-secondary={flipH}
                    on:click={handleFlipH}>
                <i class="bi bi-symmetry-vertical"></i>
            </button>
            <button type="button" disabled={buttonsDisabled || drawing}
                    class="flip-v-button btn" class:btn-outline-secondary={!flipV} class:btn-secondary={flipV}
                    on:click={handleFlipV}>
                <i class="bi bi-symmetry-horizontal"></i>
            </button>
            <button type="button" disabled={buttonsDisabled || drawing}
                    class="rotate-cw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 270}
                    class:btn-secondary={rotate === 90 || rotate === 180}
                    on:click={handleRotateCW}>
                <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button type="button" disabled={buttonsDisabled || drawing}
                    class="rotate-ccw-button btn"
                    class:btn-outline-secondary={rotate === 0 || rotate === 90}
                    class:btn-secondary={rotate === 270 || rotate === 180}
                    on:click={handleRotateCCW}>
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>

            <button type="button" disabled={buttonsDisabled || rotate === 90 || rotate === 270}
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
        position: relative;
        width: 100%;

        display: flex;
        aspect-ratio: 3 / 2;
        background-color: rgba(var(--bs-secondary-rgb), 0.1);
        border: 5px dotted rgba(var(--bs-secondary-rgb), 0.15);
    }

    .editor-container .warnings {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        right: 1.5rem;
    }

    .editor-container canvas {
        max-width: 100%;
        max-height: 100%;
        margin: auto
    }
</style>