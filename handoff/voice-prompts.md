# Midnight Train: voice prompts (PAICE)

Voices are optional. The text panel always carries the story, so it works as the captions, and the game must still work with sound off.

**42 recordings:** Narrator 22, Conductor 11, Stranger 6, Passenger 3. There are 3 more for the player, but those are optional and not recommended.

## Rules for what gets spoken

- **Narrator:** reads every narration line in full.
- **Characters:** speak **only the words inside the quote marks**. The action before or after a quote (e.g. "He touches his cap.") stays text only. Lines that are only an action, like "He flips open his notebook and starts writing.", get no recording.
- **Player ("You"):** leave unvoiced. The player is whoever is playing, and a fixed voice would make them someone specific. Prompts are at the end in case you want them anyway.
- **Same line twice:** where the same words are spoken in two places, record them once. The game reuses the file.

## Settings for every file

- Mono, MP3 or WAV, 44.1 or 48 kHz.
- Voice only: no music, no sound effects, no room echo. The game adds train sounds separately.
- Trim silence at the start and end, and keep all files at a similar loudness.
- British English. The places are Kingsmoor, the Hollow Tunnel and Ashford Halt.
- Name each file as in the tables below (e.g. `vo-narrator-01.mp3`).

---

## Voice descriptions

Paste the character's voice description into PAICE's voice field (or at the start of the prompt), then generate each line with its direction. Use the same voice settings for every line of a character so it stays one consistent voice.

### Narrator

> A warm, low, intimate narrator voice, gender-neutral or soft-spoken, in their forties, with a neutral British accent. Speaks in the second person, close to the listener's ear, like a thought in their own head. Unhurried and slightly wry, with a hint of late-night mystery. Calm pacing with natural pauses between sentences. Never theatrical, never booming.

### Passenger: older woman, asleep in your compartment

> An elderly British woman in her seventies, crisp and well-spoken, slightly husky with age. Dry, sharp wit with warmth underneath. Speaks briefly and to the point.

### Conductor: strict but fair, knows more than he says

> A British train conductor in his fifties, a steady, mid-low voice with a slight regional warmth (northern English). Polite and professional, with a firm edge when needed, and never shouts. Measured pace, clear diction, a man used to calling out station names.

### Stranger: travels alone with a map and half a ticket

> A woman in her late thirties with a smooth, low, controlled British voice. Elegant, amused and quietly mysterious, as if she always knows a little more than you. Speaks slowly and deliberately, with a hint of a smile in her voice.

---

## Lines

### Narrator

| File | Scene | Direction | Text |
| --- | --- | --- | --- |
| `vo-narrator-01` | 1 | Groggy, just waking, slow | You wake to the rattle of wheels. Night presses against the window. |
| `vo-narrator-02` | 1 | Quiet, observational, don't wake her | Across from you, an older woman sleeps, her hat tipped over her eyes. |
| `vo-narrator-03` | 1 | Puzzled, a little lost | Where did you get on? Your head is full of fog. |
| `vo-narrator-04` | 1 (coat pocket) | Small jolt of worry, then certainty | Empty. Your ticket was here. You're sure of it. |
| `vo-narrator-05` | 1 (window) | Distant, ominous, trailing off | Fog, and the long horn again. A tunnel, somewhere ahead. |
| `vo-narrator-06` | 1, remembered | Memory sharpening, quietly pleased | Kingsmoor. Platform two, the clock stuck at ten past. It comes back clearly. |
| `vo-narrator-07` | 1, not remembered | Unsure, self-mocking shrug | Kingsmoor? Kingsford? You wouldn't bet on either. |
| `vo-narrator-08` | 2 | Hushed, careful | Your suitcase sits on the rack, right above the sleeping woman. |
| `vo-narrator-09` | 2, lock opened | Whispered satisfaction, small smile on "Impressive" | The lock gives with the softest click. She doesn't stir. Impressive. |
| `vo-narrator-10` | 2, lock failed | Dry, slightly sheepish | She tips the hat back down. Pointedly. |
| `vo-narrator-11` | 2 | Discovery, then a dip on "The rest is gone" | Half a ticket, torn clean down the middle. You can make out "Kingsmoor" and a seat number. The rest is gone. |
| `vo-narrator-12` | 4, slipped past | Quick, sly, under the breath | You slip past mid-sentence. He doesn't look up. |
| `vo-narrator-13` | 5, as a passenger | Warm, scene-setting, curiosity on the last sentence | The dining car is nearly empty. A woman sits alone by the window, a map spread across her table. Half a ticket pins down one corner. |
| `vo-narrator-14` | 5, on shift | Wry on the apron, then curiosity | You tie on an apron that isn't yours. A woman sits alone by the window, a map spread across her table. Half a ticket pins down one corner. |
| `vo-narrator-15` | 5 (map) | Intrigued, lingering on "twice" | Stations circled in red ink. Ashford Halt, circled twice. |
| `vo-narrator-16` | 5, ticket won | Hushed wonder after the dark, relief at the end | Her seat is empty. The map is gone. In your hand: both halves of your ticket. |
| `vo-narrator-17` | 5, ticket lost | Hushed, deflated, then intrigue on "Next stop" | Her seat is empty. The ticket is gone. On the table, a napkin: "Next stop." |
| `vo-narrator-18` | 6 | Soft morning calm | Grey light creeps over the hills. The train is slowing. |
| `vo-narrator-19` | 6, ending A | Quietly content | The Conductor passes your door and gives you a nod. |
| `vo-narrator-20` | 6, ending B | Pleased surprise, short | The other half. It fits. |
| `vo-narrator-21` | 6, ending C | Dry, a little rueful | Her hat stays firmly over her eyes. |
| `vo-narrator-22` | 6, ending C | Rising tension, uh-oh | Someone is coming down the corridor. The Conductor, back again. |

### Conductor

| File | Scene | Direction | Text |
| --- | --- | --- | --- |
| `vo-conductor-01` | 3 | Polite, routine, friendly | Evening. Ticket, please. |
| `vo-conductor-02` | 3, wrong | Firm, unimpressed, not angry | Half a ticket is half a passenger. I need a valid ticket. |
| `vo-conductor-03` | 3, right, remembered | Satisfied, convinced | Kingsmoor. Makes sense. |
| `vo-conductor-04` | 3, right, guessed | Doubtful, then lets it go | Kingsmoor, you said? Hm. Fine. |
| `vo-conductor-05` | 3, right | Lowered voice, confiding | Funny thing. A woman in the dining car showed me half a ticket earlier. |
| `vo-conductor-06` | 3, right | Walking away, casual warning | Hold on to your things. The lights go out in the Hollow Tunnel. |
| `vo-conductor-07` | 4, wrong (both) | Stern but fair, a deal offered | No ticket, no ride. You can work it off. The bar's short-handed tonight. |
| `vo-conductor-08` | 4, wrong (both) | Walking away, casual warning | And hold on to your things. The lights go out in the Hollow Tunnel. |
| `vo-conductor-09` | 4, slipped past | Muttering to himself, distracted | Second half-ticket tonight. That woman in the dining car had one too. |
| `vo-conductor-10` | 4, caught | Sharp, catching you, raised eyebrow | Where do you think you're going? |
| `vo-conductor-11` | 6, all endings | Calling down the corridor, sing-song station call | Ashford Halt. Ashford Halt next. |

### Stranger

| File | Scene | Direction | Text |
| --- | --- | --- | --- |
| `vo-stranger-01` | 5, as a passenger | Amused, knowing, without looking up | There you are. I was beginning to think you'd miss the train entirely. |
| `vo-stranger-02` | 5, on shift | Cool, ordering, faintly teasing | A new face behind the bar. Tea, no sugar. And mind the map. |
| `vo-stranger-03` | 5 | Playful riddle, slow | Funny things, tickets. Half of one gets you nowhere. |
| `vo-stranger-04` | 5, right | Slow, approving smile | Hm. You'll do. |
| `vo-stranger-05` | 5, right, in the dark | Close whisper, intimate, mysterious | Next stop. Don't be late. |
| `vo-stranger-06` | 5, wrong | Mildly disappointed, cool | Not quite what I hoped. |

### Passenger

| File | Scene | Direction | Text |
| --- | --- | --- | --- |
| `vo-passenger-01` | 2, lock failed | Woken, irritated, dry | Some of us were sleeping. |
| `vo-passenger-02` | 6, ending A | Warm, knowing, one eye open | Found what you were looking for? |
| `vo-passenger-03` | 6, ending B | Kind, a little conspiratorial | A woman dropped this outside your door. In a hurry. |

### Player (optional, not recommended)

If you do voice the player, use a neutral, youngish adult voice that could belong to anyone:

> A young adult with a neutral, friendly British voice, gender-neutral, slightly breathless and earnest, someone who has just woken up on a train with no ticket.

| File | Scene | Direction | Text |
| --- | --- | --- | --- |
| `vo-you-01` | 3, right | Earnest, convincing | It tore when I boarded. The other half is on this train somewhere. |
| `vo-you-02` | 3, wrong | Flustered, rambling, trailing off | I had it, I really did. It was right here, and then I fell asleep, and… |
| `vo-you-03` | 4, right | Pleading, sincere | Please. Kingsmoor, seat 14. The rest of it is on this train, I promise. |
