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

        modal = new Modal(modalElement, {})
        modalElement.addEventListener('shown.bs.modal', () => {
            if (nextElement !== undefined) {
                nextElement.focus()
            }
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

<div bind:this={modalElement} class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-fullscreen p-lg-3">
        <div class="modal-content">
            <div bind:this={carouselElement} class="carousel slide">
                <div class="carousel-inner">
                    {#if modalVisible}
                        {#each items as item, index}
                            <div class="carousel-item" class:active={selectedItem === index}>
                                {#if item.commentsURL}
                                    <div class="comment-panel">
                                        <div class="card">
                                            <div class="row">
                                                <div class="col comment-image-panel">
                                                    {#if item.type === "image"}
                                                        <img src={item.url} alt="">
                                                    {:else if item.type === "video"}
                                                        <video controls controlslist="nodownload"
                                                               poster={item.thumbnail} src={item.url}>
                                                            Your browser doesn't seem to support HTML video.
                                                        </video>
                                                    {:else if item.type === "pdf"}
                                                        <object data={item.url} type="application/pdf" title="Document">
                                                            Your browser doesn't support viewing PDFs.
                                                        </object>
                                                    {/if}
                                                </div>
                                                <div class="col-xs-12 col-lg-4">
                                                    <div class="p-3 bg-body-tertiary h-100">
                                                        {#await fetchComments(item)}
                                                            <p class="p-2">Fetching comments ...</p>
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
                                    </div>
                                {:else}
                                    <div>
                                        {#if item.type === "image"}
                                            <img src={item.url} alt="">
                                        {:else if item.type === "video"}
                                            <video controls controlslist="nodownload"
                                                   poster={item.thumbnail} src={item.url}>
                                                Your browser doesn't seem to support HTML video.
                                            </video>
                                        {:else if item.type === "pdf"}
                                            <object data={item.url} type="application/pdf" title="Document">
                                                Your browser doesn't support viewing PDFs.
                                            </object>
                                        {/if}
                                    </div>
                                {/if}
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

    .carousel-item > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        height: calc(100vh - 2rem);
    }

    .comment-panel {
        padding: 0 15%;
    }

    .comment-panel .card {
        width: 100%;
        height: 100%;
        padding: calc(var(--bs-gutter-x) * 0.5);
        overflow-y: scroll;
    }

    .comment-panel .row {
        max-height: 100%;

        @media (min-width: 992px) {
            height: 100%;
        }
    }

    .comment-image-panel {
        display: flex;
        align-items: center;
        justify-content: center;

        @media (min-width: 992px) {
            height: 100%;
        }
    }

    .carousel-item img, .carousel-item video {
        max-height: 100%;
        max-width: 100%;
    }

    .carousel-item object {
        height: 100%;
        width: 100%;
    }

    .carousel-control-next, .carousel-control-prev {
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