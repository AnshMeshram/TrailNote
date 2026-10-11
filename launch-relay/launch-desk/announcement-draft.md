# Trailnote: An Open-Source Field Notebook That Gets You Off the Screen

Most outdoor apps keep us glued to glowing screens with continuous notifications, step goals, and battery-draining GPS tracking. I built Trailnote to do the exact opposite: make the screen the shortest part of the walk.

Built with Next.js 15, TypeScript, and Vanilla CSS for Hacktoberfest 2026, Trailnote lets you plan a local footpath in under three minutes. It pulls verified coordinates from OpenStreetMap, route geometry from OSRM, and weather forecasts from Open-Meteo. Then, Google Gemma 2 running locally via Ollama generates quiet sensory prompts to notice along the way.

Instead of keeping your phone in hand, you can print a foldable pocket Trail Card with an offline vector route or switch to Pocket Mode in Walk Mode, which keeps the screen near-black and reads prompts hands-free. All field notes, journal reflections, and camera photos stay stored directly on your device in IndexedDB.

Explore the project on GitHub (https://github.com/AnshMeshram/TrailNote) or try the web companion deployed at https://trailnote.netlify.app/.
