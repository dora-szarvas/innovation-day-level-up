import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Cookie previews are served from a subpath, not domain root.
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // Cookie previews currently serve root-level files only (nested assets/ 404).
    assetsDir: '.',
    // Film mode (film.html + its 1920×1080 stage) builds alongside the demo; index.html is unchanged.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        film: fileURLToPath(new URL('./film.html', import.meta.url)),
        filmStage: fileURLToPath(new URL('./film-stage.html', import.meta.url)),
      },
    },
  },
})
// alpha.12: icons are tree-shaken (imported per-glyph), so the old
// manualChunks / server.fs.allow / optimizeDeps workarounds are no longer needed.
