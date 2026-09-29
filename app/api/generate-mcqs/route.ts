import { errorResponse, generateJson } from "@/lib/gemini";
import { buildMcqPrompt } from "@/lib/prompts";
import {
  mcqListJsonSchema,
  type CvProfile,
  type Difficulty,
  type InterviewConfig,
  type Mcq,
} from "@/lib/schemas";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function isValidMcq(q: Omit<Mcq, "id">): boolean {
  return (
    typeof q.question === "string" &&
    q.question.trim().length > 0 &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { profile?: CvProfile; config?: InterviewConfig }
    | null;
  const profile = body?.profile;
  const config = body?.config;

  if (!profile || !config?.role?.trim()) {
    return Response.json({ error: "Profile and target role are required." }, { status: 400 });
  }
  const count = Math.min(Math.max(Number(config.count) || 10, 3), 25);
  const difficulty = DIFFICULTIES.includes(config.difficulty) ? config.difficulty : "medium";
  const prompt = buildMcqPrompt(profile, { role: config.role.trim(), difficulty, count });

  try {
    // Retry once if the model returns too few well-formed questions.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { questions } = await generateJson<{ questions: Omit<Mcq, "id">[] }>(
        [{ text: prompt }],
        mcqListJsonSchema,
      );
      const valid = (questions ?? []).filter(isValidMcq).slice(0, count);
      if (valid.length >= Math.ceil(count * 0.8) || attempt === 1) {
        if (valid.length === 0) break;
        const mcqs: Mcq[] = valid.map((q, i) => ({ ...q, id: `q${i + 1}` }));
        return Response.json({ questions: mcqs });
      }
    }
    return Response.json({ error: "Could not generate valid questions. Please try again." }, { status: 502 });
  } catch (err) {
    return errorResponse(err);
  }
}
