<svelte:options customElement={{tag: "lightbox-gallery", shadow: 'none'}} />
<script lang="ts">
    import LightboxModal from "./Lightbox/LightboxModal.svelte";

    export let items: []

    let modal: LightboxModal
</script>

<div class="gallery">
    {#each items as item, index}
        <div class="gallery-item">
            <img src={item.thumbnail} alt="Thumbnail" on:click={() => { modal.showModal(index) }} />
        </div>
    {/each}
</div>
<LightboxModal bind:this={modal} {items} />

<style>
    .gallery {
        display: flex;
        gap: 0.5rem;
    }

    .gallery-item {
        transition: opacity 100ms ease;
    }

    .gallery-item:hover {
        opacity: 0.9;
    }

    .gallery-item img {
        height: 150px;
    }
</style>