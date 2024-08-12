<script lang="ts">
    export let item
</script>

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

<style>
    img, video {
        max-height: 100%;
        max-width: 100%;
    }

    object {
        height: 100%;
        width: 100%;
    }
</style>