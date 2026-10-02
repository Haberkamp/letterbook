import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import { bunny } from 'laravel-vite-plugin/fonts'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/vendor/letterbook/',
    plugins: [
        laravel({
            input: ['resources/css/letterbook.css', 'resources/js/letterbook/app.tsx'],
            hotFile: 'public/vendor/letterbook/hot',
            buildDirectory: 'build',
            refresh: true,
            fonts: [
                bunny('Inter', {
                    alias: 'sans',
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
})