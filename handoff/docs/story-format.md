# Story format (data/story.json)

The story is data, not code. A new episode, story or course needs new JSON, not engine changes. Keep it that way when porting.

## Structure

```json
{ "start": "s1", "nodes": { "s1": [ step, step, ... ], "remember_r": [ ... ] } }
```

The engine runs a node's steps in order. A node ends with a `go`, a `choice` or the `END` target.

## Step types

| Step | Example | What the engine does |
| --- | --- | --- |
| `bg` | `{"bg":"corridor"}` | Switches background and tint (keys in `scene-config.json`) |
| `blink` | `{"blink":1}` | First-person eyes-opening effect (~1.8 s) |
| `sfx` | `{"sfx":"hornFar"}` | Plays a sound (names listed in CLAUDE.md) |
| `wait` | `{"wait":900}` | Pause in ms (shortened under reduced motion) |
| `show` | `{"show":"conductor","mood":"Friendly"}` | Portrait slides in with an expression |
| `hide` | `{"hide":"stranger","instant":1}` | Portrait slides out (or disappears instantly, e.g. in the blackout) |
| `mood` | `{"mood":"conductor","v":"Displeased"}` | Changes a visible character's expression |
| `flag` | `{"flag":"on_shift"}` | Sets a flag the story remembers |
| `n` | `{"n":"The train is slowing."}` | Narration line, no name |
| `who` | `{"who":"conductor","t":"He catches your sleeve. “…”"}` | Character line: **Name:** action “speech”. Speaker portrait lit, others dimmed |
| `you` | `{"you":"“It tore when I boarded.”"}` | Player line, labelled **You:** |
| `dark` | `{"dark":1}` / `{"dark":"text","t":"…"}` / `{"dark":0}` | Blackout on, text on black, blackout off |
| `cont` | `{"cont":1}` | Waits for the player to press Continue |
| `beat` | `{"beat":1}` | Lets the line just shown land, then moves on by itself: waits for its voice to finish, or a reading pause (about 45 ms per character, 1.5–4 s) when voices are off |
| `go` | `{"go":"s2"}` | Jumps to another node |
| `choice` | see below | Shows numbered actions and waits |

Any `n`, `who` or `you` step, and any option with a `look`, can carry `"vo"`: the name of a voice recording in `src/assets/voice/` (e.g. `{"n":"…","vo":"vo-narrator-01"}`). Lines that land back to back play in order; the player acting (Continue, a choice, a check) stops the voice. A step without `vo` is text only.

Any step can carry `"if"`: a flag name, `"!flag"` for not set, or an array meaning all must match. Example: `"if":["!ticket_found","passenger_annoyed"]`.

## Choices

```json
{"choice":"What would you like to do?","opts":[
  {"label":"Check your coat pocket","look":"Empty. Your ticket was here.","spot":[22,72]},
  {"label":"Try to remember where you boarded","check":"remember"},
  {"label":"Step into the corridor","next":"s3"}
]}
```

- `look`: adds a narration line and keeps the choice open (marked as used). `spot` = hotspot position on the background in % (x, y).
- `check`: opens the MCQ for that check, then continues at `<check>_r` (right) or `<check>_w` (wrong).
- `next`: jumps to a node. `"next":"END"` opens the end-of-episode screen.
- `sfx` on an option plays when it's picked.

## Checks (data/checks.json + data/questions.json)

- Each check has a header verb, a base difficulty index into `levels` and an in-story framing line.
- `questions.json` has two items per check: `[0]` standard, `[1]` stretch.
- Learner level starts at 0 (new) or 1 (confident), from the demo setting. It goes up by 1 after a right answer and down by 1 after a wrong one (range 0–2). Level 1 or higher serves the stretch item, and the label shows `levels[base + 1]` with "stretched for you".
- In the product, item selection should come from the course's adaptive practice service or proficiency scores instead.

## Character type (end screen)

Calculated from every check answered: accuracy, and confidence (Sure = 1, Think so = 0.5, Guessing = 0).

1. Accuracy ≥ 75% and confidence ≥ 0.75 → The Oracle
2. Two or more "Sure" but wrong, or confidence − accuracy ≥ 0.3 → The Bold Improviser
3. Two or more "Guessing" but right, or accuracy − confidence ≥ 0.3 → The Secret Genius
4. Accuracy < 50% and confidence < 0.5 → The Explorer
5. Otherwise → The Detective
