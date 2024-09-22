<svelte:options customElement={{tag: "lightbox-gallery", shadow: 'none'}}/>
<script lang="ts">
    import {onMount} from "svelte";
    import ItemComponent from "./ItemComponent.svelte";

    export let items: any[] = []

    export let gallery: string

    export let pdfjs: string | undefined = undefined;

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

    function fetchComments(item): Promise<string> {
        return fetch(item.commentsURL).then((resp) => resp.text())
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
            } else if (el.dataset.type === "pdf") {
                mediaType = "pdf"
            }

            let item = {
                type: mediaType,
                url: el.getAttribute('href'),
                commentsURL: el.dataset.commentsUrl,
                thumbnail: el.firstElementChild.getAttribute('src')
            }

            items.push(item)
        })

        modal = new bootstrap.Modal(modalElement, {})
        modalElement.addEventListener('shown.bs.modal', () => {
            if (nextElement !== undefined) {
                nextElement.focus()
            }
        })
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalVisible = false
        })

        carousel = new bootstrap.Carousel(carouselElement, {})
        carouselElement.addEventListener('slide.bs.carousel', () => {
            // pause all videos when sliding through carousel
            document.querySelectorAll('video').forEach((video) => {
                video.pause()
            })
        })
    })

    // https://stackoverflow.com/questions/2592092/executing-script-elements-inserted-with-innerhtml
    function setInnerHtml(elm, html) {
        elm.innerHTML = html;
        Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes)
                .forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    function processResponse(node, response) {
        setInnerHtml(node, response)

        if (typeof htmx !== 'undefined') {
            htmx.process(node)
        }
    }
</script>

<div class="modal fade" bind:this={modalElement} tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
            <div class="carousel-container">
                <div class="carousel slide" bind:this={carouselElement}>
                    <div class="carousel-inner">
                        {#if modalVisible}
                            {#each items as item, index}
                                <div class="carousel-item" class:active={selectedItem === index}>
                                    <div class="item-container">
                                        {#if item.commentsURL}
                                            <div class="card">
                                                <div class="row g-0">
                                                    <div class="col-xs-12 col-lg-8">
                                                        <ItemComponent item={item} pdfjs={pdfjs} />
                                                    </div>
                                                    <div class="col-xs-12 col-lg-4">
                                                        <div class="p-3 bg-body-tertiary h-100">
                                                            {#await fetchComments(item)}
                                                                <div class="p-2 d-flex flex-column align-items-center gap-3">
                                                                    <div class="spinner-border" role="status">
                                                                        <span class="visually-hidden">Loading...</span>
                                                                    </div>
                                                                    <h4>
                                                                        Fetching comments
                                                                    </h4>
                                                                </div>
                                                            {:then response}
                                                                <div use:processResponse={response}></div>
                                                            {:catch error}
                                                                <p class="p-2 bg-danger-subtle text-danger-emphasis">
                                                                    Could not fetch comments:<br>
                                                                    {error.message}
                                                                </p>
                                                            {/await}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        {:else}
                                            <ItemComponent item={item} pdfjs={pdfjs} />
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    {#if items.length > 1}
                        <button class="carousel-control-prev" on:click={() => carousel.prev()} type="button">
                            <span aria-hidden="true" class="carousel-control-prev-icon"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button bind:this={nextElement} class="carousel-control-next" on:click={() => carousel.next()}
                                type="button">
                            <span aria-hidden="true" class="carousel-control-next-icon"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    {/if}
                    <div class="carousel-control-close" data-bs-theme="dark">
                        <button aria-label="Close" class="btn-close p-4" data-bs-dismiss="modal" type="button"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .modal-content {
        background-color: transparent;
    }

    /*.modal-backdrop.show {*/
    /*    opacity: 0.85 !important;*/
    /*}*/

    .carousel-container,
    .carousel,
    .carousel-inner,
    .carousel-item,
    .item-container {
        height: 100%;
    }

    .item-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .item-container > .card {
        padding: 1rem;

        width: calc(100% - 2 * max(5%, 50px));
        height: 95%;
    }

    .card .row {
        overflow-y: scroll;

        @media (min-width: 992px) {
            height: 100%;
        }
    }

    .card .col-lg-8 {
        display: flex;
        align-items: center;
        justify-content: center;

        max-height: 80vh;

        @media (min-width: 992px) {
            max-height: 100%;
        }
    }

    .carousel-control-next, .carousel-control-prev {
        width: max(5%, 50px);
        top: 30vh;
        bottom: 30vh;
        transition: opacity .15s ease, background-color .15s ease;
    }

    .carousel-control-next:focus, .carousel-control-next:hover,
    .carousel-control-prev:focus, .carousel-control-prev:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .carousel-control-close {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10;
    }

    .carousel-control-close button {
        transition: opacity .15s ease, background-color .15s ease;
    }

    .carousel-control-close button:focus, .carousel-control-close button:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>