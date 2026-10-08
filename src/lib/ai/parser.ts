/**
 * Safe JSON parser for LLM responses.
 * Robust against Markdown fences, leading conversational text, and trailing whitespace.
 */
export function parseAIJson<T>(raw: string): T | null {
  if (!raw || !raw.trim()) return null;

  let cleaned = raw.trim();

  // Strip Markdown code blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  // Attempt standard JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fallback: extract the outermost JSON object
    const objectMatch = cleaned.match(/(\{[\s\S]*\})/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
