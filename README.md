# Mock-Interviews-POC

A proof-of-concept mock interview app. Upload your CV, let Gemini extract your profile, choose the role you're preparing for, then take an AI-generated multiple-choice test and get a score with explanations.

## Flow

1. **Upload CV** – PDF, DOCX or TXT (max 4 MB).
2. **Review profile** – Gemini extracts name, summary, skills, experience, projects, education and suggests roles you fit.
3. **Choose interview** – pick a target role (suggested or custom), difficulty (easy / medium / hard) and number of questions (5–20).
4. **Take the test** – one question at a time, jump between questions, submit when all are answered.
5. **Score** – overall percentage, per-topic breakdown, and a review of every question with the correct answer and why.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) + Tailwind CSS
- [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (Gemini) with JSON-schema structured output
- `mammoth` for DOCX text extraction (PDFs are sent to Gemini directly)

## Getting started

```bash
npm install
cp .env.example .env.local   # then put your Gemini API key in .env.local
npm run dev
```

Open http://localhost:3000.

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | yes | Key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | no | Gemini model id, defaults to `gemini-3.8-flash` (falls back to other Flash models if it is overloaded) |

The API key is only used by the server-side API routes and is never sent to the browser. `.env.local` is git-ignored.

## Project structure

```
app/page.tsx                  # step-by-step UI
app/api/extract-cv/route.ts   # CV file -> structured profile (Gemini)
app/api/generate-mcqs/route.ts# profile + role + difficulty -> MCQs (Gemini)
components/                   # upload, profile, config, quiz, results UI
lib/gemini.ts                 # Gemini client + JSON helper
lib/prompts.ts                # prompt templates
lib/schemas.ts                # types and response schemas
```

## POC limitations

- No database or accounts: progress is kept in the browser session only.
- Scoring happens in the browser using the answer key returned with the questions, so it is not tamper-proof.

## Deploying to Vercel

The repo is connected to Vercel, so every push to `main` deploys to production (other branches get preview URLs).

`vercel.json` pins the Next.js framework preset and gives the API routes a 60 s `maxDuration`, since Gemini calls can take 20–40 s. Uploads are capped at 4 MB because Vercel functions reject request bodies over 4.5 MB.

To deploy your own copy:

```bash
npm i -g vercel
vercel link                                        # create/link the project
vercel env add GEMINI_API_KEY production --sensitive
vercel env add GEMINI_MODEL production             # optional, e.g. gemini-3.8-flash
vercel --prod
```

Or import the GitHub repo in the Vercel dashboard and add `GEMINI_API_KEY` under **Settings → Environment Variables**.
