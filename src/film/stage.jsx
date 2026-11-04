/*
 * Film mode stage: the 1920×1080 frame, rendered inside an iframe so the demo's own
 * layout (vw/vh sizing, media queries) sees exactly 1920×1080 on any screen.
 *
 * The stage has no clock. The shell (shell.jsx) calls window.filmStage.setTime(t) every
 * frame, and everything here is drawn from `t` alone: React renders which screen and
 * state is showing, and one layout effect places the cameras, cursor and dissolves.
 */
import { StrictMode, memo, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import '../nebula.css'
import '../index.css'
import '../game.css'
import './film.css'
import timeline from './timeline.json'
import checks from '../data/checks.json'
import questions from '../data/questions.json'
import scene from '../data/scene-config.json'
import Library from '../screens/Library.jsx'
import { StoryPanel } from '../components/StoryPanel.jsx'
import { McqCard } from '../components/McqCard.jsx'
import { Hud } from '../components/Hud.jsx'
import { CAST, POSTERS, SCENES } from '../game/assets.js'
import { clamp01, clickState, cursorPoint, keyframeSpan, lerp, lerp2, progress, windowOpacity } from './motion.js'

const W = timeline.stage.width
const H = timeline.stage.height
const G = timeline.game

/* ---------------- time store (set by the shell) ---------------- */
let now = 0
const listeners = new Set()
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
const getTime = () => now
const useTime = () => useSyncExternalStore(subscribe, getTime)

const sceneSpan = (id) => timeline.scenes.find((s) => s.id === id)
const isOn = (id, t) => {
  const s = sceneSpan(id)
  // A scene that runs to the end of the sequence stays on for the last frame (and the end hold).
  return t >= s.from && (t < s.to || s.to >= timeline.duration)
}
/** 1 → 0 across the part of a scene that overlaps the next one (a dissolve). */
function dissolveOut(id, t) {
  const s = sceneSpan(id)
  const next = timeline.scenes.find((n) => n.from > s.from && n.from < s.to)
  if (!next) return 1
  return 1 - progress(t, next.from, s.to - next.from, 'inOut')
}

/* ---------------- targets ---------------- */
function findEl({ sel, text }, root = document) {
  const all = root.querySelectorAll(sel)
  if (!text) return all[0] ?? null
  for (const el of all) if (el.textContent.trim().includes(text)) return el
  return null
}
const centreOf = (r) => [r.left + r.width / 2, r.top + r.height / 2]
/** Screen point of a named target (searched within `root`), measured now, or null. */
function resolvePoint(name, root = document) {
  const spec = timeline.targets[name]
  if (!spec) return null
  if (spec.point) return spec.point
  if (spec.between) {
    const a = resolvePoint(spec.between[0], root)
    const b = resolvePoint(spec.between[1], root)
    return a && b ? lerp2(a, b, 0.5) : (a ?? b)
  }
  const el = findEl(spec, root)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return r.width || r.height ? centreOf(r) : null
}

/* ---------------- text panel log ---------------- */
// Lines up to t; a `clear` line empties the panel (each scene keeps its own log).
const LINE_IDS = G.lines.map((_, i) => `line-${i}`)
function visibleLines(t) {
  let shown = []
  G.lines.forEach((l, i) => {
    if (l.t > t) return
    if (l.kind === 'clear') shown = []
    else shown.push({ ...l, id: LINE_IDS[i], clearAt: nextClear(i) })
  })
  return shown
}
/** The next `clear` after line i, if any (its lines fade out over the clear's `fade`). */
function nextClear(i) {
  for (let k = i + 1; k < G.lines.length; k++) if (G.lines[k].kind === 'clear') return G.lines[k]
  return null
}
/** 0–1 visibility of a line: fade in from its time, fade out before the next clear. */
function lineOpacity(line, t) {
  const inP = progress(t, line.t, G.lineFade, 'out')
  const c = line.clearAt
  const outP = c && c.fade ? progress(t, c.t - c.fade, c.fade, 'inOut') : 0
  return inP * (1 - outP)
}

/* ---------------- screens ---------------- */
const FilmLibrary = memo(function FilmLibrary() {
  return <Library />
})

const MemoPanel = memo(StoryPanel)
const MemoMcq = memo(McqCard)
const MemoHud = memo(function FilmHud({ left }) {
  return <Hud timer={{ total: G.focusTimerMinutes * 60, left, paused: false, toggle() {} }} />
})
/** The gameplay background, drawn exactly as the game draws it (same .scene-stage maths). */
const MemoScene = memo(function FilmScene({ bg }) {
  const b = scene.backgrounds[bg]
  return (
    <div className="scene-stage" style={{ '--ar': scene.aspect, '--fx': b.focus[0], '--fy': b.focus[1], '--zoom': b.zoom ?? 1 }}>
      <img src={SCENES[b.img]} alt="" className="scene-img" draggable="false" />
    </div>
  )
})

const noop = () => {}
const CHECK = (() => {
  const c = checks.checks[G.check.key]
  const verb = G.check.showDifficulty ? `${c.verb} · ${checks.levels[c.base]}` : c.verb
  return { ...c, verb }
})()
const ITEM = questions.items[G.check.key][G.check.variant]
const WRONG = ITEM.a.indexOf(G.check.pick.answer)
const ACTIONS = {
  type: 'choice',
  prompt: G.actions.prompt,
  opts: G.actions.options.map((label) => ({ label })),
  used: {},
  resolve: noop,
}

function FilmGame({ t }) {
  // Background: the current one, cross-dissolving from the previous over its `fade`.
  let bi = 0
  G.backgrounds.forEach((b, i) => t >= b.t && (bi = i))
  const bgNow = G.backgrounds[bi]
  const bgFade = bi > 0 && bgNow.fade ? progress(t, bgNow.t, bgNow.fade, 'inOut') : 1
  const bgPrev = bgFade < 1 ? G.backgrounds[bi - 1].bg : null

  const shown = visibleLines(t)
  const key = shown.map((l) => l.id).join()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute only when the set of lines changes
  const log = useMemo(() => shown.map(({ id, kind, who, text }) => ({ id, kind, who, text })), [key])
  const actions = t >= G.actions.from && t < G.actions.to ? ACTIONS : null

  const sel = t >= G.check.pick.t ? WRONG : null
  const conf = t >= G.check.confidence.t ? G.check.confidence.value : null
  const submitted = t >= G.check.submitted
  const explainOpen = G.check.explain != null && t >= G.check.explain
  const script = useMemo(() => ({ sel, conf, submitted, explainOpen }), [sel, conf, submitted, explainOpen])
  const checkOpen = t >= G.check.rise.from && t < G.check.close.from + G.check.close.duration

  // Portraits on screen now (two during a dissolve). Each fades in on `enter` and out on `exit`;
  // within one portrait, each mood change cross-fades (the art has transparent backgrounds,
  // so each pose also fades out as the next fades in).
  const portraits = G.portraits
    .filter((x) => t >= x.from && (t < x.to || x.to >= timeline.duration))
    .map((p) => {
      const layers = [{ mood: p.mood, o: 1 }]
      for (const c of p.changes ?? []) {
        const o = progress(t, c.t, c.fade)
        layers.forEach((l) => (l.o *= 1 - o))
        layers.push({ mood: c.mood, o })
      }
      const enter = p.enter ? progress(t, p.enter.from, p.enter.duration, 'inOut') : 1
      const exit = p.exit ? progress(t, p.exit.from, p.exit.duration, 'inOut') : 0
      const shift = p.enter ? (enter - 1) * (p.enter.distance ?? 0) : 0
      return { ...p, layers, opacity: enter * (1 - exit), shift, x: p.x ?? scene.backgrounds[bgNow.bg].portraitX ?? 6 }
    })

  return (
    <section className="game-root fixed inset-0 overflow-hidden bg-core-always-brand-1">
      {bgPrev && <MemoScene bg={bgPrev} />}
      <div className="film-scene-layer" style={{ opacity: bgFade }}>
        <MemoScene bg={bgNow.bg} />
      </div>
      {portraits.map((p) => (
        <div key={p.id} className="portraits" style={{ '--portrait-x': `${p.x}%` }} aria-hidden="true">
          <div className="portrait" style={{ opacity: p.opacity, transform: `translateX(${p.shift}px)` }}>
            {p.layers.map((l) => (
              <img key={l.mood} src={CAST[scene.cast[p.id].moods[l.mood]]} alt="" style={{ opacity: l.o }} />
            ))}
          </div>
        </div>
      ))}
      <MemoHud left={G.focusTimerMinutes * 60 - Math.floor(Math.max(0, t - G.timerStarts))} />
      <MemoPanel log={log} actions={actions} paused={false} dim={false} />
      {checkOpen && <MemoMcq check={CHECK} item={ITEM} script={script} onSubmit={noop} onDone={noop} />}
    </section>
  )
}

/* ---------------- per-frame placement ---------------- */
function applyLibrary(root, t) {
  const c = timeline.library.cascade
  root.querySelectorAll('main li').forEach((li, i) => {
    const p = progress(t, c.start + i * c.stagger, c.duration, 'out')
    li.style.opacity = p
    li.style.transform = `translateY(${(1 - p) * c.rise}px)`
  })
  const h = timeline.library.hover
  const card = findEl(timeline.targets[h.target], root)
  if (card) {
    const p = t >= h.from ? progress(t, h.from, 0.18, 'out') : 0
    card.style.transform = `translateY(${-h.lift * p}px)`
    card.style.boxShadow = p ? 'var(--shadow-card-secondary-glass-elevation)' : ''
    card.style.background = p ? 'var(--color-non-interactive-background-secondary)' : ''
    card.style.borderColor = p ? 'var(--color-interactive-border-hover)' : ''
  }
}

function applyGame(root, t) {
  const { rise, close } = G.check
  const panel = root.querySelector('.story-panel')
  if (panel) {
    const d = progress(t, rise.from, G.panelDim.fade, 'out') * (1 - progress(t, close.from, G.panelDim.fade, 'in'))
    panel.style.filter = d ? `blur(${G.panelDim.blur * d}px)` : ''
    panel.style.opacity = 1 - (1 - G.panelDim.opacity) * d
  }
  const shown = visibleLines(t)
  root.querySelectorAll('.story-panel [role=log] > *').forEach((el, i) => {
    const line = shown[i]
    const inP = line ? progress(t, line.t, G.lineFade, 'out') : 1
    el.style.opacity = line ? lineOpacity(line, t) : 1
    el.style.transform = `translateY(${(1 - inP) * 8}px)`
  })
  const mcq = root.querySelector('.mcq')
  if (mcq) {
    const p = progress(t, rise.from, rise.duration, 'out')
    const q = progress(t, close.from, close.duration, 'in')
    mcq.style.opacity = p * (1 - q)
    mcq.style.transform = `translateY(${(1 - p) * rise.distance + q * close.distance}px)`
  }
}

/** Scale/translate one scene layer from its own camera keyframes. */
function applyCamera(cam, frames, t) {
  cam.style.transform = 'none' // measure targets in stage coordinates
  const { a, b, p } = keyframeSpan(frames, t)
  const fa = resolvePoint(a.focus, cam) ?? [W / 2, H / 2]
  const fb = b ? (resolvePoint(b.focus, cam) ?? fa) : fa
  const s = b ? lerp(a.s, b.s, p) : a.s
  const [fx, fy] = lerp2(fa, fb, p)
  const tx = Math.min(0, Math.max(W - W * s, W / 2 - fx * s))
  const ty = Math.min(0, Math.max(H - H * s, H / 2 - fy * s))
  cam.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
}

function applyCursor(el, ripple, t, memory) {
  const c = timeline.cursor
  const o = windowOpacity(c.visible, t)
  el.style.opacity = o
  ripple.style.opacity = 0
  if (!o) return
  const [x, y] = cursorPoint(c, t, (name) => resolvePoint(name), memory)
  const { press, ripple: age } = clickState(c.clicks, t)
  el.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.14 * press})`
  if (age !== null) {
    ripple.style.opacity = (1 - age) * 0.55 * o
    ripple.style.transform = `translate(${x}px, ${y}px) scale(${0.3 + age * 1.4})`
  }
}

/* ---------------- stage root ---------------- */
function Stage() {
  const t = useTime()
  const libraryOn = isOn('library', t)
  const gameOn = isOn('game', t)
  const camLibrary = useRef(null)
  const camGame = useRef(null)
  const cursor = useRef(null)
  const ripple = useRef(null)
  const memory = useRef({})

  useLayoutEffect(() => {
    if (gameOn) {
      applyGame(camGame.current, t)
      applyCamera(camGame.current, timeline.camera.game, t)
    }
    camGame.current.style.visibility = gameOn ? 'visible' : 'hidden'
    camLibrary.current.style.visibility = libraryOn ? 'visible' : 'hidden'
    if (libraryOn) {
      applyLibrary(camLibrary.current, t)
      applyCamera(camLibrary.current, timeline.camera.library, t)
      camLibrary.current.style.opacity = dissolveOut('library', t)
    }
    applyCursor(cursor.current, ripple.current, t, memory.current)
  })

  return (
    <div className="film-stage">
      <div ref={camGame} className="film-camera">
        {gameOn && <FilmGame t={t} />}
      </div>
      <div ref={camLibrary} className="film-camera film-library-layer">
        {libraryOn && <FilmLibrary />}
      </div>
      <div ref={ripple} className="film-ripple" />
      <div ref={cursor} className="film-cursor" style={{ width: timeline.cursor.size, height: timeline.cursor.size }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 2.2 19.6 12.6l-7.1 1.4 4.2 7.6-3 1.6-4.1-7.7-5 5z" />
        </svg>
      </div>
    </div>
  )
}

/* ---------------- boot ---------------- */
const preload = (src) =>
  new Promise((r) => {
    const img = new Image()
    img.onload = img.onerror = r
    img.src = src
  })
const art = [
  ...Object.values(POSTERS),
  ...G.backgrounds.map((b) => SCENES[scene.backgrounds[b.bg].img]),
  ...G.portraits.flatMap((p) => [p.mood, ...(p.changes ?? []).map((c) => c.mood)].map((m) => CAST[scene.cast[p.id].moods[m]])),
]

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter>
      <Stage />
    </MemoryRouter>
  </StrictMode>,
)

window.filmStage = {
  ready: Promise.all([document.fonts.ready, ...art.map(preload)]).then(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  ),
  setTime(t) {
    now = clamp01(t / timeline.duration) * timeline.duration
    listeners.forEach((l) => l())
  },
}
