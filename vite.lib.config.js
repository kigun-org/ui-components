import {defineConfig} from 'vite'
import {resolve} from 'path'
import {svelte} from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/static/ui-components/',
    publicDir: false,
    plugins: [svelte({
            compilerOptions: {
                customElement: true
            }
        }
    )],
    build: {
        rollupOptions: {
            external: [
                'bootstrap/dist/css/bootstrap.css',
                'bootstrap-icons/font/bootstrap-icons.css'
            ]
        },
        lib: {
            entry: [
                resolve(__dirname, 'src/lib/Select.svelte'),
                resolve(__dirname, 'src/lib/UploadFolder.svelte'),
                resolve(__dirname, 'src/lib/ImageEditor.svelte'),
            ],
            formats: ['es'],
            fileName: (_, entryAlias) => `${entryAlias}.js`,
        }
    }
})
