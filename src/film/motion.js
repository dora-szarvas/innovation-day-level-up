// Film mode motion helpers. Everything is a pure function of time `t` (seconds into the
// sequence), so every take — and every scrub position — renders the same frame.

export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const lerp = (a, b, p) => a + (b - a) * p
export const lerp2 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]

const EASE = {
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  in: (p) => p * p * p,
  out: (p) => 1 - Math.pow(1 - p, 3),
}
export const ease = (name = 'inOut') => EASE[name] ?? EASE.inOut

/** 0→1 progress of `t` through [from, from + duration], eased. */
export function progress(t, from, duration, easing = 'inOut') {
  if (duration <= 0) return t >= from ? 1 : 0
  return ease(easing)(clamp01((t - from) / duration))
}

/**
 * Evaluate keyframes [{ t, ...values }] at time t. The last keyframe at or before t wins
 * (later entries win ties, so a `cut` keyframe can share a time with the one before it).
 * Between it and the next keyframe, values interpolate with the next keyframe's ease —
 * unless the next one is a `cut`, which holds until it arrives.
 */
export function keyframeSpan(frames, t) {
  let i = -1
  for (let k = 0; k < frames.length; k++) if (frames[k].t <= t) i = k
  if (i < 0) return { a: frames[0], b: null, p: 0 }
  const a = frames[i]
  const b = frames[i + 1]
  if (!b || b.cut || b.t <= a.t) return { a, b: null, p: 0 }
  return { a, b, p: ease(b.ease)((t - a.t) / (b.t - a.t)) }
}

/** Piecewise value from [{ t, <key> }] keyframes, eased in-out between neighbours. */
export function track(frames, key, t) {
  const { a, b, p } = keyframeSpan(frames, t)
  return b ? lerp(a[key], b[key], p) : a[key]
}

/** Is t inside any of the [{ from, to }] windows? Returns 0–1 with a short fade at each edge. */
export function windowOpacity(windows, t, fade = 0.12) {
  let o = 0
  for (const w of windows) {
    if (t < w.from || t > w.to) continue
    o = Math.max(o, Math.min(clamp01((t - w.from) / fade), clamp01((w.to - t) / fade)))
  }
  return o
}

/**
 * Cursor position. Each move glides from its `from` (or the previous move's target) to
 * its target; between moves the cursor rests on the last target. `resolve(name)` returns
 * a screen point for a target, or null if it isn't on screen.
 */
export function cursorPoint(cursor, t, resolve, memory) {
  const moves = cursor.moves
  let i = -1
  for (let k = 0; k < moves.length; k++) if (moves[k].t0 <= t) i = k
  if (i < 0) return moves[0].from
  const m = moves[i]
  const target = resolve(m.to)
  if (target) memory[m.to] = target
  const to = target ?? memory[m.to] ?? m.from ?? [960, 540]
  const prev = moves[i - 1]
  const from = m.from ?? (prev && (resolve(prev.to) ?? memory[prev.to])) ?? to
  if (t >= m.t1) return to
  return lerp2(from, to, ease(m.ease)((t - m.t0) / (m.t1 - m.t0)))
}

/** Press (0–1, peaks just after a click) and ripple (0–1 age) for the nearest past click. */
export function clickState(clicks, t) {
  let last = null
  for (const c of clicks) if (c <= t) last = c
  if (last === null) return { press: 0, ripple: null }
  const age = t - last
  const press = age < 0.09 ? age / 0.09 : age < 0.22 ? 1 - (age - 0.09) / 0.13 : 0
  const ripple = age < 0.5 ? age / 0.5 : null
  return { press, ripple }
}
