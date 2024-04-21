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
            ],
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        return 'common'
                    }
                }
            }
        },
        lib: {
            entry: [
                resolve(__dirname, 'src/lib/Lightbox.svelte'),
                resolve(__dirname, 'src/lib/Select.svelte'),
                resolve(__dirname, 'src/lib/UploadFolder.svelte'),
            ],
            formats: ['es'],
            fileName: (_, entryAlias) => `${entryAlias}.js`,
        }
    }
})
