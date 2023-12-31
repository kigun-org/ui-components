import { render, screen } from "@testing-library/svelte";
import '@testing-library/jest-dom/vitest'

import Select from "./Select.svelte";

describe("Select component tests", () => {
    test("options are listed in dropdown", () => {
        const options = [
            {label: "California", value: 1},
            {label: "Arizona", value: 2},
            {label: "New York", value: 3},
            {label: "Texas", value: 4},
            {label: "Maryland", value: 5},
            {label: "North Dakota", value: 6},
            {label: "South Dakota", value: 7}
        ]

        render(Select, { props: { options: options } })

        expect(screen.getByText("South Dakota")).toBeInTheDocument()
    })
})
