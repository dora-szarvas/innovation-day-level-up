/*
 * Story engine — a port of the ENGINE section of handoff/reference/index.html.
 *
 * The engine knows nothing about React or the DOM. It walks the story data
 * (src/data/story.json, format in handoff/docs/story-format.md) and talks to the
 * screen through a `ui` adapter. A new episode, story or course is new JSON —
 * the engine never changes for content.
 *
 * ui adapter (all optional except the ones the story uses):
 *   setBg(key) · blink() → Promise · sfx(name) · stopWheels()
 *   showPortrait(id, mood) · hidePortrait(id, instant) · setMood(id, mood) · speaking(id|null)
 *   addEntry({ kind: 'narr'|'char'|'you', who, text, vo })   vo = recording to play, if any · addChosen(label) · addCheckpoint({ verb, ok })
 *   waitContinue() → Promise · choose({ prompt, opts, used }) → Promise<index>
 *   runCheck({ key, check, item, level, adapted }) → Promise<{ ok, conf }>
 *   dark(mode, text)   mode: 'on' | 'text' | 'off'
 *   beat(text) → Promise   pause for the line just shown (its voice, or reading time)
 *   end({ flags, results })
 */

export const ABORTED = Symbol('aborted')

export function cond(c, flags) {
  if (!c) return true
  const list = Array.isArray(c) ? c : [c]
  return list.every((k) => (k[0] === '!' ? !flags[k.slice(1)] : !!flags[k]))
}

export function createEngine({ story, checks, questions }, ui, { startLevel = 0, reduceMotion = false } = {}) {
  const state = { flags: {}, level: startLevel, results: [], used: {} }
  let aborted = false

  const guard = (p) =>
    Promise.resolve(p).then((v) => {
      if (aborted) throw ABORTED
      return v
    })
  const sleep = (ms) => guard(new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 150) : ms)))
  const cast = (id) => ui.castName?.(id) ?? id
  let lastText = ''

  function pickItem(key) {
    const check = checks.checks[key]
    // Level 1+ serves the stretch item ([1]) and labels it one level up.
    const variant = state.level >= 1 ? 1 : 0
    const item = questions.items[key][variant]
    const lvl = Math.min(check.base + variant, checks.levels.length - 1)
    return { key, check, item, level: checks.levels[lvl], adapted: variant !== 0 }
  }

  async function runCheck(key) {
    const q = pickItem(key)
    const { ok, conf } = await guard(ui.runCheck(q))
    state.results.push({ key, ok, conf })
    state.level = ok ? Math.min(state.level + 1, 2) : Math.max(state.level - 1, 0)
    ui.addCheckpoint?.({ verb: q.check.verb, ok })
    return ok
  }

  async function choose(step) {
    for (;;) {
      const i = await guard(ui.choose({ prompt: step.choice, opts: step.opts, used: { ...state.used } }))
      const o = step.opts[i]
      if (o.label !== 'Continue') ui.addChosen?.(o.label)
      if (o.sfx) ui.sfx?.(o.sfx)
      if (o.look) {
        // A look adds a line and keeps the choice open, marked as used.
        state.used[o.label] = true
        ui.addEntry({ kind: 'narr', who: cast('narrator'), text: o.look, vo: o.vo })
        lastText = o.look
        continue
      }
      return o
    }
  }

  async function run(node) {
    for (;;) {
      const steps = story.nodes[node]
      if (!steps) throw new Error(`Story node "${node}" not found`)
      let next = null
      for (const st of steps) {
        if (aborted) throw ABORTED
        if (!cond(st.if, state.flags)) continue
        if (st.bg) ui.setBg?.(st.bg)
        else if (st.blink) await guard(ui.blink?.())
        else if (st.sfx) ui.sfx?.(st.sfx)
        else if (st.wait) await sleep(st.wait)
        else if (st.beat) await guard(ui.beat ? ui.beat(lastText) : sleep(1200))
        else if (st.show) {
          ui.showPortrait?.(st.show, st.mood)
          ui.speaking?.(null)
          await sleep(350)
        } else if (st.hide) ui.hidePortrait?.(st.hide, !!st.instant)
        else if (st.mood) ui.setMood?.(st.mood, st.v)
        else if (st.flag) state.flags[st.flag] = true
        else if (st.n) {
          ui.speaking?.(null)
          ui.addEntry({ kind: 'narr', who: cast('narrator'), text: st.n, vo: st.vo })
          lastText = st.n
          await sleep(450)
        } else if (st.who) {
          ui.speaking?.(st.who)
          ui.addEntry({ kind: 'char', who: cast(st.who), text: st.t, vo: st.vo })
          lastText = st.t
          await sleep(450)
        } else if (st.you) {
          ui.speaking?.(null)
          ui.addEntry({ kind: 'you', who: 'You', text: st.you, vo: st.vo })
          lastText = st.you
          await sleep(450)
        } else if (st.dark !== undefined) {
          if (st.dark === 'text') ui.dark?.('text', st.t)
          else if (st.dark) {
            ui.dark?.('on')
            ui.stopWheels?.()
            await sleep(900)
          } else {
            ui.dark?.('off')
            await sleep(400)
            ui.sfx?.('wheels')
          }
        } else if (st.cont) await guard(ui.waitContinue())
        else if (st.go) {
          next = st.go
          break
        } else if (st.choice !== undefined) {
          const o = await choose(st)
          if (o.check) {
            const ok = await runCheck(o.check)
            next = o.check + (ok ? '_r' : '_w')
          } else next = o.next
          break
        }
      }
      if (!next) return
      if (next === 'END') {
        ui.end?.({ flags: { ...state.flags }, results: [...state.results] })
        return
      }
      node = next
    }
  }

  return {
    state,
    start: () =>
      run(story.start).catch((e) => {
        if (e !== ABORTED) throw e
      }),
    abort: () => {
      aborted = true
    },
  }
}
