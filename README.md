# Web user interface components

This project provides several user interface components used in our projects, including:
- `select-component`: a multi-select dropdown component with autocomplete
- `upload-folder`: upload folder component, allows user to select a folder on their computer 
to upload and gives access to all files within that folder

## How to install

Clone the GitHub repository:

```
git clone https://github.com/kigun-org/ui-components
```

```
npm install
npm run dev
```

The app should be running locally at: https://localhost:5173/.

## Testing

### Unit tests

Tests are located in `src/lib/` and named after the components they test:
e.g., `Select.test.js` tests the `Select` component.

To run the tests:
```
npm run test
```

### E2E tests with Playwright

Tests are located in `tests/`.
To run end to end tests with Playwright:

```
npx playwright test
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).