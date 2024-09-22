import {defineConfig} from 'vite'
import {resolve} from 'path'
import {svelte} from '@sveltejs/vite-plugin-svelte'

let entries = [
    resolve(__dirname, 'src/lib/Lightbox.svelte'),
    resolve(__dirname, 'src/lib/Select.svelte'),
]

const customArgIndex = process.argv.indexOf('--')
if (customArgIndex > 0 && process.argv.length >= customArgIndex) {
    console.log("argument")
    entries = [
        resolve(__dirname, `src/lib/${process.argv.splice(customArgIndex + 1)}.svelte`)
    ]
}

// https://vitejs.dev/config/
export default defineConfig({
    base: '/static/ui-components/',
    publicDir: false,
    plugins: [
        svelte({
                compilerOptions: {
                    customElement: true
                }
            }
        )
    ],
    build: {
        emptyOutDir: entries.length > 1,
        rollupOptions: {
            output: {
                manualChunks:
                    entries.length > 1 ? (id) => {
                        if (id.includes('node_modules')) {
                            return 'common'
                        }
                    } : undefined,
                globals: {
                    bootstrap: 'bootstrap'
                }
            }
        },
        lib: {
            entry: entries,
            formats: ['es'],
            fileName: (_, entryAlias) => `${entryAlias}.js`,
        }
    }
})
