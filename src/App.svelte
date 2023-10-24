<script>
  import 'bootstrap-icons/font/bootstrap-icons.css'
  import 'bootstrap/dist/css/bootstrap.css'

  import SelectMultiple from "./lib/SelectMultiple.svelte";

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
    console.log("value changed", ev)
  }
</script>

<main>

  <form method="get" action="/test">
    <div class="d-flex gap-3">
      <SelectMultiple options={states} selectedItems={[4]} on:change={valueChanged} />
    </div>

    <div class="mt-3">
      <button type="submit">Go!</button>
    </div>
  </form>

</main>
