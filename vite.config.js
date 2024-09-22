import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import inject from '@rollup/plugin-inject'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            // example redirects
            '/1/images': 'http://localhost:8000',
            '^/data/.*': 'http://localhost:8000/',
        }
    },
    plugins: [
        svelte(),
        inject({
            bootstrap: 'bootstrap/dist/js/bootstrap.bundle.min'
        })
    ],
    build: {
        rollupOptions: {
            output: {
                globals: {
                    bootstrap: 'bootstrap'
                }
            }
        }
    }
})
