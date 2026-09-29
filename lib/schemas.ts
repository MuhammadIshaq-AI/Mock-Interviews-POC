export type Experience = {
  title: string;
  company: string;
  duration: string;
  highlights: string[];
};

export type CvProfile = {
  name: string;
  email: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: string[];
  projects: string[];
  suggestedRoles: string[];
};

export type Difficulty = "easy" | "medium" | "hard";

export type Mcq = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
};

export type InterviewConfig = {
  role: string;
  difficulty: Difficulty;
  count: number;
};

const stringArray = { type: "array", items: { type: "string" } };

export const cvProfileJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", description: "Empty string if not present" },
    summary: { type: "string", description: "2-3 sentence professional summary" },
    skills: stringArray,
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          duration: { type: "string" },
          highlights: stringArray,
        },
        required: ["title", "company", "duration", "highlights"],
      },
    },
    education: stringArray,
    projects: stringArray,
    suggestedRoles: {
      ...stringArray,
      description: "3-5 job roles this candidate is a good fit for",
    },
  },
  required: [
    "name",
    "email",
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
    "suggestedRoles",
  ],
};

export const mcqListJsonSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { ...stringArray, minItems: 4, maxItems: 4 },
          correctIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" },
          topic: { type: "string" },
        },
        required: ["question", "options", "correctIndex", "explanation", "topic"],
      },
    },
  },
  required: ["questions"],
};
