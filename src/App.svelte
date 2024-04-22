<script>
    import 'bootstrap-icons/font/bootstrap-icons.css'
    import 'bootstrap/dist/css/bootstrap.css'

    import Lightbox from "./lib/Lightbox.svelte";
    import Select from "./lib/Select.svelte";
    import UploadFolder from "./lib/UploadFolder.svelte";

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

    // let galleryItems = [
    //     {
    //         "id": 1,
    //         "type": "image",
    //         "url": "https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //         "thumbnail": "https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&h=300"
    //     },
    //     {
    //         "id": 2,
    //         "type": "image",
    //         "url": "https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //         "thumbnail": "https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&h=300"
    //     },
    //     {
    //         "id": 3,
    //         "type": "image",
    //         // "url": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //         "url": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300",
    //         "thumbnail": "https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300"
    //     },
    //     {
    //         "id": 4,
    //         "type": "video",
    //         "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    //         "thumbnail": "https://peach.blender.org/wp-content/themes/bf-bunny/graphics/header1.jpg"
    //     }
    // ]
</script>

<main>
    <div class="row">
        <a href="https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
           data-toggle="lightbox" data-gallery="example-gallery" class="col-sm-4">
            <img src="https://images.unsplash.com/photo-1712679408447-3245b6bc7c16?q=80&h=300" class="img-fluid">
        </a>
        <a href="https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
           data-toggle="lightbox" data-gallery="example-gallery" class="col-sm-4">
            <img src="https://images.unsplash.com/photo-1706459733269-8bbe4152ec3f?q=80&h=300" class="img-fluid">
        </a>
        <a href="https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300"
           data-toggle="lightbox" data-gallery="example-gallery" class="col-sm-4">
            <img src="https://images.unsplash.com/photo-1706606992618-9108da774e75?q=80&h=300" class="img-fluid">
        </a>
        <a href="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
           data-toggle="lightbox" data-gallery="example-gallery" data-type="video" class="col-sm-4">
            <img src="https://peach.blender.org/wp-content/themes/bf-bunny/graphics/header1.jpg" class="img-fluid">
        </a>
    </div>

    <Lightbox gallery="example-gallery" />

    <hr>

    <form method="post" action="/test" class="container">
        <div class="row mb-5">
            <h1>Select component</h1>
            <div class="col-3">
                <label for="single">Single</label>
                <Select id="single" name="abc" options={states} selectedItems={[4]} on:change={valueChanged}/>
            </div>
            <div class="col-5">
                <label for="multiple">Multiple</label>
                <Select id="multiple" name="def" options={states} selectedItems={[4,3]} multiple={true}
                        on:change={valueChanged}/>
            </div>
            <div class="col-4">
                <label for="multiple">Multiple error</label>
                <Select id="multiple" name="ghi" errors={true}
                        options={states} selectedItems={[4,3]} multiple={true} on:change={valueChanged}/>
            </div>
        </div>

        <hr>

        <div class="row mb-5">
            <h1>UploadFolder component</h1>
            <div class="col-auto">
                <UploadFolder id="upload1" on:change={filesSelected}/>
            </div>
            <div class="col-7">
                <UploadFolder id="upload2" message="Another message, should still work fine" on:change={filesSelected}/>
            </div>
        </div>
    </form>
</main>
