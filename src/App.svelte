<script>
    import 'bootstrap-icons/font/bootstrap-icons.css'
    import 'bootstrap/dist/css/bootstrap.css'

    import Select from "./lib/Select.svelte";
    import UploadFolder from "./lib/UploadFolder.svelte";
    import ImageUpload from "./lib/ImageUpload.svelte";

    let imageUploadDialog
    let imageUploadComponent
    let imageUploaded = false

    function handleUploadComplete() {
        imageUploadDialog.close()
        imageUploadComponent.$destroy() // free some memory
        imageUploaded = true
    }

    const states = [
        {label: "California", value: 1},
        {label: "Arizona", value: 2},
        {label: "New York", value: 3},
        {label: "Texas", value: 4},
        {label: "Maryland", value: 5},
        {label: "North Dakota", value: 6},
        {label: "South Dakota", value: 7}
    ]

    function valueChanged(ev) {
        // console.log("value changed", ev)
    }

    function filesSelected(ev) {
        console.log("changed: ", ev.detail.fileList)
    }
</script>

<main>
    <div class="row mb-5">
        <h1>ImageUpload dialog</h1>

        <div class="d-flex align-items-center justify-content-center gap-2">
            {#if imageUploaded}
                <div class="bg-success-subtle d-flex align-items-center px-3">
                    <i class="bi bi-check-lg text-success fs-3 me-2"></i>
                    <span>Uploaded</span>
                </div>
            {:else}
                <button on:click={() => imageUploadDialog.showModal()}>click me</button>
            {/if}
        </div>
    </div>

<!--    <form method="post" action="/test" class="container">-->
<!--        <div class="row mb-5">-->
<!--            <h1>Select component</h1>-->
<!--            <div class="col-3">-->
<!--                <label for="single">Single</label>-->
<!--                <Select id="single" name="abc" options={states} selectedItems={[4]} on:change={valueChanged}/>-->
<!--            </div>-->
<!--            <div class="col-5">-->
<!--                <label for="multiple">Multiple</label>-->
<!--                <Select id="multiple" name="def" options={states} selectedItems={[4,3]} multiple={true}-->
<!--                        on:change={valueChanged}/>-->
<!--            </div>-->
<!--            <div class="col-4">-->
<!--                <label for="multiple">Multiple error</label>-->
<!--                <Select id="multiple" name="ghi" errors={true}-->
<!--                        options={states} selectedItems={[4,3]} multiple={true} on:change={valueChanged}/>-->
<!--            </div>-->
<!--        </div>-->

<!--        <div class="row mb-5">-->
<!--            <h1>UploadFolder component</h1>-->
<!--            <div class="col-auto">-->
<!--                <UploadFolder id="upload1" on:change={filesSelected}/>-->
<!--            </div>-->
<!--            <div class="col-7">-->
<!--                <UploadFolder id="upload2" message="Another message, should still work fine" on:change={filesSelected}/>-->
<!--            </div>-->
<!--        </div>-->
<!--    </form>-->
</main>

<dialog bind:this={imageUploadDialog}>
    <div style="min-width: 60rem">
        <ImageUpload bind:this={imageUploadComponent}
                     galleryUrl="/1/images"
                     upload={{url:"/1/images", params: {a:"b"}}}
                     on:uploadComplete={handleUploadComplete}/>
    </div>
</dialog>