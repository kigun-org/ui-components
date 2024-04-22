<svelte:options customElement={{tag: "lightbox-gallery", shadow: 'none'}}/>
<script lang="ts">
    import {Modal, Carousel} from "bootstrap";
    import {onMount} from "svelte";

    export let items: any[] = []

    export let gallery: string

    let selectedItem: number

    let modal
    let modalElement: HTMLDivElement
    let modalVisible: boolean = false  // do not show (or download) items until the modal is visible

    let carousel
    let carouselElement: HTMLDivElement
    let nextElement: HTMLButtonElement

    function showModal(index: number): void {
        selectedItem = index
        modal.show()
        modalVisible = true
    }

    onMount(() => {
        document.querySelectorAll(`[data-gallery="${gallery}"]`).forEach((el, index) => {
            el.addEventListener('click', (ev) => {
                ev.preventDefault()
                showModal(index)
            })

            let mediaType = "image"
            if (el.dataset.type === "video") {
                mediaType = "video"
            }

            items.push({
                type: mediaType,
                url: el.getAttribute('href'),
                thumbnail: el.firstElementChild.getAttribute('src')
            })
        })

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
</script>

<div bind:this={modalElement} class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-fullscreen p-lg-3">
        <div class="modal-content">
            <div bind:this={carouselElement} class="carousel slide" id="carouselExample">
                <div class="carousel-inner">
                    {#if modalVisible}
                        {#each items as item, index}
                            <div class="carousel-item" class:active={selectedItem === index}>
                                {#if item.type === "image"}
                                    <div>
                                        <img src={item.url} alt="">
                                    </div>
                                {:else if item.type === "video"}
                                    <div>
                                        <video controls controlslist="nodownload"
                                               poster={item.thumbnail} src={item.url}>
                                            Your browser doesn't seem to support HTML video.
                                        </video>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
                <button class="carousel-control-prev" on:click={() => carousel.prev()} type="button">
                    <span aria-hidden="true" class="carousel-control-prev-icon"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button bind:this={nextElement} class="carousel-control-next" on:click={() => carousel.next()}
                        type="button">
                    <span aria-hidden="true" class="carousel-control-next-icon"></span>
                    <span class="visually-hidden">Next</span>
                </button>
                <div class="carousel-control-close p-4 p-lg-3" data-bs-theme="dark">
                    <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
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
    /*.modal-backdrop.show {*/
    /*    opacity: 0.85 !important;*/
    /*}*/

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