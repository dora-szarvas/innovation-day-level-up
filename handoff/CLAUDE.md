# Level Up: Midnight Train demo

Innovation Day 2026 (Pearson HED PSG) prototype.

**Level Up** is a new way of learning inside Pearson products: a library of games that use the course's own questions, matched to the learner's level, with every answer counting towards normal progress. **Midnight Train** is the story game in the library (inspired by Disco Elysium-style storytelling): the story is written once and reused across every course; only the questions change.

Tagline: *Level Up. Play the short game. Win the long one.*

## Your task

Rebuild the working prototype in `reference/index.html` using the **Nebula Web** design system (components, icons, tokens), keeping its behaviour, story and questions exactly as they are.

- `reference/index.html` is the source of truth for **behaviour**. Play it end to end before changing anything. The engine is the `ENGINE` section of its script.
- `data/*.json` is the source of truth for **content**. Load it; don't hard-code copy into components.
- Figma is the source of truth for **look**. See `docs/ui-map.md` for every frame and the matching Nebula component.
- Keep the story engine data-driven (`docs/story-format.md`). The pitch claims new stories and courses need no code changes, so the build must show that.

## Links

- Figma designs (Nebula Web library attached) (internal link, removed for sharing)
- Full episode script with text, audio and visual notes (internal link, removed for sharing)
- Current playable build (internal link, removed for sharing)
- Video script and storyboard (FigJam) (internal link, removed for sharing)

## Files

| Path | What it is |
| --- | --- |
| `reference/index.html` + `train.jpg` | Working single-file build (open via a local server) |
| `data/story.json` | Episode 1: 21 nodes of steps, flags and branches |
| `data/questions.json` | 12 sample General Biology MCQs (2 per check) with explanations, tutor reply and lesson source |
| `data/checks.json` | Check headers, base difficulty, framing lines, level names |
| `data/scene-config.json` | Backgrounds (placeholder variants of one image) and cast |
| `docs/story-format.md` | Step types, conditions, check and adaptivity logic, character type rules |
| `docs/ui-map.md` | Screens → Figma node ids → Nebula components, raw tokens, layout rules |

## Design rules (agreed, don't change without asking)

- **Text panel format:** narration is labelled **Narrator:**. Characters: **Name:** action, then “speech”. Player: **You:** “speech”. Inner voice (explanations): **Curiosity:** … No divider between consecutive lines from the same speaker, or straight after a checkpoint.
- **Writing:** at most 2 lines per beat and 3 beats before the player acts. Lines from one speaker sit under one name until someone else speaks.
- **Check card:** a verb header (e.g. CONVINCE HIM; no difficulty label), an in-story framing line, the question, 4 answers, then, once an answer is picked, confidence (Sure / Think so / Guessing) and Submit. The story never addresses the player directly.
- **Failing forward:** a wrong answer never blocks the story; it changes what happens next. Hide "Try another question" in story games (it undoes the consequence).
- **"Why was it wrong?"** shows only when asked. Explanations stay factual; the voice only adds the first line. "Ask the tutor" is a scripted sample in the demo.
- **No timers on questions.** The top-left timer is a 15-minute focus session that can be paused.
- **Art:** backgrounds and characters are AI placeholders; the team has pledged to commission an illustrator. The on-screen "illustration to be commissioned" labels are off for now (captions stay in `scene-config.json`).
- **Accessibility:** keyboard play (1–9 for actions, A–D or 1–4 for answers), visible focus, correct/wrong shown with icon and words (not colour alone), solid panel behind text, captions for audio, reduced-motion support.

## Constraints

- **Innovation Day rules:** all coding happens inside the 24-hour window; submission deadline is 8:00 AM Nov 5 (local time). Keep scope to what can be finished and tested in time.
- **AI guidelines:** no PII and no real learner data. The questions are written sample content, not Pearson course content. Real Study Prep items may be dropped into `questions.json` later only with the content owner's OK, and the build must then be hosted internally.
- **Hosting:** the judges must be able to open it. Confirm with the organisers whether a Git link or internal preview is required.

## Sounds

The reference build uses synthesised placeholders. Replace with files when supplied (same names): `wheels` (loop), `hornFar`, `hornNear`, `click`, `clack`, `door`, `steps`, `cups`, `tunnel`, `scrape`, `brakes`, `right`, `wrong`, `line`. Sound must be optional, with an on/off control; the game must work with sound off.

## Suggested build order

1. Project setup with the Nebula Web package and fonts; load the JSON data.
2. Game library and episode screen (with the "starting learner" demo setting).
3. Gameplay shell: background, timer chip, sound toggle, text panel log and actions.
4. Story engine (port from the reference) with flags, conditions, portraits and hotspots.
5. MCQ card with all states, confidence, explanation box and adaptivity.
6. Blackout, dawn and dining overlays; end screen with the character type.
7. Sounds, responsive layout, accessibility pass, then play every path:
   - scene 3 right → dining car as a passenger
   - scene 3 wrong → scene 4 talk or sneak → right (passenger) or wrong (bar shift)
   - scene 5 right / wrong × passenger annoyed or not → endings A, B, C

## Out of scope for the demo

Homepage banner trigger, playful/professional look switch, "Previously on…" for returning players, real data connections, other games in the library (shown as "Coming soon").
