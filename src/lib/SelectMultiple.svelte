<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher()

    export let options = []
    export let selectedItems = []

    let inputValue = ''
    let currentIndex = null

    let inputElement = null

    $: initialOptions = options.filter((elem) => !selectedItems.includes(elem.value))
    $: filteredResults = inputValue.length === 0 ? initialOptions : initialOptions.filter(match(inputValue))
    $: inputValue, currentIndex = 0

    function match(inputValue) {
        return (element) => element.label.toLowerCase().includes(inputValue.toLowerCase())
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
            dispatch('change', {value: selectedItems})
        }
        inputElement.focus()
    }

    function removeLastItem() {
        selectedItems.pop()
        selectedItems = selectedItems
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

<div class="text-start" style="width: 45em">
    <input type="hidden" name="items" value={selectedItems} />

    <div class="select">
        <div class="input-element input-group">
            {#each selectedItems.map((value) => options.find((elem) => elem.value === value)) as item}
                <button type="button" class="btn btn-sm d-flex align-items-center bg-primary-subtle">
                    <span class="flex-shrink-0">{item.label}</span>
                    <i class="bi bi-x-lg ms-2" role="button" tabindex="0"
                       on:click={() => removeItem(item)}></i>
                </button>
            {/each}

            <input type="text" class="form-control"
                   bind:this={inputElement} bind:value={inputValue}
                   on:beforeinput={handleBeforeInput} on:keydown={handleKey}
                   on:blur={() => inputValue = ''}>
        </div>

        <div class="dropdown border border-top-0 p-2 position-absolute" style="width: 45em" tabindex="-1">
            <ul class="list-unstyled mb-0" tabindex="-1"
                style="height: 10.75em; overflow-y: scroll">
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
    </div>
</div>

<style>
    .select {
        border: var(--bs-border-width) solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
    }

    .select:focus-within {
        color: var(--bs-body-color);
        background-color: var(--bs-body-bg);
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .input-element input {
        border: none;
        outline: none;
        box-shadow: 0 0 0 0;

        min-width: 10rem;
        background-color: transparent;

        padding-left: 0.5rem;
    }

    .input-element button {
        margin: 0.15rem 0 0.15rem 0.3rem !important;
        border-radius: var(--bs-border-radius) !important;
    }

    .select .dropdown {
        display: none;
    }

    .select:focus-within .dropdown {
        display: block;
    }

    .dropdown ul {
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
</style>