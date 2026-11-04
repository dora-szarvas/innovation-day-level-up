/*
 * Voice lines. A step in story.json names its recording with "vo" (e.g. "vo-narrator-01");
 * the file lives in src/assets/voice/ under that name. Lines that land back to back play
 * in order; when the player acts (Continue, a choice, a check) the queue is cleared, so a
 * voice never talks over what comes next. Voice is optional: the text panel is the caption.
 */
const files = import.meta.glob('../assets/voice/*.{m4a,mp3,ogg,wav}', { eager: true, query: '?url', import: 'default' })
const URLS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)

let on = true
let current = null
const queue = []
const listeners = new Set()
let idleWaiters = []
const settleIdle = () => {
  idleWaiters.forEach((r) => r())
  idleWaiters = []
}

function next() {
  current = null
  const id = queue.shift()
  if (!id || !on) return settleIdle()
  const a = new Audio(URLS[id])
  current = a
  a.onended = next
  a.onerror = next
  a.play().catch(next)
}

export const Voice = {
  has: (id) => !!URLS[id],
  get busy() {
    return !!current || queue.length > 0
  },
  play(id) {
    if (!on || !URLS[id]) return
    queue.push(id)
    if (!current) next()
  },
  /** Stop the line that's playing and drop anything queued. */
  stop() {
    queue.length = 0
    if (current) {
      current.onended = null
      current.pause()
      current = null
    }
    settleIdle()
  },
  /** Resolves once nothing is playing or queued (straight away if idle). */
  whenIdle() {
    if (!current && !queue.length) return Promise.resolve()
    return new Promise((r) => idleWaiters.push(r))
  },
  toggle() {
    on = !on
    if (!on) this.stop()
    listeners.forEach((l) => l(on))
    return on
  },
  get on() {
    return on
  },
  subscribe(l) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}
