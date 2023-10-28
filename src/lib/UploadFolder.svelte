<svelte:options customElement={{tag: "upload-folder", shadow: 'none'}} />
<script>
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher()

    export let id

    export let message = "Click to select a folder or drop a folder here"

    onMount(() => {
        // const formElement = document.getElementById(id)
        const inputElement = document.querySelector(`#${id} input`)
        const labelElement = document.querySelector(`#${id} label`)

        inputElement.addEventListener('change', (event) => {
            const fileList = event.target.files || event.dataTransfer.files
            dispatch('change', {fileList: fileList})
        })

        labelElement.addEventListener('drop', (ev) => {
            // Prevent default behavior (Prevent file from being opened)
            ev.preventDefault()

            if (ev.dataTransfer.files.length === 1) {
                const item = ev.dataTransfer.items[0].webkitGetAsEntry()
                if (item.isDirectory) {
                    const reader = item.createReader()
                    const entryPromises = []
                    reader.readEntries((entries) => {
                        const entryPromise = (entry) => new Promise((resolve, reject) => {
                            entry.file(resolve, reject)
                        })
                        entries.forEach((entry) => {
                            entryPromises.push(entryPromise(entry))
                        })
                        Promise.all(entryPromises).then((files) => {
                            dispatch('change', {fileList: files})
                        })
                    })
                }
            } else {
                dispatch('change', {fileList: ev.dataTransfer.files})
            }

            ev.target.classList.remove('active')
        })

        labelElement.addEventListener('dragover', (ev) => {
            // Prevent default behavior (Prevent file from being opened)
            ev.preventDefault()
        })

        labelElement.addEventListener('dragenter', (ev) => {
            ev.target.classList.add('active')
        })

        labelElement.addEventListener('dragleave', (ev) => {
            ev.target.classList.remove('active')
        })
    })
</script>

<form {id} enctype="multipart/form-data" class="upload">
    <!--{% csrf_token %}-->
    <input id={`${id}_input`} type="file" webkitdirectory directory />
    <label for={`${id}_input`}>
        <i class="bi bi-upload fs-4"></i>
        <span>{message}</span>
    </label>
</form>

<style>
    input {
        display: none;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 2rem;

        color: var(--bs-secondary);
        background-color: rgba(var(--bs-secondary-rgb), 0.05);
        border: 3px dotted rgba(var(--bs-secondary-rgb), 0.1);
        transition: color 300ms, background-color 300ms, border-color 300ms;
    }

    label.active, label:hover {
        color: var(--bs-primary);
        background-color: rgba(var(--bs-primary-rgb), 0.2);
        border-color: rgba(var(--bs-primary-rgb), 0.3);
    }
</style>