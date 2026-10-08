# 🎬 TRAILNOTE — 90-SECOND DEMO SCRIPT

> **Hacktoberfest 2026 — Open-Source AI Challenge Week 1: TOUCH GRASS**  
> *Target Duration: 60–90 seconds*  
> *Tone: Quiet, direct, honest, outdoor field notebook aesthetic.*  
> *Core Rule: "Plan the walk. Make the note. Put the phone away."*

---

## ⏱️ Timeline & Shot Breakdown

### [0:00 - 0:15] — Scene 1: The Problem & The Touch Grass Philosophy
- **Screen**: Landing Page (`http://localhost:3000/`)
- **Visual**:
  - Show the quiet paper-toned landing page and season-aware badge ("Season: Autumn foliage & seeds").
  - Point out the honest status badge in the navbar: *"Guide: Gemma 2 active"* (or *"Guide: built-in rules"* on hosted demo).
- **Spoken Audio**:
  > *"Most outdoor apps keep you glued to your phone with step goals, social feeds, and notification rings. Trailnote does the opposite: the screen should be the shortest part of the walk. We use local Gemma 2 to synthesize a field guide in under three minutes—so the phone stays in your pocket once your boots hit the trail."*
- **Action**: Click **`[ Plan a Walk ]`**.

---

### [0:15 - 0:35] — Scene 2: Planning & Screen-Time Ledger
- **Screen**: Planning Page (`/plan`)
- **Visual**:
  - Search a location (e.g. "Seminary Hills, Nagpur") using rate-throttled OpenStreetMap Nominatim search.
  - Click **`[ Use My Current Location ]`** to show the strict separation between device GPS (`Accurate to ~12m`) and selected trail coordinates.
  - Pick walking time (45 mins) and nature curiosities (Foliage, Bird songs, Basalt rocks).
  - Note the invisible **Screen-Time Ledger** actively measuring planning time via the Page Visibility API.
- **Spoken Audio**:
  > *"On the planning permit, you choose your trail and curiosities. OpenStreetMap and OSRM compute the real footpath geometry, distance, and elevation. We never let the AI invent coordinates or physical numbers."*
- **Action**: Click **`[ Issue Trail Permit & Generate Card ]`**.

---

### [0:35 - 0:50] — Scene 3: The Trail Guide & Sunset Safety
- **Screen**: Trail Result Guide (`/trail`)
- **Visual**:
  - Show the **Sunset Deadline**: *"Sunset: 18:04 · Be back by 17:19 (Safe return before nightfall)"*.
  - Show the interactive Paper Trail Map and inline SVG elevation profile.
  - Show the **Gemma 2 naturalist briefing** and sensory observation targets.
- **Spoken Audio**:
  > *"Trailnote computes our sunset deadline with Open-Meteo to guarantee safe daylight return, renders an elevation profile, and uses local Gemma 2 to give us three specific things to notice with our eyes, ears, and touch."*
- **Action**: Click **`[ Make Trail Card ]`**.

---

### [0:50 - 1:10] — Scene 4: Handheld Trail Card & Pocket Mode
- **Screen**: Trail Card (`/trail-card`) → Walk Mode (`/walk`)
- **Visual**:
  - Show the printable **Trail Card** with inline vector route SVG that works completely offline.
  - Show the **A4 & Pocket-Fold** print layout with folding guidelines.
  - Click **`[ Start Walk ]`** to enter Walk Mode.
  - Switch to **`[ Pocket Mode ]`**: screen turns near-black, high contrast, 48px+ touch target with **"Tap to reveal"**, opt-in speech synthesis prompt, and automatic screen wake lock release.
- **Spoken Audio**:
  > *"You can print this pocket-fold card on paper, or enter Pocket Mode on your phone: a near-black, low-power screen that releases the wake lock and reads prompts aloud with browser speech synthesis so you never need to look down."*
- **Action**: Click **`[ Finish Walk ]`**.

---

### [1:10 - 1:30] — Scene 5: Ledger Metrics & Offline Field Journal
- **Screen**: Walk Finished Screen → Journal (`/journal`)
- **Visual**:
  - Point out the **Screen-Time Ledger**: *"Planned in 2m 14s. Outside for 46m 30s."*
  - Take a field photo with camera (`capture="environment"`), stored 100% locally in IndexedDB as a compressed Blob.
  - In Journal, show the raw note preserved, and click **`[ Shape This Note ]`** to show Gemma 2 transforming the field notes into quiet prose with an explicit Accept/Reject button.
- **Spoken Audio**:
  > *"When the walk finishes, the ledger confirms: planned in two minutes, outside for forty-six. Your notes and compressed photos stay in your browser disk. Zero cloud database, zero paid APIs, zero tracking. Plan the walk. Make the note. Put the phone away."*
- **Closing Title Card**:
  > **TRAILNOTE**  
  > Hacktoberfest 2026 // TOUCH GRASS  
  > *github.com/AnshMeshram/TrailNote · trailnote.netlify.app*

---
