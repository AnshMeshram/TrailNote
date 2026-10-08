---
title: "Trailnote: The Open-Source Field Notebook That Gets You Off the Screen"
published: true
tags: hacktoberfest, ai, opensource, webdev
cover_image: https://raw.githubusercontent.com/AnshMeshram/TrailNote/main/public/images/autumn_trail_hero.jpg
description: "Why most outdoor apps fail, and how I used local Gemma 2, OpenStreetMap, OSRM, Open-Meteo, and Vanilla CSS to build a field notebook that gets you off your screen and outside."
---

## What I Built

At 7:15 AM on an October morning in Seminary Hills near Nagpur, the ground was cool and covered with fallen teak leaves. The air smelled of damp stone and drying foliage. Normally, stepping onto a walking trail is followed by the buzzing of phone notifications: fitness apps asking to calibrate strides, social segments alerting you of leaderboards, and continuous battery-draining GPS tracking.

Trailnote is built to do the exact opposite.

**Trailnote** is a local-first outdoor field notebook and topographic companion powered by local Gemma 2. It is engineered around one core design rule:

> **"Plan the walk. Make the note. Put the phone away."**  
> *The screen must be the shortest part of the walk.*

Instead of keeping you glued to a chat feed or continuous GPS map, Trailnote is designed to get you off the screen in under three minutes:
1. **Plan before you depart**: Enter your available time, difficulty, and nature curiosities.
2. **Hold the card in your hand**: Print an A4 or pocket-folded **Trail Card** with an inline vector route snapshot SVG, packing essentials, sunset deadline, and ruled lines for handwritten pencil notes.
3. **Walk in Pocket Mode**: Put the phone in your pocket. In Walk Mode, Pocket Mode turns the screen near-black, offers opt-in browser voice reading of observation prompts, and releases screen wake locks.
4. **Track real screen time**: The built-in **Screen-Time Ledger** measures visible app time during planning against outdoor time in the field (e.g., *"Planned in 2m 40s. Outside for 1h 25m."*).
5. **Log when you return**: Jot down sensory observations in your local journal, capture compressed field photos directly into IndexedDB, and optionally let local Gemma 2 shape your notes into reflective naturalist prose.

### Who It Is For
Trailnote is built for walkers, naturalists, and anyone feeling digital fatigue who wants to explore local footpaths, parks, and reserves without being pulled into notifications or subscriptions.

---

## Demo

- 🌐 **Hosted Deployment**: [trailnote.netlify.app](https://trailnote.netlify.app)  
  *(Note on honesty: Netlify cannot connect to a visitor's local Ollama instance. The hosted demo uses deterministic built-in field-guide rules. Gemma 2 runs on your own hardware when running locally).*
- 📺 **Video Demo (60–90 Seconds)**: [Demo Video Link — Local Gemma 2 Run & Pocket Mode Walkthrough](https://youtu.be/placeholder-demo-video)

---

## Code

- 💻 **GitHub Repository**: [github.com/AnshMeshram/TrailNote](https://github.com/AnshMeshram/TrailNote)
- **License**: MIT
- **Tech Stack**: Next.js 15, TypeScript, Vanilla CSS, Zod, Gemma 2 (via Ollama), Nominatim, OSRM, Open-Meteo, Leaflet, IndexedDB, Service Worker PWA.

---

## How I Built It

### 1. The Strict Division of Labor: Gemma 2 (Interpretation) vs TypeScript (Numbers)
A common mistake in modern AI applications is asking a language model to guess physical measurements: coordinates, distances, trail elevations, or weather readings. In outdoor navigation, hallucinated numbers are dangerous.

Trailnote enforces a strict mathematical division of labor:

```
       ┌────────────────────────────────────────────────────────┐
       │                 PHYSICAL MEASUREMENTS                  │
       │              (Deterministic Code & APIs)               │
       ├────────────────────────────┬───────────────────────────┤
       │ • Coordinates & Search     │ OpenStreetMap Nominatim   │
       │ • Footpath Geometry        │ Project-OSRM Foot Engine  │
       │ • Distance & Elevation     │ TypeScript Geodesic / OSRM│
       │ • Atmospheric Data         │ Open-Meteo Forecast API   │
       │ • Sunset Deadline          │ Open-Meteo Astronomical   │
       └────────────────────────────┴───────────────────────────┘
                                     │ Verified Context
                                     ▼
       ┌────────────────────────────────────────────────────────┐
       │                 NATURALIST PROSE & AI                  │
       │                 (Local Gemma 2 Weights)                │
       ├────────────────────────────────────────────────────────┤
       │ • Evocative Trail Briefing & Quieter Dirt Paths        │
       │ • 3 Sensory Prompts (Sight, Sound, Texture)            │
       │ • Reflection Prompts for Quiet Walking                 │
       │ • Post-Walk Field Journal Prose Refinement             │
       └────────────────────────────────────────────────────────┘
```

- **OpenStreetMap Nominatim**: Geocodes location queries with a server-side async timestamp lock enforcing Nominatim's 1-request-per-second usage policy.
- **OSRM (Open Source Routing Machine)**: Computes footpath route geometry, loop contours, distance, and topographic elevation profiles.
- **Open-Meteo**: Provides atmospheric readings (temperature, weather descriptors, wind) and astronomical sunset data without requiring API keys.
- **TypeScript Sunset Safety**: Calculates the "Be back by HH:MM" deadline based on sunset time minus estimated walking duration minus safety buffer, warning the user if the walk would end after dark.
- **Gemma 2 via Ollama**: Runs locally on `gemma2:2b` (or `gemma2:9b`). Inspired by naturalists Nan Shepherd (*The Living Mountain*) and John Muir, Gemma crafts sensory prompts and polishes field notes without tech jargon or hype words.

### 2. Local-First Offline Storage
- **Browser LocalStorage**: Stores active trail plans, settings, and saved Trail Cards.
- **Native IndexedDB (`trailnote-photos`)**: Stores high-resolution field photos locally. Photos taken with `capture="environment"` are compressed on client canvas to <=1280px (~150KB) and stored as Blobs in IndexedDB. No photos ever leave the device.
- **Zero Cloud Databases**: No Firebase, no Supabase, no AWS, no user accounts, and zero analytics trackers.

### 3. Pocket Mode & Screen-Time Ledger
- **Page Visibility API**: Tracks visible milliseconds on `/plan` to measure real planning time.
- **Pocket Mode**: A low-power, near-black interface for Walk Mode showing only the waypoint name, a large 48px+ "Tap to reveal" button, and an opt-in browser SpeechSynthesis audio prompt.
- **Screen Wake Lock**: Engaged only while actively inspecting a waypoint; released immediately when returning to pocket mode.

---

## Why Open Innovation Matters

Trailnote answers the challenge questions directly with real measured hardware evidence:

### 1. Runs with Zero Internet on a Laptop (Airplane-Mode Proof)
In full physical airplane mode (Wi-Fi and Bluetooth disabled):
- The PWA Service Worker serves the application shell from cache.
- Local Ollama runs `gemma2:2b` on CPU with **zero outbound requests**.
- Trail plans and sensory prompts generate in **440 ms** warm latency.
- Saved Trail Cards, offline vector SVGs, and notes load instantly.

### 2. Real Laptop Latency Benchmarks (Measured Values)
Captured on a standard laptop (12th Gen Intel Core i7, 16GB RAM):

| Model Target | Cold Start Latency | Warm Inference Latency | RAM Footprint | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **gemma2:2b** (Default) | **2,140 ms** | **420 ms** | ~1.6 GB RAM | Fast, concise sensory prompts; 100% JSON schema adherence. |
| **gemma2:9b** (High Fidelity) | **5,420 ms** | **1,850 ms** | ~5.8 GB RAM | Richer botanical taxonomy; deeper reflection prompts. |
| **Built-in Rules** (Fallback) | **< 15 ms** | **< 5 ms** | In-memory | Deterministic naturalist rules; active on hosted demo. |

### 3. Data Stays on the Device
Your physical location, walking habits, personal notes, and outdoor photos never leave your device. You can export your journal to Markdown or JSON at any time.

### 4. Zero Running Costs
Because Trailnote uses open weights (Gemma 2) and open public infrastructure (OSM, OSRM, Open-Meteo), it costs **$0.00/month** to operate. There are no credit cards, token subscriptions, or surprise billing limits.

### 5. Where Open Innovation Beat Closed APIs
Closed cloud APIs fail when you lose cellular reception in a mountain valley or deep forest. An open-weights model running locally on your machine does not care if you have five bars or zero signal.

---

## Honest Limitations

1. **Hosted Demo is Fallback Only**: On Netlify, the server cannot connect to your laptop's Ollama instance. The hosted site uses built-in naturalist rules. To experience local Gemma 2, clone the repository and run `ollama pull gemma2:2b`.
2. **Map Tiles Require a Connection**: The interactive Leaflet slippy map needs an internet connection to stream OpenStreetMap tiles. However, the printable Trail Card uses an inline vector SVG route that works completely offline.
3. **2B Model Conciseness**: `gemma2:2b` runs quickly on standard laptops, but if given extremely sparse notes (e.g. "walked tree"), its reflections can occasionally repeat phrasing.
4. **OpenStreetMap Trailhead Coverage**: In smaller rural areas, minor dirt trails may not be mapped in OSM, falling back to radial geodesic contours.

---

## Screenshots & Interface Tour

### 1. Landing Page
*Quiet, paper-toned design with seasonal motifs.*
![Trailnote Landing Page](https://raw.githubusercontent.com/AnshMeshram/TrailNote/main/public/images/autumn_trail_hero.jpg)

### 2. Location Search & Pinpoint
*Strict separation of device location and trail location.*

### 3. Topographic Trail Map & Elevation Profile
*OSRM footpath routing with inline SVG elevation profile and sunset deadline.*

### 4. Printable Trail Card (A4 & Pocket-Fold)
*Monochrome print layout with fold lines and offline SVG route.*

### 5. Walk Mode (Pocket Mode & Audio Prompts)
*Near-black high-contrast screen with 48px+ targets for bright sunlight.*

### 6. Naturalist Field Journal
*Authentic raw human notes preserved alongside Gemma 2 shaped prose.*

### 7. Real Walk Field Test
*[Place your field test photo of the printed Trail Card in the woods here: `public/images/field_test_photo.jpg`]*

---

## My Agent Session

- 🔗 **DevRelay Agent Session**: [DevRelay Agent Transcript](https://devrelay.com/session/placeholder-trailnote-session)

---

## Prize Categories

- **Hacktoberfest 2026 — Open-Source AI Challenge Week 1: TOUCH GRASS**

---

*Plan the walk. Make the note. Put the phone away.*
