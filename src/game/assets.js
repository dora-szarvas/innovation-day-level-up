// Art is looked up by file name (no extension), so scene-config.json can name any
// image dropped into src/assets/scenes/, src/assets/cast/ or src/assets/posters/ without code changes.
// (Vite needs the glob options written inline, as literals.)
const byName = (files) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]))

export const SCENES = byName(
  import.meta.glob('../assets/scenes/*.{webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' }),
)
export const CAST = byName(import.meta.glob('../assets/cast/*.{webp,png}', { eager: true, query: '?url', import: 'default' }))
export const POSTERS = byName(import.meta.glob('../assets/posters/*.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' }))
