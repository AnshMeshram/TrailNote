import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rawNote = '',
      location = '',
      trailName = '',
      sight = '',
      sound = '',
      texture = '',
      favoriteMoment = '',
    } = body;

    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'gemma2';

    const systemPrompt = `You are a quiet, attentive naturalist writer in the tradition of Nan Shepherd, John Muir, and Robert Macfarlane.
Your task is to transform a walker's raw field notes, sights, and sounds into a single cohesive, lyrical paragraph of polished field journal prose.
Rules:
1. Preserve every genuine observation (plants, weather, sounds, textures).
2. Do NOT add generic AI fluff, emojis, or exclamation marks.
3. Write in the first person ("I noticed...", "The path gave way to...").
4. Keep the tone grounded, observant, and reflective.
5. Output ONLY the polished paragraph, without introductory phrases or quotes.`;

    const userPrompt = `Location: ${location || 'Natural trail'}
Trail Name: ${trailName || 'Field Loop'}
Visual observations: ${sight || 'Foliage and open trail'}
Audio soundscape: ${sound || 'Rustle of canopy leaves'}
Tactile / Texture: ${texture || 'Rough earth and dry leaves'}
Favorite moment: ${favoriteMoment || 'Quiet pause along the path'}
Raw field notes: ${rawNote}`;

    // Attempt local Gemma 2 inference via Ollama
    try {
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: userPrompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: 0.6,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(6000), // 6 second timeout
      });

      if (res.ok) {
        const data = await res.json();
        const text = (data.response || '').trim();
        if (text && text.length > 30) {
          return NextResponse.json({
            success: true,
            source: 'gemma2',
            shapedNote: text.replace(/^"|"$/g, ''),
          });
        }
      }
    } catch {
      // Graceful fallback if Ollama is not running
    }

    // Deterministic naturalist fallback
    const locSnippet = location ? `along ${location}` : 'along the footpath';
    const sightSnippet = sight ? ` My eye caught ${sight.toLowerCase().replace(/^\./, '')}.` : '';
    const soundSnippet = sound ? ` The quiet was punctuated only by ${sound.toLowerCase().replace(/^\./, '')}.` : '';
    const textureSnippet = texture ? ` Under hand and boot, the tactile texture of ${texture.toLowerCase()} anchored the body to the terrain.` : '';
    const favSnippet = favoriteMoment ? ` In the stillness, ${favoriteMoment.toLowerCase().replace(/^\./, '')} stood out as a clear grounding marker.` : '';
    const reflectionSnippet = rawNote ? ` ${rawNote.trim()}` : '';

    const deterministicProse = `Walking ${locSnippet}, the rhythm of footsteps gradually slowed the tempo of the mind.${sightSnippet}${soundSnippet}${textureSnippet}${favSnippet}${reflectionSnippet} In stepping away from digital screens, the subtle breathing of the open air restored a sense of quiet clarity.`;

    return NextResponse.json({
      success: true,
      source: 'naturalist-fallback',
      shapedNote: deterministicProse.trim(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to shape field note',
      },
      { status: 500 }
    );
  }
}
