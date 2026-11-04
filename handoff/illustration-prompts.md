# Midnight Train: illustration prompts (PAICE)

What the episode needs: **4 backgrounds** (3 places, plus a dawn version of the compartment) and **3 characters in 7 expressions**. The blackout, the blink and the luggage-rack close-up need no art: the blackout and blink are black screens, and the build zooms into BG1 for the close-up.

## How to use these

1. Paste the **style block** at the start of every background prompt, and the **character style block** at the start of every portrait, so all images match the existing train cover.
2. Paste the **avoid** line into the negative prompt field. If PAICE has no such field, add it to the end of the prompt as "Avoid: …".
3. **Characters:** make each character's first expression, pick the best result, and use it as the reference image for that character's other expressions. That keeps the face and outfit the same.
4. **Hotspots:** the clickable spots (coat pocket, window, map) are positions in `src/data/story.json`. Once the art is in, send me where those things ended up and I'll move the spots to match.

### Style block (paste first, every time)

> Flat vector illustration with soft gradients and fine grain texture, in the style of a modern editorial travel poster. Night palette of deep indigo, violet and purple, with glowing magenta-pink and cyan-teal light accents and a warm amber moon. Simple geometric shapes, no outlines, gentle rim lighting, calm cinematic mood, slightly mysterious, a quiet 1950s night train.

### Character style block (paste first for every portrait instead)

> Flat vector character illustration with soft gradients and fine grain texture, in the style of a modern editorial travel poster. Simple geometric shapes, no outlines, expressive but simplified face. Palette of deep indigo, violet and plum with soft skin tones, lit by cool moonlight with a gentle magenta-violet rim light and a faint cyan-teal edge glow. Single character only, isolated on a plain transparent background, no scenery.

### Avoid (negative prompt, every time)

> text, letters, numbers, signage, logos, watermark, photorealism, 3D render, anime, harsh black outlines, cluttered detail, extra fingers, distorted hands, gore

---

## Backgrounds

All backgrounds: **landscape 16:9, 2560 × 1440 px or larger, no people.**

Layout rules, because the game UI sits on top:

- The story panel covers roughly the **right third**. Keep the subject in the left two-thirds, and keep the right third quieter.
- Characters slide in at the **bottom left**, so keep that corner simple: no important detail there.
- On phones the panel covers the **bottom half**, so the strongest focal point should sit in the upper half.

### BG1: Your compartment, night (scenes 1 and 2)

Mood: hushed, drowsy, a little uneasy. You've just woken up with no ticket.

> [style block] Interior of a small old-fashioned sleeper train compartment at night, seen from the traveller's seat. Opposite: an empty upholstered bench seat in deep plum fabric with brass fittings. Upper left: a large window showing a foggy moonlit night with blurred dark trees and a faint amber moon. Above the opposite bench, a brass luggage rack holding a worn leather suitcase with two combination locks, clearly visible in the upper-left area. A long travelling coat hangs from a hook on the left wall, its pocket visible at the lower left. A single small warm reading lamp, mostly dim. Cool moonlight from the window, magenta glow in the shadows. Quiet, sleepy, mysterious atmosphere. Empty compartment, no people.

Notes:
- The suitcase on the rack matters: scene 2 zooms in on it (upper left, around a third across and a third down).
- Window, coat pocket and suitcase are all story items, so each should be easy to pick out.

### BG1 dawn: Your compartment at dawn (scene 6)

Mood: relief, a new day, the train slowing. Start from BG1 as a reference image so the composition matches.

> [style block] The same sleeper train compartment as the reference image, same composition and objects, now at dawn. Soft grey-pink dawn light pours through the window over misty rolling hills. Warm peach and rose light replaces the moonlight, while shadows stay soft violet. The lamp is off. Calm, hopeful, quiet morning atmosphere. Empty compartment, no people.

### BG2: The corridor (scenes 3 and 4)

Mood: narrow and watchful. Someone in authority is coming.

> [style block] A long narrow corridor in an old night train, seen in one-point perspective and receding to the left. Wood-panelled walls in dark violet, a patterned carpet runner, a row of brass handrails. The windows along one side show the foggy night outside, and the closed sliding doors of compartments line the other side. Small wall lamps cast pools of warm pink light, with cyan-teal light glowing faintly at the far end. A slightly tense, expectant atmosphere, as if footsteps are about to arrive. Empty corridor, no people.

### BG3: The dining car (scene 5)

Mood: warm but secretive, late and nearly empty. A clue is waiting.

> [style block] Interior of a vintage dining car late at night, nearly empty. Rows of small tables with white tablecloths and little shaded table lamps glowing warm amber. Upper left: a small bar counter with teacups and a teapot. Near the centre: one window table with a large folded paper map spread across it, a teacup and a small torn paper ticket pinning down one corner of the map; the empty chair faces the viewer. Dark windows show the passing night. Warm amber lamplight against deep violet shadows, a hint of magenta. Intimate, secretive, slightly mysterious mood. No people.

Notes:
- The map table is the clickable spot, so make it a clear focal point in the middle area, not in the right third.
- Keep the map free of readable text. The station names are in the story text.

---

## Characters

All portraits: **portrait 2:3, at least 1024 × 1536 px**, plain transparent background (or one flat colour that's easy to cut out, if transparency isn't available). Chest-up, three-quarter view, **facing and looking to the right** (towards the story panel). Head in the upper third; the bottom edge cuts through the body, because the portrait slides up from the bottom of the screen. Light them with soft neutral moonlight and a gentle violet rim light so they work in every scene.

Prompt order for every portrait: **character style block**, then that character's **character block**, then the expression line.

### Passenger: an older woman asleep in your compartment

**Character block:**

> An elderly woman in her seventies with soft rounded features and silver hair in a low bun, wearing a wide-brimmed dark plum felt hat with a small feather, a heavy mulberry wool travelling coat with large buttons, a knitted mustard scarf and a small round brooch. Her hands rest on a worn leather handbag in her lap. Portrait, chest-up, three-quarter view facing right, plain background.

**1. Asleep** (scenes 1–2, ending C). Make this one first and use it as the reference for the others.

> [character style block] [character block] She is fast asleep: her hat is tipped forward over her eyes, chin dropped slightly, mouth a little open, shoulders relaxed. Peaceful, slightly comic, cosy.

**2. Annoyed** (scene 2, wrong answer)

> [character style block] [character block] She has just been woken by a loud noise: one hand lifts the hat brim up off her eyes, and she glares sideways with narrowed eyes, lowered brows and lips pressed tight. Irritated but not hostile, a dry "some of us were sleeping" look.

**3. Kind** (endings A and B)

> [character style block] [character block] Morning version: her hat is pushed back, one eye open, with a warm knowing half-smile and soft eyes. Gentle, grandmotherly, quietly pleased for you.

Optional: a version of Kind holding out a small torn paper ticket, for ending B, where she hands it over.

### Conductor: strict but fair, knows more than he says

**Character block:**

> A train conductor in his fifties with a neat grey moustache and a lined, sharp but fair face, wearing a dark navy uniform jacket with brass buttons, a matching peaked cap with a plain brass badge (no lettering), and a ticket punch on a chain. He holds a small black notebook and a pencil. Portrait, chest-up, three-quarter view facing right, plain background.

**1. Friendly** (scene 3 opening, the "right answer" hint)

> [character style block] [character block] He touches the brim of his cap politely with two fingers, with a small courteous smile and attentive eyes. Notebook held at his side. Professional, welcoming, quietly observant.

**2. Displeased** (scenes 3–4, wrong answers)

> [character style block] [character block] His pencil has stopped above his open notebook. He looks down at you with one eyebrow raised, a slight frown, moustache set in a firm line. Stern and unimpressed, but not angry, a "rules are rules" look.

### Stranger: travels alone with a map and half a ticket

**Character block:**

> A composed woman in her late thirties with a sleek dark bob, sharp elegant features and dark red lipstick, wearing a long deep teal wool coat with a high turned-up collar, slim leather gloves and a small silver pendant shaped like a compass. Between two gloved fingers she holds a torn half of a paper train ticket. Portrait, chest-up, three-quarter view facing right, plain background.

**1. Amused** (scene 5, used in the build)

> [character style block] [character block] She doesn't quite look at you: eyes glancing sideways, one eyebrow slightly raised, a small knowing smile at one corner of her mouth. Playful, mysterious, in control, as if she's been expecting you.

**2. Neutral** (in the script's cast list; not used by the build yet)

> [character style block] [character block] Calm, watchful, unreadable expression, looking straight ahead with steady eyes and a closed mouth. Cool and patient.

---

## Library covers

The game cards in the library (Snake, Battleships, the Orbit game and Midnight Train) already have finished art in the Figma library frame (node `7:32325`). Export those rather than generating new ones. The build currently uses simple placeholder drawings for them.

## File names to send back

| Image | File name |
| --- | --- |
| Compartment, night | `bg-compartment.jpg` |
| Compartment, dawn | `bg-compartment-dawn.jpg` |
| Corridor | `bg-corridor.jpg` |
| Dining car | `bg-dining.jpg` |
| Passenger | `passenger-asleep.png`, `passenger-annoyed.png`, `passenger-kind.png` |
| Conductor | `conductor-friendly.png`, `conductor-displeased.png` |
| Stranger | `stranger-amused.png`, `stranger-neutral.png` |

Keep the placeholder labels ("illustration to be commissioned") in the build until the commissioned illustrations replace these AI images.
