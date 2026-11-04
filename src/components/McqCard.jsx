import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AiGradientFrame,
  Button,
  Card,
  Icon,
  Tag,
  Text,
} from '@pearson-ux/nebula-design-system/alpha'
import {
  arrowRightOutlinedRegular,
  checkOutlinedRegular,
  xMarkOutlinedRegular,
} from '@pearson-ux/nebula-design-system/icons'
import { CONFIDENCE } from '../game/characterType.js'
import { useScrollingClass } from './useScrollingClass.js'

// Figma 38:35929 lists the most confident option first.
const CONFIDENCE_ORDER = [...CONFIDENCE].reverse()

const LETTERS = ['A', 'B', 'C', 'D']

// Answer option (Figma "Learn/Lesson/Problem"). Colour is never the only signal:
// result states add an icon and a screen-reader word.
const OPTION_STATE = {
  default: {
    box: 'border border-core-always-brand-3/30 bg-core-always-brand-3/8 hover:bg-core-always-brand-3/20',
    id: 'bg-core-always-brand-3',
  },
  selected: {
    box: 'border-2 border-core-always-brand-3 bg-core-always-brand-3/20 [&_.ans-text]:font-bold',
    id: 'bg-core-always-brand-3',
  },
  correct: {
    box: 'border-2 border-accent-14-mint-default-icon bg-accent-14-mint-default-background',
    id: 'bg-accent-14-mint-default-text',
    mark: 'bg-accent-14-mint-default-icon',
    icon: checkOutlinedRegular,
    sr: 'Correct, your answer',
  },
  incorrect: {
    box: 'border-2 border-accent-07-red-default-icon bg-accent-07-red-default-background',
    id: 'bg-accent-07-red-default-text',
    mark: 'bg-accent-07-red-default-icon',
    icon: xMarkOutlinedRegular,
    sr: 'Incorrect, your answer',
  },
  shown: {
    box: 'border-2 border-accent-17-blue-default-icon bg-accent-17-blue-default-background',
    id: 'bg-core-always-brand-3',
    mark: 'bg-accent-17-blue-default-icon',
    icon: checkOutlinedRegular,
    sr: 'Correct answer',
  },
}

function AnswerOption({ letter, text, state, disabled, onClick, buttonRef }) {
  const s = OPTION_STATE[state]
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={`flex min-h-x17 items-center gap-x4 rounded-x3 px-x4 py-x3 text-left text-text-primary transition-colors focus-visible:[outline:var(--outline-width)_solid_var(--color-interactive-border-inverse-focus)] focus-visible:outline-offset-2 disabled:cursor-default ${s.box}`}
    >
      <span className={`grid h-x9 w-x8 shrink-0 place-items-center rounded-x2 text-core-always-brand-1 ${s.id}`}>
        <Text as="span" variant="label-regular" className="font-[family-name:var(--font--nebula-display-family,inherit)]">
          {letter}
        </Text>
      </span>
      <Text as="span" variant="body-regular" className="ans-text flex-1">
        {text}
      </Text>
      {s.icon && (
        <span className={`grid size-x6 shrink-0 place-items-center rounded-circular text-core-always-brand-1 ${s.mark}`}>
          <Icon svg={s.icon} size={14} className="!text-core-always-brand-1" aria-hidden />
        </span>
      )}
      {s.sr && <span className="sr-only">({s.sr})</span>}
    </button>
  )
}

/**
 * The check card (Figma 7:32130 → 7:32277). The story never addresses the player:
 * verb + difficulty, an in-story framing line, the question, 4 answers, confidence, Submit.
 * Wrong answers fail forward — there is no "Try another question".
 */
export function McqCard({ check, item, onSubmit, onDone, script }) {
  const [selState, setSel] = useState(null)
  const [confState, setConf] = useState(null)
  const [resultState, setResult] = useState(null)
  const [explainState, setExplainOpen] = useState(false)
  // Film mode only (src/film): `script` = { sel, conf, submitted, explainOpen } drives the
  // card from a timeline instead of clicks. The demo never passes it, so nothing changes there.
  const sel = script ? (script.sel ?? null) : selState
  const conf = script ? (script.conf ?? null) : confState
  const scriptedResult = useMemo(
    () => (script?.submitted ? { ok: script.sel === item.c } : null),
    [script?.submitted, script?.sel, item.c],
  )
  const result = script ? scriptedResult : resultState
  const explainOpen = script ? !!script.explainOpen : explainState
  const firstAnswer = useRef(null)
  const submitRef = useRef(null)
  const continueRef = useRef(null)
  const cardRef = useRef(null)
  useScrollingClass(cardRef)

  useEffect(() => {
    if (!script) firstAnswer.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on mount only
  }, [])
  useEffect(() => {
    if (result && !script) continueRef.current?.focus({ preventScroll: true })
  }, [result, script])

  const canSubmit = sel !== null && conf !== null && !result
  const submit = () => {
    if (!canSubmit) return
    const ok = sel === item.c
    setResult({ ok })
    onSubmit?.({ ok, conf })
  }

  // A–D or 1–4 pick an answer; Enter submits from the confidence row or Submit.
  useEffect(() => {
    if (result || script) return
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toUpperCase()
      if (k.length === 1 && 'ABCD1234'.includes(k)) {
        e.preventDefault()
        setSel('ABCD1234'.indexOf(k) % 4)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [result, script])

  const optionState = (i) => {
    if (!result) return sel === i ? 'selected' : 'default'
    if (i === sel) return result.ok ? 'correct' : 'incorrect'
    if (!result.ok && i === item.c) return 'shown'
    return 'default'
  }

  const feedback = result
    ? result.ok
      ? `Correct. ${conf === 'Sure' ? 'And you knew it.' : 'Trust yourself a little more.'}`
      : `Not this time. The correct answer is ${LETTERS[item.c]}.${conf === 'Sure' ? ' You were sure, so this one is worth a second look.' : ''}`
    : null

  return (
    <div className="mcq-wrap">
      <Card
        variant="primaryElevationOnly"
        border
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcq-question"
        aria-describedby="mcq-framing"
        ref={cardRef}
        className="mcq scroll-quiet flex flex-col overflow-auto rounded-x4 bg-non-interactive-background-secondary-strong"
      >
        <div className="flex flex-col gap-x2 px-x8 pt-x6">
          <Text as="span" variant="label-small-bold" className="tracking-wider text-text-primary">
            {check.verb}
          </Text>
          <Text id="mcq-framing" variant="body-regular" className="italic text-text-secondary">
            {check.framing}
          </Text>
          <Text id="mcq-question" as="h2" variant="heading-h5-med" className="text-text-primary">
            {item.q}
          </Text>
        </div>

        <div role="group" aria-label="Answers" className="mcq-answers gap-x3 gap-y-x3 px-x8 py-x5 md:gap-x-x5">
          {item.a.map((a, i) => (
            <AnswerOption
              key={i}
              buttonRef={i === 0 ? firstAnswer : undefined}
              letter={LETTERS[i]}
              text={a}
              state={optionState(i)}
              disabled={!!result}
              onClick={() => setSel(i)}
            />
          ))}
        </div>

        <div aria-live="polite">
          {feedback && (
            <Text
              variant="body-large"
              className={`mx-x8 mb-x5 text-center ${result.ok ? 'text-accent-14-mint-default-text' : 'text-accent-07-red-default-text'}`}
            >
              {feedback}
            </Text>
          )}
        </div>

        {(sel !== null || result) && (
        <div className="fade-up flex flex-wrap items-center gap-x3 border-t border-core-always-brand-3/30 px-x8 py-x5">
          {!result ? (
            <>
              <Text as="span" id="conf-label" variant="body-regular" className="text-text-primary">
                How sure are you in your answer?
              </Text>
              <div
                role="group"
                aria-labelledby="conf-label"
                className="flex flex-wrap gap-x2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSubmit) {
                    e.preventDefault()
                    submit()
                  }
                }}
              >
                {CONFIDENCE_ORDER.map((c) => (
                  <Tag
                    key={c}
                    variant="selectable"
                    size="medium"
                    label={c}
                    selected={conf === c}
                    disabled={sel === null}
                    onSelectedChange={() => {
                      setConf(c)
                      requestAnimationFrame(() => submitRef.current?.focus())
                    }}
                  />
                ))}
              </div>
              <span className="flex-1" />
              <Button ref={submitRef} type="primary" size="medium" disabled={!canSubmit} onClick={submit}>
                Submit
              </Button>
            </>
          ) : (
            <>
              <AiGradientFrame width="medium">
                <button
                  type="button"
                  aria-expanded={explainOpen}
                  aria-controls="mcq-explain"
                  onClick={() => setExplainOpen((o) => !o)}
                  className="rounded-circular bg-transparent px-x4 py-x2 text-text-primary focus-visible:[outline:var(--outline-width)_solid_var(--color-interactive-border-inverse-focus)] focus-visible:outline-offset-2"
                >
                  <Text as="span" variant="label-regular">
                    {result.ok ? 'Explain solution' : 'Why was it wrong?'}
                  </Text>
                </button>
              </AiGradientFrame>
              <span className="flex-1" />
              <Button
                ref={continueRef}
                type="primary"
                size="medium"
                trailingIcon={<Icon svg={arrowRightOutlinedRegular} />}
                onClick={onDone}
              >
                Continue
              </Button>
            </>
          )}
        </div>
        )}

        <div id="mcq-explain">
          {result && explainOpen && (
            <Card variant="secondaryStrong" className="fade-up mx-x8 mb-x6 flex flex-col gap-x3 p-x5">
              <Text variant="body-regular" className="text-text-primary">
                <span className="font-bold text-accent-14-mint-default-text">Curiosity:</span>{' '}
                {result.ok ? 'Here’s why that works.' : 'Here’s what you missed.'}
              </Text>
              <Text variant="body-regular" className="text-text-primary">
                {item.ex}
              </Text>
              <Text variant="label-small" className="text-right italic text-text-secondary">
                Features in: {item.src}
              </Text>
            </Card>
          )}
        </div>
      </Card>
    </div>
  )
}
