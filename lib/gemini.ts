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

export async function generateJson<T>(parts: Part[], schema: object): Promise<T> {
  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
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
}

export function errorResponse(err: unknown) {
  console.error(err);
  if (err instanceof GeminiConfigError) {
    return Response.json({ error: err.message }, { status: 500 });
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  return Response.json({ error: `AI request failed: ${message}` }, { status: 502 });
}
