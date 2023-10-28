<script>
  import 'bootstrap-icons/font/bootstrap-icons.css'
  import 'bootstrap/dist/css/bootstrap.css'

  import Select from "./lib/Select.svelte";

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
</script>

<main>

  <form method="post" action="/test" class="container">
    <div class="row">
      <div class="col-3">
        <label for="single">Single</label>
        <Select id="single" name="abc" options={states} selectedItems={[4]} on:change={valueChanged} />
      </div>
      <div class="col-5">
        <label for="multiple">Multiple</label>
        <Select id="multiple" name="def" options={states} selectedItems={[4,3]} multiple={true} on:change={valueChanged} />
      </div>
      <div class="col-4">
        <label for="multiple">Multiple error</label>
        <Select id="multiple" name="ghi" errors={true}
                options={states} selectedItems={[4,3]} multiple={true} on:change={valueChanged} />
      </div>
    </div>

    <div class="mt-3">
      <button type="submit">Go!</button>
    </div>
  </form>

</main>
