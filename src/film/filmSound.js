/*
 * Film-only sounds: whoosh (big transitions), blip (library cards), tap (cursor clicks)
 * and sting. Synthesised placeholders, like the game's own; a file in
 * src/assets/sounds/ with the same name (e.g. whoosh.mp3) is used instead when present.
 * Game sounds (horn, wheels, wrong, line…) go through the game's own Snd module, and
 * sounds named vo-… play that voice recording from src/assets/voice/.
 */
import { Snd } from '../game/sound.js'

const files = import.meta.glob('../assets/sounds/*.{mp3,ogg,wav,m4a}', { eager: true, query: '?url', import: 'default' })
const FILE_URLS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)

const voiceFiles = import.meta.glob('../assets/voice/*.{m4a,mp3,ogg,wav}', { eager: true, query: '?url', import: 'default' })
const VOICE_URLS = Object.fromEntries(
  Object.entries(voiceFiles).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)
const playing = new Set()

let ctx = null
let master = null
let enabled = true

function init() {
  if (ctx) return
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0.7
  master.connect(ctx.destination)
}

function noise(dur) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource()
  s.buffer = b
  return s
}

function envelope(node, t, attack, peak, release) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release)
  node.connect(g)
  g.connect(master)
}

function tone(t, freq, dur, peak, type = 'sine', to) {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  envelope(o, t, 0.008, peak, dur)
  o.start(t)
  o.stop(t + dur + 0.05)
}

const SYNTH = {
  // A short airy sweep: band-passed noise rising, then falling away.
  whoosh() {
    const t = ctx.currentTime
    const n = noise(0.7)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 1.4
    f.frequency.setValueAtTime(320, t)
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.28)
    f.frequency.exponentialRampToValueAtTime(700, t + 0.6)
    n.connect(f)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.22)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62)
    f.connect(g)
    g.connect(master)
    n.start(t)
    n.stop(t + 0.7)
  },
  blip() {
    tone(ctx.currentTime, 1250, 0.07, 0.035, 'sine', 1650)
  },
  tap() {
    const t = ctx.currentTime
    const n = noise(0.05)
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 2200
    n.connect(f)
    envelope(f, t, 0.002, 0.09, 0.04)
    n.start(t)
    n.stop(t + 0.05)
  },
  // A bright rising chord with a soft shimmer on top.
  sting() {
    const t = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(t + i * 0.045, f, 1.6, 0.05, 'triangle'))
    tone(t + 0.2, 2093, 1.2, 0.012, 'sine')
  },
}

export const FilmSound = {
  setEnabled(on) {
    enabled = on
    if (!on) this.stopAll()
  },
  /** Call from the Start click so the browser lets audio play. */
  unlock() {
    if (!enabled) return
    init()
    if (ctx.state === 'suspended') ctx.resume()
  },
  play(name) {
    if (!enabled) return
    if (name === 'stopWheels') return Snd.stopWheels()
    if (VOICE_URLS[name]) {
      const a = new Audio(VOICE_URLS[name])
      playing.add(a)
      a.onended = () => playing.delete(a)
      a.play().catch(() => playing.delete(a))
      return
    }
    if (SYNTH[name]) {
      if (FILE_URLS[name]) return void new Audio(FILE_URLS[name]).play().catch(() => {})
      init()
      try {
        SYNTH[name]()
      } catch {
        /* never let a sound stop the take */
      }
      return
    }
    Snd.play(name) // game sounds: files from src/assets/sounds/ if present, else the game's synth
  },
  stopAll() {
    Snd.stopWheels()
    playing.forEach((a) => a.pause())
    playing.clear()
  },
}
