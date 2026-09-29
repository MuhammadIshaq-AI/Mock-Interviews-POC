import { GoogleGenAI, type Part } from "@google/genai";

let client: GoogleGenAI | null = null;

export class GeminiConfigError extends Error {}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY is not set. Add it to .env.local and restart the server.",
    );
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

// Fallbacks are tried when the preferred model is overloaded or rate limited.
const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"];
const RETRYABLE_STATUS = [429, 500, 503];

const statusOf = (err: unknown) => (err as { status?: number })?.status;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateJson<T>(parts: Part[], schema: object): Promise<T> {
  const preferred = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const models = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await getClient().models.generateContent({
          model,
          contents: parts,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: schema,
            temperature: 0.7,
          },
        });
        const text = response.text;
        if (!text) throw new Error("Gemini returned an empty response.");
        return JSON.parse(text) as T;
      } catch (err) {
        lastError = err;
        const status = statusOf(err);
        // Model retired or not enabled for this key: move straight to the next model.
        if (status === 404) break;
        if (!status || !RETRYABLE_STATUS.includes(status)) throw err;
        console.warn(`Gemini ${model} unavailable (${status}, attempt ${attempt + 1}), retrying…`);
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

export function errorResponse(err: unknown) {
  console.error(err);
  if (err instanceof GeminiConfigError) {
    return Response.json({ error: err.message }, { status: 500 });
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  return Response.json({ error: `AI request failed: ${message}` }, { status: 502 });
}
