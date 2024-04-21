<script lang="ts">
    import {onMount} from "svelte";
    import {Carousel, Modal} from "bootstrap/dist/js/bootstrap.esm";

    let modal
    let modalElement
    let modalVisible = false

    let carousel
    let carouselElement
    let nextElement
    let activeIndex = 0

    let items = [
        {
            "id": 1,
            "url": "https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "thumbnail": "https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&h=300"
        },
        {
            "id": 2,
            "url": "https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "thumbnail": "https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&h=300"
        },
        {
            "id": 3,
            // "url": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "url": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300",
            "thumbnail": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300"
        }
    ]

    onMount(() => {
        modal = new Modal(modalElement, {})

        modalElement.addEventListener('shown.bs.modal', () => {
            nextElement.focus()
        })

        modalElement.addEventListener('hidden.bs.modal', () => {
            modalVisible = false
        })

        carousel = new Carousel(carouselElement, {})

        carouselElement.addEventListener('slide.bs.carousel', () => {
            // pause all videos when sliding through carousel
            document.querySelectorAll('video').forEach((video) => {
                video.pause()
            })
        })
    })

    function showModal(index) {
        activeIndex = index
        modal.show()
        modalVisible = true
    }
</script>

<div class="lightbox">
    {#each items as item, index}
        <div class="lightbox-item">
            <img src={item.thumbnail} alt="Thumbnail" on:click={() => showModal(index)} />
        </div>
    {/each}
</div>

<div bind:this={modalElement} class="modal fade active" tabindex="-1">
    <div class="modal-dialog modal-fullscreen p-lg-3">
        <div class="modal-content">
        <div bind:this={carouselElement} id="carouselExample" class="carousel slide">
            <div class="carousel-inner">
                {#if modalVisible}
                {#each items as item, index}
                    <div class="carousel-item" class:active={activeIndex === index}>
                        <div>
                            <img src={item.url} alt="...">
                        </div>
                    </div>
                {/each}
                <div class="carousel-item">
                    <div>
                        <video controls poster="https://peach.blender.org/wp-content/themes/bf-bunny/graphics/header1.jpg">
                            <source src="https://demo.kigun.org/data/original/2023/10/gbr_Afr976l.webm" type="video/mp4">
                        </video>
                    </div>
                </div>
                {/if}
            </div>
            <button class="carousel-control-prev" type="button" on:click={() => carousel.prev()}>
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button bind:this={nextElement} class="carousel-control-next" type="button" on:click={() => carousel.next()}>
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
            <div data-bs-theme="dark" class="carousel-control-close p-4 p-lg-3">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        </div>
        </div>
<!--        <div class="modal-content">-->
<!--            <div class="modal-header">-->
<!--                <h5 class="modal-title">Modal title</h5>-->
<!--                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>-->
<!--            </div>-->
<!--            <div class="modal-body">-->
<!--                <p>Modal body text goes here.</p>-->
<!--            </div>-->
<!--            <div class="modal-footer">-->
<!--                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>-->
<!--                <button type="button" class="btn btn-primary">Save changes</button>-->
<!--            </div>-->
<!--        </div>-->
    </div>
</div>

<style>
    :global(.modal-backdrop.show) {
        opacity: 0.85 !important;
    }

    .lightbox {
        display: flex;
        gap: 0.5rem;
    }

    .lightbox-item {
        transition: opacity 100ms ease;
    }

    .lightbox-item:hover {
        opacity: 0.9;
    }

    .lightbox-item img {
        height: 150px;
    }

    .carousel {
        height: 100%;
    }

    .modal-content {
        background-color: transparent;
    }

    .carousel-inner {
        display: flex;
        justify-items: center;
        height: 100%;
        /*background: blue;*/
    }

    .carousel-item div {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .carousel-item div img, .carousel-item div video {
        max-height: 100%;
        max-width: 100%;
    }

    .carousel-control-close {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10;
    }
</style>