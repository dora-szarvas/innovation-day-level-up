# UI map: screens, Figma frames and Nebula components

Figma file: Innovation Day – Level up (internal, link removed for sharing)
Components section: node `7:32129`
Libraries on the file: **Nebula Web** and A11y Annotations for Pearson.

Nebula component names below are the instance names used in the Figma frames. Confirm the coded equivalents in the Nebula package.

## Screens

| Screen | Figma frame (node id) | Notes |
| --- | --- | --- |
| Game library | `7:32325`, hover state `7:34973` | Uses `_bg-experimental`. Filters: All, Adventure, Arcade, Strategy. Only Midnight Train is playable |
| Episode screen, new player | `7:32304` | Episode list, Start button. Demo adds a "starting learner" setting |
| Episode screen, returning player | `7:33828` | Adds "Previously on…" card. Not used in the demo yet |
| Text panel, 1 action | `7:32180` | Continue-style action |
| Text panel, 2 actions | `7:32157` | Numbered actions under "What would you like to do?" |
| MCQ open, default | `7:32130` | Background panel blurred and dimmed |
| MCQ, answer selected | `38:35929` | Confidence row enabled |
| MCQ, answer + confidence selected | `38:36093` | Submit enabled |
| MCQ, answer incorrect | `7:32196` | Wrong answer red, correct answer blue, feedback line |
| MCQ, incorrect + "Why was it wrong?" | `7:32223` | Explanation box with "Features in: Lesson…" |
| MCQ, answer correct | `7:32250` | Correct answer green |
| MCQ, correct + "Explain solution" | `7:32277` | Explanation box |
| Timer in progress / paused | `7:35592` / `7:35642` | Paused shows "Timer paused" bar at the bottom of the panel |
| End of episode | `40:11364` | Simple version built from the episode screen |

## Components

| UI part | Nebula component (from Figma) | States |
| --- | --- | --- |
| Primary button (Start, Submit, Continue) | `Button` (filled) | Default, hover, disabled |
| Secondary button (Play again) | `Button` (outline) | Default, hover |
| Episode status icon | `Button` (icon, 40×40) | Current (play), replay, locked |
| Timer chip | `Chip` with `Pause` and `_progress-circular-base` | Running, paused |
| Checkpoint divider | `Chip` with `Divider (left)` / `Divider (right)` | Label: "Checkpoint" or the check header |
| Log separators | `divider-horizontal` | |
| Answer option | `Learn/Lesson/Problem` | Default, hover, selected, correct, incorrect, correct-shown, disabled |
| Confidence buttons | `Tag` | Default, selected, disabled |
| "Why was it wrong?" / "Explain solution" | Pill button with gradient border | Closed, open |
| Game cards | `Learn/Lesson-card`, `card - nebula` | Playable, coming soon, hover |

## Tokens read from the frames

Use Nebula variables where they exist. These are the raw values found, for reference only.

| Role | Value |
| --- | --- |
| Panel and MCQ surface | `#272247` |
| Episode card | `#0d004d` at 75%, background blur 24 |
| Accent (lavender) | `#c1bfff`; fills at 8% and 20%, strokes at 30% |
| Text / muted / subtle | `#ffffff` / `#e7e6ec` / `#b5b0c5` |
| Incorrect | fill `#391619`, stroke `#ffa1a4`, text `#ffc0c1` |
| Correct answer shown after a wrong pick | fill `#20334c`, stroke `#a8c2eb` |
| Correct feedback text | `#b1f4ce` |
| Radii | Options 12, MCQ card 16, episode card 24, chips and tags 4, buttons full pill |
| Fonts | Plus Jakarta Sans Medium (titles, question text), Noto Sans Regular/Bold (body, UI), Noto Sans Display (answer letters) |

## Layout rules

- Text panel: 416 px wide, docked right with a 48 px gap to the edge, full height.
- MCQ card: up to 1000 px wide, centred near the bottom, overlapping the dimmed panel.
- Under 960 px wide: panel becomes a bottom sheet (about 52% height), answers in one column.
