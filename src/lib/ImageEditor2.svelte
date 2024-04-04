<script>
    import {Canvas, Rect, FabricImage, Triangle, Line, Group} from 'fabric';
    import {onMount} from "svelte";

    let canvas
    let canvasElement

    let canvasImage
    let rotation = 0

    let imageElement
    let cropRect

    onMount(() => {
        canvas = new Canvas(canvasElement)
        canvas.backgroundColor = "#eee"

        FabricImage.fromURL('src/assets/4k-90.webp').then((img) => {
            canvasImage = img

            const maxDimension = Math.max(canvasImage.width, canvasImage.height)

            canvas.setDimensions({width: maxDimension * 1.05, height: maxDimension * 1.05}, {backstoreOnly: true})
            canvas.setDimensions({width: "100%", height: "100%"}, {cssOnly: true})

            canvasImage.selectable = false

            canvas.add(canvasImage)
            canvas.centerObject(canvasImage)

            // crop rectangle
            cropRect = new Rect({
                top: canvasImage.top,
                left: canvasImage.left,
                width: canvasImage.width * 0.9,
                height: canvasImage.height * 0.9,
                fill: 'transparent',
            })
            cropRect.cornerSize = img.width * 0.02
            cropRect.borderScaleFactor = 2
            cropRect.transparentCorners = false
            cropRect.setControlsVisibility({
                mt: false,
                mr: false,
                mb: false,
                ml: false,
                mtr: false
            })
            canvas.add(cropRect)
            canvas.centerObject(cropRect)

            canvas.on("object:moving", (e) => {
                const obj = e.target
                // if object is too big ignore
                if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
                    return;
                }
                obj.setCoords();
                // top-left  corner
                if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                    obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                    obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
                }
                // bot-right corner
                if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
                    obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                    obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
                }
            })

            canvas.on('object:scaling', (e) => {
                const obj = e.target;

                if (obj.height > obj.canvas.height || obj.width > obj.canvas.width) {
                    obj.setScaleY(obj.originalState.scaleY);
                    obj.setScaleX(obj.originalState.scaleX);
                }
                obj.setCoords();

                if (obj.getBoundingRect().top - (obj.cornerSize / 2) < 0 ||
                    obj.getBoundingRect().left - (obj.cornerSize / 2) < 0) {
                    obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top + (obj.cornerSize / 2));
                    obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left + (obj.cornerSize / 2));
                }

                if (obj.getBoundingRect().top + obj.getBoundingRect().height + obj.cornerSize > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width + obj.cornerSize > obj.canvas.width) {

                    obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top - obj.cornerSize / 2);
                    obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left - obj.cornerSize / 2);
                }
            })
        })
    })

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

        triangle.hasControls = false
        triangle.hasBorders = false

        const arrow = new Group([line, triangle]);
        arrow.rotate(90)

        arrow.cornerSize = 2000 * 0.02
        arrow.borderScaleFactor = 2
        arrow.transparentCorners = false
        arrow.setControlsVisibility({
            tl: false, tr: false, bl: false, br: false,
            mt: false, mr: false, mb: false, ml: false,
        })


        canvas.add(arrow)
    }

    function downloadImage() {
        cropRect.hasControls = false
        cropRect.hasBorders = false
        canvas.renderAll()

        imageElement.src = canvasImage.toDataURL({
            left: cropRect.left,
            top: cropRect.top,
            width: cropRect.width * cropRect.scaleX,
            height: cropRect.height * cropRect.scaleY
        })

        cropRect.hasControls = true
        cropRect.hasBorders = true
        canvas.renderAll()
    }

    function rotate(angle) {
        canvasImage.rotate(rotation += angle);

        canvas.renderAll()
    }
</script>

<div style="display: flex; max-width: 700px">
    <div class="main" style="flex-grow: 1">
        <div id="canvasContainer">
            <canvas bind:this={canvasElement}></canvas>
        </div>
    </div>

    <div style="display: flex; flex-direction: column">
        <div class="info">
            Adjust image
        </div>

        <button on:click={() => { canvasImage.flipX = !canvasImage.flipX; canvas.renderAll()}}>
            Flip H
        </button>

        <button on:click={() => { canvasImage.flipY = !canvasImage.flipY; canvas.renderAll()}}>
            Flip V
        </button>

        <button on:click={() => {rotate(90)}}>
            Rotate 90 CW
        </button>

        <button on:click={() => {rotate(-90)}}>
            Rotate 90 CCW
        </button>

        <div class="info">
            Crop
        </div>

        <div class="info">
            Add markers
        </div>

        <button on:click={drawArrow}>
            Arrow
        </button>

        <button on:click={() => downloadImage()}>
            Download image
        </button>
    </div>
</div>

<div class="main">
    <img alt="Result" bind:this={imageElement}>
</div>

<style>
    .main {
        padding: 1rem;
        border: 2px dashed darkblue;
        max-height: 600px;
    }

    #canvasContainer {
        max-height: 600px;
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
    }
</style>