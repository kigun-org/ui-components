<svelte:options customElement={{tag: "select-component", shadow: 'none'}} />
<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher()


    export let id
    export let name
    export let options = []
    export let selectedItems = []
    export let multiple = false
    export let errors = false


    let inputElement = null

    let inputValue = ''
    let currentIndex = null

    let initialOptions = []
    let filteredResults = []

    $: inputValue, currentIndex = 0
    $: initialOptions = options.filter((elem) => !selectedItems.includes(elem.value)),
        filteredResults = filterResults(inputValue, selectedItems, multiple)

    function filterResults(inputValue, selectedItems, multiple) {
        if (!multiple && selectedItems.length > 0) {
            // single selection and we already have one, no more choices
            return []
        }

        if (inputValue.length === 0) {
            return initialOptions
        } else {
            return initialOptions.filter(
                (element) => element.label.toLowerCase().includes(inputValue.toLowerCase())
            )
        }
    }

    function addItem(item) {
        if (item !== undefined) {
            if (inputValue === '') {
                if (filteredResults.length > 1) {
                    if (currentIndex === filteredResults.length - 1) {
                        currentIndex = currentIndex - 1
                    }
                } else {
                    currentIndex = null
                }
            } else {
                currentIndex = filteredResults.length > 0 ? 0 : null
                inputValue = ''
            }

            selectedItems = [...selectedItems, item.value]
            dispatch('change', {value: selectedItems})

            inputElement.focus()
        }
    }

    function removeItem(item) {
        const index = selectedItems.indexOf(item.value)
        if (index !== -1) {
            selectedItems = selectedItems.toSpliced(index, 1)
            currentIndex = 0
            dispatch('change', {value: selectedItems})
        }
        inputElement.focus()
    }

    function removeLastItem() {
        selectedItems.pop()
        selectedItems = selectedItems
        currentIndex = 0
        dispatch('change', {value: selectedItems})
    }

    function handleKey(ev) {
        if (ev.key === "ArrowDown") {
            if (currentIndex === null) {
                currentIndex = 0
            } else if (currentIndex < filteredResults.length - 1) {
                currentIndex++
            }

            if (currentIndex !== null && filteredResults.length > 0) {
                ev.target.parentElement.parentElement.querySelector('.dropdown ul').children[currentIndex].scrollIntoView({
                    block: "nearest"
                })
            }
        } else if (ev.key === "ArrowUp") {
            if (currentIndex === null && filteredResults.length > 0) {
                currentIndex = filteredResults.length - 1
            } else if (currentIndex > 0) {
                currentIndex--
            }

            if (currentIndex !== null && filteredResults.length > 0) {
                ev.target.parentElement.parentElement.querySelector('.dropdown ul').children[currentIndex].scrollIntoView({
                    block: "nearest"
                })
            }
        } else if (ev.key === "Enter") {
            ev.preventDefault()
            addItem(filteredResults[currentIndex])
        } else if (ev.key === "Escape") {
            inputElement.blur()
        } else if (ev.key === "Backspace" && ev.target.value === '') {
            removeLastItem()
        }
    }

    function handleBeforeInput(ev) {
        if (ev.inputType.includes("insert") && filteredResults.length === 0) {
            ev.preventDefault()
        }
    }
</script>

<div class="select">
    {#each selectedItems as item}
        <input type="hidden" name={name} value={item} />
    {/each}

    <div class="input-element input-group p-1 gap-1">
        {#each selectedItems.map((value) => options.find((elem) => elem.value === value)) as item}
            <button type="button" class="btn btn-sm d-flex align-items-center bg-primary-subtle"
                    on:click={() => removeItem(item)} tabindex="-1">
                <span class="flex-shrink-0">{item.label}</span>
                <i class="bi bi-x ms-1" role="button"></i>
            </button>
        {/each}

        <input type="text" id={id} class="form-control" class:is-invalid={errors}
               bind:this={inputElement} bind:value={inputValue}
               on:beforeinput={handleBeforeInput} on:keydown={handleKey}
               on:blur={() => inputValue = ''}>
    </div>

    {#if ((multiple && filteredResults.length > 0) || selectedItems.length === 0)}
    <div class="dropdown p-2 shadow-sm" tabindex="-1">
        <ul class="list-unstyled mb-0" tabindex="-1"
            style="height: {Math.min(Math.max(filteredResults.length, 0), 3) * 2}rem; overflow-y: scroll">
            {#each filteredResults as item, index}
                <li data-index={index}
                    class="d-flex align-items-center justify-content-between user-select-none"
                    class:active={currentIndex === index}
                    on:click={() => addItem(item)}>
                    <span>{item.label}</span>
                </li>
            {/each}
        </ul>
    </div>
    {/if}
</div>

<style>
    :root {
        --component-width: 30rem;
    }

    .select {
        border: var(--bs-border-width) solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);

        position: relative;

        text-align: start;
    }

    .select:focus-within {
        color: var(--bs-body-color);
        background-color: var(--bs-body-bg);
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .select .dropdown {
        display: none;
    }

    .select:focus-within .dropdown {
        display: block;
    }

    .input-element input {
        border: none;
        outline: none;
        box-shadow: 0 0 0 0;

        min-width: 10rem;
        background-color: transparent;

        padding-left: 0.25rem;
    }

    .input-element button {
        border-radius: var(--bs-border-radius) !important;
    }

    .dropdown {
        position: absolute;
        width: 100%;

        margin-top: 0.5rem;
        background-color: white;
    }

    .dropdown li {
        padding: 0.25rem 0.5rem
    }

    .dropdown li:hover {
        background-color: rgba(var(--bs-secondary-rgb), 0.05)
    }

    .dropdown li.active {
        background-color: rgba(var(--bs-secondary-rgb), 0.10)
    }

    .dropdown li.active:hover {
        background-color: rgba(var(--bs-secondary-rgb), 0.12)
    }
</style>