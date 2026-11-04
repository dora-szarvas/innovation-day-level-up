/*
 * Placeholder sounds, synthesised with Web Audio (ported from the reference build).
 * To use recorded files, drop them in src/assets/sounds/ with the same names
 * (wheels, hornFar, hornNear, click, clack, door, steps, cups, tunnel, scrape,
 * brakes, right, wrong, line) — a file, when present, replaces the synth.
 * Sound is optional: everything works with it off.
 */
const files = import.meta.glob('../assets/sounds/*.{mp3,ogg,wav,m4a}', { eager: true, query: '?url', import: 'default' })
const FILE_URLS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)

let ctx = null
let master = null
let on = true
let wheelsTimer = null
let wheelsAudio = null
const listeners = new Set()

const init = () => {
  if (ctx) return
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  } catch {
    ctx = null
  }
}
const noise = (dur) => {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource()
  s.buffer = b
  return s
}
const env = (node, t0, a, peak, hold, rel) => {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + a)
  g.gain.setValueAtTime(peak, t0 + a + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + rel)
  node.connect(g)
  g.connect(master)
  return g
}
const burst = (t, dur, freq, q, peak, type = 'bandpass') => {
  const n = noise(dur + 0.1)
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  n.connect(f)
  env(f, t, 0.005, peak, dur * 0.2, dur)
  n.start(t)
  n.stop(t + dur + 0.1)
}
const tone = (t, freq, dur, peak, type = 'sine', to = null) => {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  env(o, t, 0.02, peak, dur * 0.5, dur * 0.5)
  o.start(t)
  o.stop(t + dur + 0.1)
}
const horn = (t, peak, dur) => {
  ;[233, 277].forEach((fq) => {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = fq
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 900
    o.connect(f)
    env(f, t, 0.25, peak, dur, 0.8)
    o.start(t)
    o.stop(t + dur + 1.2)
  })
}
const sweep = (dur, type, freq, q, peak, a, hold, rel, ramp) => {
  const n = noise(dur)
  const f = ctx.createBiquadFilter()
  f.type = type
  f.Q.value = q
  const t = ctx.currentTime
  f.frequency.setValueAtTime(freq, t)
  if (ramp) f.frequency.linearRampToValueAtTime(ramp, t + 0.7)
  n.connect(f)
  env(f, t, a, peak, hold, rel)
  n.start(t)
  n.stop(t + dur)
}

const fx = {
  wheels() {
    if (wheelsTimer) return
    const tick = () => {
      if (!on || !ctx) return
      const t = ctx.currentTime
      burst(t, 0.06, 180, 1.2, 0.12)
      burst(t + 0.14, 0.06, 160, 1.2, 0.1)
    }
    tick()
    wheelsTimer = setInterval(tick, 900)
  },
  hornFar: () => horn(ctx.currentTime, 0.03, 1.4),
  hornNear: () => horn(ctx.currentTime, 0.09, 1.2),
  click: () => burst(ctx.currentTime, 0.03, 3000, 4, 0.15),
  clack() {
    const t = ctx.currentTime
    burst(t, 0.08, 900, 2, 0.6)
    burst(t + 0.06, 0.12, 500, 1, 0.4)
  },
  door: () => sweep(1, 'bandpass', 400, 2, 0.18, 0.05, 0.5, 0.3, 1400),
  steps() {
    const t = ctx.currentTime
    for (let i = 0; i < 4; i++) burst(t + i * 0.38, 0.07, 140, 1, 0.35, 'lowpass')
  },
  cups() {
    const t = ctx.currentTime
    ;[2400, 3100, 2700].forEach((f, i) => tone(t + i * 0.35, f, 0.25, 0.04))
  },
  tunnel: () => sweep(4.5, 'lowpass', 350, 1, 0.5, 1.2, 1.8, 1.4),
  scrape: () => sweep(0.6, 'bandpass', 700, 6, 0.25, 0.05, 0.3, 0.2),
  brakes: () => sweep(2.6, 'highpass', 3500, 1, 0.07, 0.2, 1.4, 1),
  right() {
    const t = ctx.currentTime
    tone(t, 660, 0.18, 0.08)
    tone(t + 0.12, 880, 0.3, 0.08)
  },
  wrong: () => tone(ctx.currentTime, 300, 0.45, 0.07, 'triangle', 200),
  line: () => tone(ctx.currentTime, 1200, 0.05, 0.015),
}

function playFile(name) {
  const a = new Audio(FILE_URLS[name])
  if (name === 'wheels') {
    if (wheelsAudio) return
    a.loop = true
    wheelsAudio = a
  }
  a.play().catch(() => {})
}

export const Snd = {
  play(name) {
    if (!on) return
    if (FILE_URLS[name]) return playFile(name)
    init()
    if (!ctx || !fx[name]) return
    if (ctx.state === 'suspended') ctx.resume()
    try {
      fx[name]()
    } catch {
      /* placeholder synth: never block the story */
    }
  },
  stopWheels() {
    clearInterval(wheelsTimer)
    wheelsTimer = null
    wheelsAudio?.pause()
    wheelsAudio = null
  },
  toggle() {
    on = !on
    if (!on) this.stopWheels()
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
