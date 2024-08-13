<script lang="ts">
    export let item
    export let pdfjs: string | undefined = undefined
</script>

{#if item.type === "image"}
    <img src={item.url} alt="">
{:else if item.type === "video"}
    <video controls controlslist="nodownload"
           poster={item.thumbnail} src={item.url}>
        Your browser doesn't seem to support HTML video.
    </video>
{:else if item.type === "pdf"}
    {#if pdfjs}
        <iframe src="{pdfjs}?file={item.url}#zoom=page-fit"></iframe>
    {:else}
        <embed style="aspect-ratio: 1 / 1.25" src="{item.url}#view=FitH&zoom=FitH" type="application/pdf" />
    {/if}
{/if}

<style>
    img, video {
        max-height: 100%;
        max-width: 100%;
    }

    iframe {
        height: 100%;
        width: 100%;
        aspect-ratio: 1 / 1.14; /* Works out to portrait orientation for A4 */
    }
</style>