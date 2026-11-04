// Character type for the end screen (rules in handoff/docs/story-format.md).
// Confidence: Sure = 1, Think so = 0.5, Guessing = 0.
export const CONFIDENCE = ['Guessing', 'Think so', 'Sure']
const CONF_VALUE = { Sure: 1, 'Think so': 0.5, Guessing: 0 }

export function characterType(results) {
  const n = results.length || 1
  const acc = results.filter((x) => x.ok).length / n
  const conf = results.reduce((s, x) => s + CONF_VALUE[x.conf], 0) / n
  const sureWrong = results.filter((x) => !x.ok && x.conf === 'Sure').length
  const unsureRight = results.filter((x) => x.ok && x.conf === 'Guessing').length
  if (acc >= 0.75 && conf >= 0.75) return 'oracle'
  if (sureWrong >= 2 || conf - acc >= 0.3) return 'improviser'
  if (unsureRight >= 2 || acc - conf >= 0.3) return 'genius'
  if (acc < 0.5 && conf < 0.5) return 'explorer'
  return 'detective'
}
