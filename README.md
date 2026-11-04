# Level Up: Midnight Train

**Level Up** is a new way of learning inside Pearson products: a library of games that use the
course's own questions, matched to the learner's level, with every answer counting towards their
normal progress. **Midnight Train** is the story game in that library: a short mystery on a night
train where you talk your way past the Conductor and other passengers by answering course
questions, and your confidence and mistakes shape how the characters respond. The story is written
once and reused across every course; only the questions change. This repository is the Innovation
Day 2026 prototype, built on the Nebula Web design system (alpha.15).

> **Placeholder content.** All art, characters, voices and sounds are placeholders (AI-generated
> illustrations and voice lines, synthesised sound effects), not final assets. The questions are
> sample General Biology content written for the demo, not real course material.

## Run it locally

Needs Node 20.19 or newer and access to Pearson's npm registry for the `@pearson-ux` Nebula packages
(configured in your own `~/.npmrc`, never in this repo).

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173/>. For a production build:

```bash
npm run build
npm run preview
```

The preview runs at <http://localhost:4173/>. The build uses relative asset paths and hash routes, so
`dist/` can be served from any subpath.

## Routes

### Demo (`index.html`)

| Route | Screen |
| --- | --- |
| `#/` | Game library (every visit starts here, even from a deep link) |
| `#/midnight-train` | Midnight Train episodes and session length |
| `#/midnight-train/play` | The game |
| `#/midnight-train/end` | End screen with your character type |

### Film mode (`film.html`)

A self-running 13 s sequence of the demo for screen recording, on a letterboxed 1920 × 1080 stage
with a 1 s hold at each end (15 s in total). It doesn't change the demo. Press **Space** (or Start)
to play and **R** to restart.

| URL | What it does |
| --- | --- |
| `film.html` | Start screen, then the sequence scaled to fit the window |
| `film.html?scale=1` | 1:1 pixels (for a 1920 × 1080 capture) |
| `film.html?audio=off` | Silent take |
| `film.html?debug=1` | Scrub bar, play/pause and timecode (for editing only) |

The sequence (camera, cursor, lines, sounds) is set in `src/film/timeline.json`.
`film-stage.html` is the frame film mode draws into; it isn't meant to be opened on its own.

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/story.json`, `questions.json`, `checks.json`, `scene-config.json` | Story, sample questions and checks. A new story or course is new JSON, not code |
| `src/data/library.json`, `episode.json` | Library, episode list and end-screen copy, including character type names |
| `src/game/engine.js` | Story engine. Knows nothing about React; it talks to the screen through a `ui` adapter |
| `src/game/sound.js` | Placeholder synth sounds. Drop real files into `src/assets/sounds/` with the same names (`wheels.mp3` etc.) and they replace the synth |
| `src/assets/scenes/`, `src/assets/cast/`, `src/assets/posters/` | Placeholder background, portrait and poster art (WebP). `scene-config.json` names each file, its focus point, zoom, where portraits stand, and which image goes with each mood |
| `src/assets/voice/`, `src/game/voice.js` | Placeholder voice lines (AAC). A step's `"vo"` in `story.json` names its file; lines play in order and stop when the player acts |
| `src/game/characterType.js` | End-screen character type rules |
| `src/screens/` | Library → Episodes → Game → End |
| `src/components/McqCard.jsx` | Check card: every state, confidence, explanation, scripted tutor reply |
| `src/film/` | Film mode: shell, stage, timeline and sounds |
| `handoff/` | The original brief, reference build, and illustration and voice prompts |

## Keyboard

1–9 pick actions · A–D or 1–4 pick answers · Tab to the confidence row, Space to choose · Enter submits or continues.
