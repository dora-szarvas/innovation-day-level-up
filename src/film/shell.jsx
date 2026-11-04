/*
 * Film mode shell (film.html): letterboxed 1920×1080 stage, the one timeline clock,
 * Start screen, keyboard controls, audio cues and the ?debug=1 scrub bar.
 *
 * Query options: ?scale=1 (1:1 pixels) · ?audio=off (silent) · ?debug=1 (scrub bar + timecode).
 */
import { StrictMode, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Switch, Text } from '@pearson-ux/nebula-design-system/alpha'
import '../nebula.css'
import '../index.css'
import timeline from './timeline.json'
import { FilmSound } from './filmSound.js'

const params = new URLSearchParams(location.search)
const FORCE_1X = params.get('scale') === '1'
const DEBUG = params.get('debug') === '1'
const AUDIO_DEFAULT = params.get('audio') !== 'off'

const { width: W, height: H } = timeline.stage
const HOLD_IN = timeline.holdStart
const SEQ = timeline.duration
const TOTAL = HOLD_IN + SEQ + timeline.holdEnd

// Every sound cue on the sequence clock: the timeline's list plus one blip per library card.
const CARD_COUNT = 8
const CUES = [
  ...timeline.audio,
  ...Array.from({ length: CARD_COUNT }, (_, i) => ({
    t: timeline.library.cascade.start + i * timeline.library.cascade.stagger,
    sound: timeline.cascadeBlip,
  })),
].sort((a, b) => a.t - b.t)

const seqTime = (elapsed) => Math.min(SEQ, Math.max(0, elapsed - HOLD_IN))
const fmt = (s) => {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(2).padStart(5, '0')}`
}

function useStageScale() {
  const get = () => (FORCE_1X ? 1 : Math.min(window.innerWidth / W, window.innerHeight / H))
  const [scale, setScale] = useState(get)
  useEffect(() => {
    const on = () => setScale(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return scale
}

function Shell() {
  const scale = useStageScale()
  const frame = useRef(null)
  const stage = useRef(null)
  const [phase, setPhase] = useState('loading') // loading → ready → playing → done
  const [audioOn, setAudioOn] = useState(AUDIO_DEFAULT)
  const clock = useRef({ playing: false, startMs: 0, frozen: 0, lastSeq: -1 })
  const range = useRef(null)
  const timecode = useRef(null)
  const [paused, setPaused] = useState(true)

  // Wait for the stage frame to load its fonts and art before Start is offered.
  const onFrameLoad = useCallback(async () => {
    const api = frame.current.contentWindow.filmStage
    await api.ready
    stage.current = api
    api.setTime(0)
    setPhase('ready')
  }, [])

  // The one clock: requestAnimationFrame + elapsed wall time. Nothing else schedules anything.
  useEffect(() => {
    let raf
    const tick = (ms) => {
      const c = clock.current
      let elapsed = c.playing ? (ms - c.startMs) / 1000 : c.frozen
      if (c.playing && elapsed >= TOTAL) {
        elapsed = TOTAL
        c.playing = false
        c.frozen = TOTAL
        setPhase('done')
        setPaused(true)
        FilmSound.stopAll()
      }
      const t = seqTime(elapsed)
      stage.current?.setTime(t)
      // Fire sound cues the clock has just passed (only while playing forward in real time).
      if (c.playing && elapsed > HOLD_IN && t > c.lastSeq && t - c.lastSeq < 0.35) {
        for (const cue of CUES) if (cue.t > c.lastSeq && cue.t <= t) FilmSound.play(cue.sound)
      }
      c.lastSeq = c.playing ? t : -1
      if (DEBUG && range.current) {
        range.current.value = elapsed
        timecode.current.textContent = `${fmt(elapsed)} / ${fmt(TOTAL)}   ·   sequence ${t.toFixed(2)} s`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const start = useCallback(() => {
    if (!stage.current) return
    FilmSound.stopAll()
    FilmSound.setEnabled(audioOn)
    FilmSound.unlock()
    const c = clock.current
    c.startMs = performance.now()
    c.lastSeq = -1
    c.playing = true
    setPaused(false)
    setPhase('playing')
  }, [audioOn])

  // Space starts, R restarts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, button') && e.key === ' ') return
      if (e.key === ' ' && phase === 'ready') {
        e.preventDefault()
        start()
      }
      if ((e.key === 'r' || e.key === 'R') && phase !== 'loading') start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, start])

  const scrub = (v) => {
    const c = clock.current
    c.playing = false
    c.frozen = Number(v)
    FilmSound.stopAll()
    setPaused(true)
    if (phase === 'ready') setPhase('done')
  }
  const togglePlay = () => {
    const c = clock.current
    if (c.playing) {
      c.frozen = (performance.now() - c.startMs) / 1000
      c.playing = false
      FilmSound.stopAll()
      setPaused(true)
      return
    }
    FilmSound.setEnabled(audioOn)
    FilmSound.unlock()
    c.startMs = performance.now() - Math.min(c.frozen, TOTAL - 0.01) * 1000
    c.lastSeq = -1
    c.playing = true
    setPaused(false)
    setPhase('playing')
  }

  // Expose the phase on <html> (data-film-phase) so a take can be timed from outside.
  useEffect(() => {
    document.documentElement.dataset.filmPhase = phase
  }, [phase])

  const hideCursor = phase === 'playing' || phase === 'done'
  const left = Math.max(0, (window.innerWidth - W * scale) / 2)
  const top = Math.max(0, (window.innerHeight - H * scale) / 2)

  return (
    <div className={`film-shell ${hideCursor && !DEBUG ? 'film-shell--recording' : ''}`}>
      <iframe
        ref={frame}
        src="./film-stage.html"
        title="Film stage"
        tabIndex={-1}
        onLoad={onFrameLoad}
        className="film-frame"
        style={{ width: W, height: H, left, top, transform: `scale(${scale})` }}
      />

      {(phase === 'loading' || phase === 'ready') && (
        <div className="film-start">
          <div className="film-start-card">
            <Text as="h1" variant="heading-h3-med" className="text-text-primary">
              Level Up · Midnight Train
            </Text>
            <Text variant="body-regular" className="text-text-secondary">
              Film mode · {SEQ} s sequence · 1920 × 1080
            </Text>
            <Switch label="Audio" checked={audioOn} onCheckedChange={(on) => setAudioOn(on)} />
            <Button type="primary" disabled={phase !== 'ready'} onClick={start}>
              {phase === 'ready' ? 'Start' : 'Loading…'}
            </Button>
            <Text variant="label-small" className="text-text-secondary">
              Space starts · R restarts
            </Text>
          </div>
        </div>
      )}

      {DEBUG && (
        <div className="film-debug">
          <button type="button" onClick={togglePlay} disabled={phase === 'loading'}>
            {paused ? 'Play' : 'Pause'}
          </button>
          <input
            ref={range}
            type="range"
            min="0"
            max={TOTAL}
            step="0.01"
            defaultValue="0"
            onInput={(e) => scrub(e.target.value)}
            aria-label="Scrub"
          />
          <span ref={timecode} className="film-timecode" />
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
)
