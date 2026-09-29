import type { CvProfile, InterviewConfig } from "./schemas";

export const EXTRACT_CV_PROMPT = `You are an expert technical recruiter. Extract the candidate's information from the CV provided.
- Only use information present in the CV; do not invent details. Use empty strings/arrays when something is missing.
- "skills": a de-duplicated list of concrete technical and professional skills (languages, frameworks, tools, methods).
- "experience": most recent first, with 2-4 concise highlights each.
- "projects": one line per notable project.
- "suggestedRoles": 3-5 realistic job titles this candidate could interview for.`;

const DIFFICULTY_GUIDE = {
  easy: "fundamentals and definitions; suitable for a junior screening round",
  medium: "applied knowledge and practical scenarios; typical mid-level interview",
  hard: "deep internals, trade-offs, edge cases, and system-level reasoning; senior-level interview",
} as const;

export function buildMcqPrompt(profile: CvProfile, config: InterviewConfig): string {
  return `You are an experienced interviewer preparing a mock interview for the role of "${config.role}".

Candidate profile (extracted from their CV):
${JSON.stringify(profile, null, 2)}

Write exactly ${config.count} multiple-choice questions.
Difficulty: ${config.difficulty} — ${DIFFICULTY_GUIDE[config.difficulty]}.

Guidelines:
- Tailor questions to the target role AND the candidate's CV: roughly 60% on skills/technologies/projects listed in the CV that are relevant to the role, 30% on core knowledge the role requires (even if missing from the CV), 10% situational/behavioral questions for the role.
- Each question has exactly 4 options with exactly one correct answer. Distractors must be plausible.
- Vary the position of the correct answer (correctIndex 0-3) across questions.
- "explanation": 1-3 sentences on why the correct answer is right.
- "topic": a short label (e.g. "Python", "SQL", "System Design", "Behavioral").
- Do not repeat questions or ask about the candidate's personal details.`;
}
