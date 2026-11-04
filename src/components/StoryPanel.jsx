import { useEffect, useRef } from 'react'
import { Button, Divider, Icon, Text } from '@pearson-ux/nebula-design-system/alpha'
import {
  arrowRightOutlinedRegular,
  checkOutlinedRegular,
  pauseFilledRegular,
  xMarkOutlinedRegular,
} from '@pearson-ux/nebula-design-system/icons'
import { useScrollingClass } from './useScrollingClass.js'

// Most recent entries stay bright; older ones fade back.
const BRIGHT = 4

function Entry({ e, old, separated, continued }) {
  const cls = `log-entry ${old ? 'old' : ''}`
  if (e.kind === 'chosen') {
    return (
      <Text variant="label-small" className={`${cls} text-text-secondary`}>
        → {e.text}
      </Text>
    )
  }
  if (e.kind === 'cp') {
    return (
      <Divider className={cls}>
        <span className="inline-flex items-center gap-x1 rounded-x1 bg-core-always-brand-3/8 px-x2 py-x1-half">
          <Text as="span" variant="label-small" className="text-text-primary">
            {e.verb} ·
          </Text>
          <Icon
            svg={e.ok ? checkOutlinedRegular : xMarkOutlinedRegular}
            size={14}
            className={e.ok ? '!text-accent-14-mint-default-text' : '!text-accent-07-red-default-text'}
            aria-hidden
          />
          <Text
            as="span"
            variant="label-small-bold"
            className={e.ok ? 'text-accent-14-mint-default-text' : 'text-accent-07-red-default-text'}
          >
            {e.ok ? 'Passed' : 'Missed'}
          </Text>
        </span>
      </Divider>
    )
  }
  return (
    <div className={`${cls} flex flex-col gap-x5`}>
      {separated && <Divider className="mx-x6 w-auto opacity-60" />}
      <div>
        {e.who && !continued && (
          <Text
            as="span"
            variant="body-bold"
            className={`mb-x1-half block ${e.kind === 'you' ? 'text-core-always-brand-3' : 'text-text-primary'}`}
          >
            {e.who}:
          </Text>
        )}
        <Text variant="body-regular" className={e.who ? 'pl-x2 text-text-primary' : 'text-text-primary'}>
          {e.text}
        </Text>
      </div>
    </div>
  )
}

function Actions({ actions }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [actions])

  if (!actions) return null
  if (actions.type === 'cont') {
    return (
      <div ref={ref}>
        <Button type="tertiary" trailingIcon={<Icon svg={arrowRightOutlinedRegular} />} onClick={actions.resolve}>
          Continue
        </Button>
      </div>
    )
  }
  const { prompt, opts, used, resolve } = actions
  const numbered = opts.length > 1
  return (
    <div ref={ref} className="flex flex-col gap-x2">
      {prompt && (
        <Text id="choice-prompt" variant="label-small" className="mb-x1 text-text-secondary">
          {prompt}
        </Text>
      )}
      <div role="group" aria-labelledby={prompt ? 'choice-prompt' : undefined} className="flex flex-col gap-x1">
        {opts.map((o, i) =>
          o.label === 'Continue' ? (
            <div key={i}>
              <Button type="tertiary" trailingIcon={<Icon svg={arrowRightOutlinedRegular} />} onClick={() => resolve(i)}>
                Continue
              </Button>
            </div>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => resolve(i)}
              className="flex items-baseline gap-x3 rounded-x2 px-x2 py-x1-half text-left hover:bg-core-always-brand-3/8 focus-visible:[outline:var(--outline-width)_solid_var(--color-interactive-border-inverse-focus)]"
            >
              {numbered && (
                <Text as="span" variant="body-regular" className="shrink-0 text-text-secondary">
                  {i + 1}. -
                </Text>
              )}
              <Text
                as="span"
                variant={used[o.label] && o.look ? 'body-large' : 'body-large-bold'}
                className={used[o.label] && o.look ? 'text-text-secondary' : 'text-core-always-brand-3'}
              >
                {o.label}
                {used[o.label] && o.look && <span className="sr-only"> (already done)</span>}
              </Text>
            </button>
          ),
        )}
      </div>
    </div>
  )
}

// Lines from the same speaker form one run under a single name: no repeated name and no
// divider inside it. Choices picked in between don't break a run; a checkpoint does.
function continuesRun(log, i) {
  const e = log[i]
  if (i === 0 || e.kind === 'chosen' || e.kind === 'cp') return false
  for (let j = i - 1; j >= 0; j--) {
    if (log[j].kind === 'chosen') continue
    return log[j].kind !== 'cp' && log[j].who === e.who
  }
  return false
}

// A divider opens each new run, except straight after a checkpoint.
function hasDivider(log, i) {
  const e = log[i]
  if (i === 0 || e.kind === 'chosen' || e.kind === 'cp' || log[i - 1].kind === 'cp') return false
  return !continuesRun(log, i)
}

/** Story log + actions (Figma 7:32180 / 7:32157). Solid surface so text never sits on art. */
export function StoryPanel({ log, actions, paused, dim }) {
  const logRef = useRef(null)
  useScrollingClass(logRef)
  useEffect(() => {
    const el = logRef.current
    if (!el) return
    const toEnd = () => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    toEnd()
    // The actions row below the log grows after a line lands; keep the newest line in view.
    const ro = new ResizeObserver(toEnd)
    ro.observe(el)
    return () => ro.disconnect()
  }, [log, actions])

  return (
    <aside aria-label="Story" className={`story-panel ${dim ? 'dim' : ''}`} inert={dim || undefined}>
      <div className="flex h-full flex-col bg-non-interactive-background-secondary-strong shadow-primary-elevation-only-box-shadow">
        <div ref={logRef} role="log" aria-live="polite" className="scroll-quiet flex min-h-0 flex-1 flex-col gap-x5 overflow-y-auto px-x6 pb-x6 pt-x8">
          {log.map((e, i) => (
            <Entry
              key={e.id}
              e={e}
              old={i < log.length - BRIGHT}
              separated={hasDivider(log, i)}
              continued={continuesRun(log, i)}
            />
          ))}
        </div>
        <div className="px-x6 pb-x6">
          <Actions actions={actions} />
        </div>
        {/* Actions sit about a third of the way up the panel (Figma 7:32157); the paused bar lives in that space. */}
        <div className="story-foot flex flex-col justify-end">
          {paused && (
            <div role="status" className="mx-x6 mb-x6 flex items-center gap-x3 rounded-x2 bg-accent-10-amber-default-background px-x3 py-x2">
              <Icon svg={pauseFilledRegular} size={14} className="!text-accent-10-amber-default-icon" aria-hidden />
              <Text as="span" variant="label-small-bold" className="text-text-primary">
                Timer paused
              </Text>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
