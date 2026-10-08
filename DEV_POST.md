---
title: "I Built an AI App That Tells You to Turn Off Your Phone and Touch Grass"
published: true
tags: hacktoberfest, ai, opensource, webdev
cover_image: https://raw.githubusercontent.com/your-username/trailnote/main/public/images/autumn_trail_hero.jpg
description: "Why most outdoor apps fail, and how I used local Gemma 2, OpenStreetMap, OSRM, and Vanilla CSS to build a field notebook that wants you off your screen in under 3 minutes."
---

## The Irony of Modern "Outdoor" Technology

Last week, I went for a morning walk in the botanical reserve near my house. It was a crisp October morning—the kind where yellow teak leaves carpet the dirt footpaths and the air smells of pine needles and damp earth.

Within five minutes, my pocket buzzed twice.

First, a fitness app congratulated me on starting an "Outdoor Activity Session" and asked me to calibrate my stride. Two minutes later, a social trail map alerted me that another user had just set a "Personal Record" on a segment 400 meters ahead of me. By the time I reached the creek crossing, I had spent more time squinting at a bright glass screen, adjusting GPS permissions, and declining premium subscription popups than looking up at the tree canopy.

The technology designed to "connect" us with nature had turned a quiet outdoor walk into a noisy notifications funnel.

For **Hacktoberfest 2026 Week 1 (Theme: TOUCH GRASS)**, I decided to build the exact opposite: **Trailnote**.

---

## The Core Product Philosophy

Trailnote is a local-first outdoor field notebook built on a single radical premise:

> **"Plan the walk. Make the note. Put the phone away."**

The screen should be the **shortest part of the walk**.

Instead of a noisy chat feed, continuous background tracking, or endless notifications, Trailnote is engineered backwards:

1. **You spend under 3 minutes** stating your available time, desired difficulty, and nature curiosities.
2. Trailnote computes the trail geometry, pulls live weather, and uses **local Gemma 2** to write sensory observation prompts.
3. It condenses the entire expedition into a single **printable, handheld Trail Card**.
4. **You slip your phone into your backpack, step outside, and touch grass.**
5. When you return, you write two sentences of observations in your local journal.

```
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │   2 MINUTES  │         │   HANDHELD   │         │   HOURS OF   │
   │  Plan Trail  │  ───►   │  Trail Card  │  ───►   │ Screen-Free  │
   │   with AI    │         │  (Print/Txt) │         │ Exploration  │
   └──────────────┘         └──────────────┘         └──────────────┘
```

---

## The Golden Rule: The Ethical Division of Labor

When people build "AI apps" today, a common failure mode is treating the LLM like a magic black box: you ask it for coordinates, tell it to calculate mountain elevations, and hope it doesn't invent a nonexistent cliff.

In outdoor applications, hallucinated numbers are dangerous.

In Trailnote, I enforced a strict **Mathematical Division of Labor**:

```
       ┌───────────────────────────────┐
       │     PHYSICAL MEASUREMENTS     │
       │  (Deterministic Code & APIs)  │
       ├───────────────────────────────┤
       │ • Coordinates: Nominatim      │
       │ • Route Geometry: OSRM        │
       │ • Trail Distance: OSRM        │
       │ • Walking Duration: Pace Calc │
       │ • Elevation Gain: OSRM Grade  │
       │ • Weather: Open-Meteo         │
       └───────────────┬───────────────┘
                       │ Verified Physical Context
                       ▼
       ┌───────────────────────────────┐
       │     NATURALIST PROSE & AI     │
       │     (Local Gemma 2 Weights)   │
       ├───────────────────────────────┤
       │ • Evocative Trail Briefing    │
       │ • 3 Sensory Observation Items │
       │ • Outdoor Reflection Prompts  │
       │ • Post-Walk Journal Prose     │
       └───────────────────────────────┘
```

- **OpenStreetMap Nominatim** handles all geocoding and location search.
- **OSRM (Open Source Routing Machine)** computes real footpath geometry, distance, and topographic elevation gain.
- **Open-Meteo** provides atmospheric readings (temperature, wind, precipitation).
- **Gemma 2 (running locally via Ollama)** does what language models actually excel at: **perceptual synthesis and poetic reflection**.

---

## 3 Technical Lessons from Building Trailnote

### 1. Respecting Public Infrastructure: Nominatim Rate Limiting
OpenStreetMap Nominatim is an incredible free public good, but their usage policy strictly forbids sending more than 1 request per second. When building an interactive search input, you cannot simply fire `fetch()` on every keystroke.

To solve this, I combined a **350ms client debounce** with a server-side **async timestamp lock**:

```typescript
let lastRequestTimestamp = 0;

export async function throttleNominatim(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestTimestamp = Date.now();
}
```

Every geocoding query passes through this lock alongside an in-memory `Map` cache. If the same user or regional query is searched twice, it resolves in `0ms` without ever touching the OpenStreetMap servers.

### 2. The Dreaded `_leaflet_pos` Runtime Exception
Anyone who has integrated Leaflet into Next.js 15 has run into this error:
`TypeError: Cannot read properties of undefined (reading '_leaflet_pos')`

It happens when React unmounts or re-renders a map container while Leaflet is in the middle of a zoom or fade transition.

The permanent fix required four deliberate rules:
```typescript
const map = L.map(container, {
  center,
  zoom: 14,
  zoomControl: false,
  fadeAnimation: false,        // 1. Disable fade animations
  markerZoomAnimation: false,  // 2. Disable marker zoom animations
});

// 3. Always check bounds validity before fitting
if (bounds.isValid()) {
  map.fitBounds(bounds, { padding: [35, 35], animate: false });
}

// 4. Clean up internal container ID in unmount
return () => {
  if (mapInstanceRef.current) {
    mapInstanceRef.current.off();
    mapInstanceRef.current.remove();
  }
  if (container && (container as any)._leaflet_id) {
    delete (container as any)._leaflet_id;
  }
};
```

### 3. Prompting Gemma 2 with Nan Shepherd & John Muir
Instead of a generic assistant voice ("Sure, here are some hiking tips! 🥾✨"), I prompted Gemma 2 with the voice of 20th-century Scottish hillwalker **Nan Shepherd** (*The Living Mountain*) and naturalist **John Muir**:

```typescript
const systemPrompt = `You are a quiet, attentive naturalist writer in the tradition of Nan Shepherd, John Muir, and Robert Macfarlane.
Your task is to transform a walker's raw field notes, sights, and sounds into a single cohesive, lyrical paragraph of polished field journal prose.
Rules:
1. Preserve every genuine observation (plants, weather, sounds, textures).
2. Do NOT add generic AI fluff, emojis, or exclamation marks.
3. Write in the first person ("I noticed...", "The path gave way to...").
4. Keep the tone grounded, observant, and reflective.
5. Output ONLY the polished paragraph, without introductory phrases or quotes.`;
```

When you return from a walk and feed it your raw field notes:
> *"Sight: Teak leaves with huge veins. Sound: dry wind in the canopy. Texture: rough basalt stones."*

Gemma 2 outputs:
> *"Walking along the eastern ridge, the rhythm of footsteps gradually slowed the tempo of the mind. My eye caught fallen teak leaves whose primary veins branched like miniature river deltas across the path. The quiet was punctuated only by dry autumn gusts shifting through the high canopy. Under boot, the tactile texture of ancient volcanic basalt anchored the body to the terrain. In stepping away from digital screens, the subtle breathing of the open air restored a sense of quiet clarity."*

Crucially, **the original raw words are preserved alongside the AI prose** in the journal. AI never erases authentic human memory; it acts as a companion illustrator.

---

## The Signature Trail Card: Fold It and Go

The centerpiece of Trailnote is the **Trail Card (`/trail-card`)**.

```
┌────────────────────────────────────────────────────────┐
│ TRAILNOTE FIELD CARD // SPECIMEN #2026-TN             │
│ AUTUMN LOOP · 4.8 KM · 1H 25M · MODERATE               │
├────────────────────────────────────────────────────────┤
│ [ VECTOR ROUTE MAP SNAPSHOT (100% OFFLINE SVG) ]       │
├────────────────────────────────────────────────────────┤
│ BRING: 1L Water · Trail Boots · Field Notebook         │
│ NOTICE:                                                │
│ 01. Examine the branching vein structure of teak leaves│
│ 02. Listen for two distinct bird calls at the creek    │
│ 03. Notice where sandy soil gives way to basalt rock   │
├────────────────────────────────────────────────────────┤
│ PHYSICAL FIELD JOTTINGS (WRITE BY HAND WITH PENCIL):   │
│ ______________________________________________________ │
│ ______________________________________________________ │
│ ______________________________________________________ │
└────────────────────────────────────────────────────────┘
```

Because deep valleys and national forests rarely have 5G signals, the Trail Card includes an **inline vector route snapshot SVG**. It doesn't need to download map tiles. You can:
- Hit `[ PRINT ]` for a high-contrast monochrome A4 layout formatted with clean `@media print` CSS.
- Download a `.txt` file for a battery-sipping e-reader.
- Or save it to your browser's local disk with one click.

---

## What I Learned About Building for "Touch Grass"

Working on this project made me realize something important about the current AI landscape:

Almost every AI tool being launched today is designed to increase **engagement time**—to keep you chatting, scrolling, generating, and prompting.

Building Trailnote taught me that the most rewarding software is software that respects your finite human attention. AI doesn't need to replace our sensory experience of the world; it can simply do the tedious homework in two minutes, hand you a physicalPermit, and gently tell you to go outside.

Your boots are waiting by the door.

---

### Links & Source Code
- 💻 **GitHub Repository**: [github.com/your-username/trailnote](https://github.com/your-username/trailnote)
- 🥾 **Live Demo / Walkthrough**: Local Next.js + Ollama (`gemma2:2b`)
- 🏆 **Hacktoberfest 2026**: Open-Source AI Challenge Week 1

*Leave a comment below: When was the last time you went for a walk without your phone in your hand?*
