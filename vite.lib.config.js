import {defineConfig} from 'vite'
import {resolve} from 'path'
import {svelte} from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/static/eos/',
    plugins: [svelte({
            compilerOptions: {
                customElement: true
            }
        }
    )],
    build: {
        // keep function names
        // minify: "terser",
        // terserOptions: {
        //     keep_fnames: true,
        // },
        rollupOptions: {
            external: [
                'bootstrap/dist/css/bootstrap.css',
                'bootstrap-icons/font/bootstrap-icons.css'
            ]
        },
        lib: {
            entry: [
                resolve(__dirname, 'src/lib/Select.svelte'),
            ],
            formats: ['es'],
            fileName: (_, entryAlias) => `${entryAlias}.js`,
        }
    }
})
