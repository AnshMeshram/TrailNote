/**
 * Ollama HTTP client for local AI inference.
 * Keeps local model inference private, fast, and configurable.
 */

export async function callOllama(
  prompt: string,
  systemPrompt?: string
): Promise<{ response: string; ok: boolean; error?: string }> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma2';

  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.4,
          top_p: 0.9,
        },
      }),
      signal: AbortSignal.timeout(15000), // 15 second timeout for local inference
    });

    if (!res.ok) {
      return { response: '', ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    return { response: data.response || '', ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { response: '', ok: false, error: message };
  }
}

/**
 * Check if Ollama is reachable and query available models.
 */
export async function checkOllamaStatus(): Promise<{
  isAvailable: boolean;
  model: string;
  baseUrl: string;
  availableModels: string[];
}> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const targetModel = process.env.OLLAMA_MODEL || 'gemma2';

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) {
      return { isAvailable: false, model: targetModel, baseUrl, availableModels: [] };
    }

    const data = (await res.json()) as { models?: { name: string }[] };
    const availableModels = (data.models || []).map((m) => m.name);
    const isModelPresent = availableModels.some((m) => m.includes(targetModel));

    return {
      isAvailable: true,
      model: isModelPresent ? targetModel : (availableModels[0] || targetModel),
      baseUrl,
      availableModels,
    };
  } catch {
    return { isAvailable: false, model: targetModel, baseUrl, availableModels: [] };
  }
}
