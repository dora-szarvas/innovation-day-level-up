import { useEffect, useState } from 'react'
import { Chip, Icon } from '@pearson-ux/nebula-design-system/alpha'
import {
  pauseFilledRegular,
  playFilledRegular,
  speakerHighFilledRegular,
  speakerSlashFilledRegular,
  microphoneFilledRegular,
  microphoneSlashFilledRegular,
} from '@pearson-ux/nebula-design-system/icons'
import { Snd } from '../game/sound.js'
import { Voice } from '../game/voice.js'

const R = 6.5
const CIRC = 2 * Math.PI * R

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// The ring is 16px — below ProgressCircular's smallest preset (64px) — so it is drawn
// inline, still on Nebula colour tokens.
function Ring({ left, total, paused }) {
  return (
    <svg viewBox="0 0 16 16" className="size-x4" aria-hidden="true">
      <circle cx="8" cy="8" r={R} fill="none" strokeWidth="3" className="stroke-core-always-brand-3/30" />
      <circle
        cx="8"
        cy="8"
        r={R}
        fill="none"
        strokeWidth="3"
        strokeDasharray={CIRC}
        strokeDashoffset={(CIRC * (1 - left / total)).toFixed(2)}
        transform="rotate(-90 8 8)"
        className={paused ? 'stroke-text-secondary' : 'stroke-core-always-brand-3'}
      />
    </svg>
  )
}

/**
 * Focus-session timer (no timers on questions) — pausable. `minutes` comes from the
 * episode screen's session-length choice; null means no timer at all.
 */
export function useFocusTimer(minutes) {
  const total = minutes ? minutes * 60 : null
  const [left, setLeft] = useState(total)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!total || paused) return
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [total, paused])
  return { total, left, paused: !!total && paused, toggle: () => setPaused((p) => !p) }
}

const chipButton =
  'cursor-pointer !bg-non-interactive-background-secondary-strong shadow-primary-elevation-only-box-shadow focus-visible:[outline:var(--outline-width)_solid_var(--color-interactive-border-inverse-focus)] focus-visible:outline-offset-2'

export function Hud({ timer }) {
  const [soundOn, setSoundOn] = useState(Snd.on)
  useEffect(() => Snd.subscribe(setSoundOn), [])
  const [voiceOn, setVoiceOn] = useState(Voice.on)
  useEffect(() => Voice.subscribe(setVoiceOn), [])

  return (
    <div className="absolute left-[max(var(--spacing-x6),env(safe-area-inset-left,0px))] top-[calc(var(--spacing-x6)+env(safe-area-inset-top,0px))] z-[6] flex gap-x2">
      {timer.total && (
        <Chip
          as="button"
          type="button"
          size="b-40"
          color="white"
          className={`${chipButton} tabular-nums`}
          label={fmt(timer.left)}
          leadingIcon={<Icon svg={timer.paused ? playFilledRegular : pauseFilledRegular} size={12} />}
          trailingIcon={<Ring left={timer.left} total={timer.total} paused={timer.paused} />}
          ariaLabel={`${timer.paused ? 'Resume' : 'Pause'} focus timer, ${fmt(timer.left)} left`}
          onClick={timer.toggle}
        />
      )}
      <Chip
        as="button"
        type="button"
        size="b-40"
        color="white"
        className={chipButton}
        label={soundOn ? 'Sound on' : 'Sound off'}
        leadingIcon={<Icon svg={soundOn ? speakerHighFilledRegular : speakerSlashFilledRegular} size={14} />}
        aria-pressed={soundOn}
        ariaLabel={soundOn ? 'Turn sound off' : 'Turn sound on'}
        onClick={() => {
          const on = Snd.toggle()
          if (on) Snd.play('wheels')
        }}
      />
      <Chip
        as="button"
        type="button"
        size="b-40"
        color="white"
        className={chipButton}
        label={voiceOn ? 'Voice on' : 'Voice off'}
        leadingIcon={<Icon svg={voiceOn ? microphoneFilledRegular : microphoneSlashFilledRegular} size={14} />}
        aria-pressed={voiceOn}
        ariaLabel={voiceOn ? 'Turn voices off' : 'Turn voices on'}
        onClick={() => Voice.toggle()}
      />
    </div>
  )
}
