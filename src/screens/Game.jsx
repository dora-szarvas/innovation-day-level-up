import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from '@pearson-ux/nebula-design-system/alpha'
import story from '../data/story.json'
import checks from '../data/checks.json'
import questions from '../data/questions.json'
import scene from '../data/scene-config.json'
import { CAST, SCENES } from '../game/assets.js'
import { createEngine } from '../game/engine.js'
import { Snd } from '../game/sound.js'
import { Voice } from '../game/voice.js'
import { StoryPanel } from '../components/StoryPanel.jsx'
import { McqCard } from '../components/McqCard.jsx'
import { Hud, useFocusTimer } from '../components/Hud.jsx'
import { Silhouette } from '../components/GameArt.jsx'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Portraits({ portraits, speaking, x }) {
  return (
    <div className="portraits" style={{ '--portrait-x': `${x ?? 6}%` }} aria-hidden="true">
      {portraits.map((p) => {
        const c = scene.cast[p.id]
        const art = CAST[c.moods?.[p.mood]]
        return (
          <div
            key={p.id}
            className={`portrait ${art ? '' : 'placeholder'} ${p.leaving ? 'leaving' : ''} ${speaking && speaking !== p.id ? 'dimmed' : ''}`}
          >
            {/* Placeholder labels removed for now; the speaker's name is in the text panel. */}
            {art ? <img src={art} alt="" draggable="false" /> : <Silhouette id={p.id} />}
          </div>
        )
      })}
    </div>
  )
}

/**
 * The scene image sits on a stage with the image's own aspect ratio, sized to cover the
 * screen and slid so the background's focus point stays in the visible area. Hotspots
 * live on the stage, so their % positions always land on the same spot in the art.
 */
function Scene({ bg, actions }) {
  const b = scene.backgrounds[bg]
  const style = {
    '--ar': scene.aspect,
    '--fx': b.focus?.[0] ?? 50,
    '--fy': b.focus?.[1] ?? 50,
    '--zoom': b.zoom ?? 1,
  }
  return (
    <div className="scene-stage" style={style}>
      <img key={b.img} src={SCENES[b.img]} alt="" className="scene-img" draggable="false" />
      <Hotspots actions={actions} />
    </div>
  )
}

function Hotspots({ actions }) {
  if (actions?.type !== 'choice') return null
  return actions.opts.map((o, i) =>
    o.spot ? (
      <button
        key={o.label}
        type="button"
        aria-label={o.label}
        tabIndex={-1 /* the numbered action is the keyboard route; hotspots are a pointer shortcut */}
        className={`hotspot ${actions.used[o.label] ? 'used' : ''}`}
        style={{ left: `${o.spot[0]}%`, top: `${o.spot[1]}%` }}
        onClick={() => actions.resolve(i)}
      >
        <span className="dot" />
        <span className="hl rounded-x2 bg-core-always-brand-1/75 px-x2 py-x1">
          <Text as="span" variant="label-small" className="text-text-primary">
            {o.label}
          </Text>
        </span>
      </button>
    ) : null,
  )
}

export default function Game({ startLevel, sessionMinutes, onEnd }) {
  const navigate = useNavigate()
  const timer = useFocusTimer(sessionMinutes)
  const [bg, setBg] = useState(story.nodes[story.start].find((s) => s.bg)?.bg ?? Object.keys(scene.backgrounds)[0])
  const [log, setLog] = useState([])
  const [actions, setActions] = useState(null)
  const [portraits, setPortraits] = useState([])
  const [speaking, setSpeaking] = useState(null)
  const [dark, setDark] = useState({ on: false, text: '' })
  const [blinkKey, setBlinkKey] = useState(0)
  const [mcq, setMcq] = useState(null)
  const idRef = useRef(0)

  useEffect(() => {
    const nextId = () => ++idRef.current
    const push = (e) => setLog((l) => [...l, { id: nextId(), ...e }])
    const timers = new Set()
    const later = (fn, ms) => {
      const t = setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
    }

    const ui = {
      castName: (id) => scene.cast[id]?.name ?? id,
      setBg,
      blink: () =>
        new Promise((r) => {
          setBlinkKey((k) => k + 1)
          later(r, reduceMotion() ? 150 : 1800)
        }),
      sfx: (name) => Snd.play(name),
      // A beat lets a line land before the next one: until its voice ends, or a reading pause.
      beat: (text) =>
        new Promise((r) => {
          if (Voice.on && Voice.busy) Voice.whenIdle().then(() => later(r, 400))
          else later(r, Math.min(4000, Math.max(1500, text.length * 45)))
        }),
      stopWheels: () => Snd.stopWheels(),
      showPortrait: (id, mood) =>
        setPortraits((ps) =>
          ps.some((p) => p.id === id)
            ? ps.map((p) => (p.id === id ? { ...p, mood: mood || '', leaving: false } : p))
            : [...ps, { id, mood: mood || '', leaving: false }],
        ),
      hidePortrait: (id, instant) => {
        if (instant) return setPortraits((ps) => ps.filter((p) => p.id !== id))
        setPortraits((ps) => ps.map((p) => (p.id === id ? { ...p, leaving: true } : p)))
        later(() => setPortraits((ps) => ps.filter((p) => !(p.id === id && p.leaving))), 420)
      },
      setMood: (id, mood) => setPortraits((ps) => ps.map((p) => (p.id === id ? { ...p, mood } : p))),
      speaking: setSpeaking,
      addEntry: ({ vo, ...e }) => {
        push(e)
        Snd.play('line')
        if (vo) Voice.play(vo)
      },
      addChosen: (label) => push({ kind: 'chosen', text: label }),
      addCheckpoint: ({ verb, ok }) => push({ kind: 'cp', verb, ok }),
      waitContinue: () =>
        new Promise((resolve) =>
          setActions({
            type: 'cont',
            resolve: () => {
              Voice.stop()
              setActions(null)
              resolve()
            },
          }),
        ),
      choose: ({ prompt, opts, used }) =>
        new Promise((resolve) =>
          setActions({
            type: 'choice',
            prompt,
            opts,
            used,
            resolve: (i) => {
              Voice.stop()
              setActions(null)
              resolve(i)
            },
          }),
        ),
      runCheck: (q) =>
        new Promise((resolve) => {
          Voice.stop()
          let answer = null
          setMcq({
            ...q,
            onSubmit: (a) => {
              answer = a
              Snd.play(a.ok ? 'right' : 'wrong')
            },
            onDone: () => {
              setMcq(null)
              resolve(answer)
            },
          })
        }),
      dark: (mode, text) => {
        if (mode === 'on') setDark({ on: true, text: '' })
        else if (mode === 'text') setDark((d) => ({ ...d, text }))
        else {
          setDark((d) => ({ ...d, on: false }))
          later(() => setDark((d) => ({ ...d, text: '' })), 400)
        }
      },
      end: (run) => {
        Snd.stopWheels()
        Voice.stop()
        onEnd(run)
        navigate('/midnight-train/end')
      },
    }

    const engine = createEngine({ story, checks, questions }, ui, { startLevel, reduceMotion: reduceMotion() })
    engine.start()
    return () => {
      engine.abort()
      timers.forEach(clearTimeout)
      Snd.stopWheels()
      Voice.stop()
    }
  }, [startLevel, onEnd, navigate])

  // 1–9 pick a numbered action (answers have their own keys inside the check card).
  useEffect(() => {
    if (mcq || actions?.type !== 'choice') return
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= actions.opts.length) {
        e.preventDefault()
        actions.resolve(n - 1)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [actions, mcq])

  const b = scene.backgrounds[bg]

  return (
    <section aria-label="Midnight Train, episode 1" className="game-root fixed inset-0 overflow-hidden bg-core-always-brand-1">
      <Scene bg={bg} actions={mcq ? null : actions} />
      <Portraits portraits={portraits} speaking={speaking} x={b.portraitX} />
      <Hud timer={timer} />
      <StoryPanel log={log} actions={mcq ? null : actions} paused={timer.paused} dim={!!mcq} />
      {mcq && <McqCard key={mcq.key + log.length} check={mcq.check} item={mcq.item} onSubmit={mcq.onSubmit} onDone={mcq.onDone} />}
      <div className={`blackout ${dark.on ? 'on' : ''}`} aria-hidden={!dark.on}>
        <Text variant="body-large" className="caption max-w-[40ch] px-x6 text-center text-text-primary">
          {dark.text}
        </Text>
      </div>
      {blinkKey > 0 && <div key={blinkKey} className="blink run" aria-hidden="true" />}
    </section>
  )
}
