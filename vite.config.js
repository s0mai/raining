import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import injectBodyPlugin from './vite-plugin-inject-body.js'

export default defineConfig({
    plugins: [react(), injectBodyPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5174,
        host: true,
        open: true
    },
    build: {
        outDir: 'dist'
    }
})
