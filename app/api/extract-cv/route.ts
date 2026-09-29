import mammoth from "mammoth";
import type { Part } from "@google/genai";
import { errorResponse, generateJson } from "@/lib/gemini";
import { EXTRACT_CV_PROMPT } from "@/lib/prompts";
import { cvProfileJsonSchema, type CvProfile } from "@/lib/schemas";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File is larger than 5 MB." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let cvPart: Part;

  if (name.endsWith(".pdf")) {
    cvPart = { inlineData: { mimeType: "application/pdf", data: buffer.toString("base64") } };
  } else if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer });
    cvPart = { text: `CV:\n${value}` };
  } else if (name.endsWith(".txt")) {
    cvPart = { text: `CV:\n${buffer.toString("utf8")}` };
  } else {
    return Response.json(
      { error: "Unsupported file type. Please upload a PDF, DOCX or TXT file." },
      { status: 400 },
    );
  }

  if ("text" in cvPart && !cvPart.text?.slice(4).trim()) {
    return Response.json({ error: "The uploaded file appears to be empty." }, { status: 400 });
  }

  try {
    const profile = await generateJson<CvProfile>([{ text: EXTRACT_CV_PROMPT }, cvPart], cvProfileJsonSchema);
    return Response.json({ profile });
  } catch (err) {
    return errorResponse(err);
  }
}
