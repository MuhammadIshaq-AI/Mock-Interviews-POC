"use client";

import { useState } from "react";
import type { CvProfile, Difficulty, InterviewConfig, Mcq } from "@/lib/schemas";
import { Button, Card, ErrorBox, Spinner } from "./ui";

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "easy", label: "Easy", hint: "Fundamentals" },
  { value: "medium", label: "Medium", hint: "Applied scenarios" },
  { value: "hard", label: "Hard", hint: "Senior depth" },
];
const COUNTS = [5, 10, 15, 20];

export default function InterviewConfigForm({
  profile,
  initial,
  onBack,
  onGenerated,
}: {
  profile: CvProfile;
  initial: InterviewConfig | null;
  onBack: () => void;
  onGenerated: (config: InterviewConfig, questions: Mcq[]) => void;
}) {
  const [role, setRole] = useState(initial?.role ?? profile.suggestedRoles[0] ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "medium");
  const [count, setCount] = useState(initial?.count ?? 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    const config = { role: role.trim(), difficulty, count };
    try {
      const res = await fetch("/api/generate-mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions.");
      onGenerated(config, data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }

  const optionClass = (active: boolean) =>
    `rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
      active
        ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
        : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
    }`;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Set up your mock interview</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Questions are tailored to the role you choose and the skills on your CV.
      </p>

      <label className="mt-6 block text-sm font-medium" htmlFor="role">
        Target role
      </label>
      <input
        id="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="e.g. Data Scientist, Frontend Engineer"
        className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:focus:ring-indigo-900"
      />
      {profile.suggestedRoles.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Suggested from your CV:</span>
          {profile.suggestedRoles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1 text-xs ${
                role === r
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 hover:border-indigo-400 dark:border-slate-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm font-medium">Difficulty</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            className={optionClass(difficulty === d.value)}
            onClick={() => setDifficulty(d.value)}
          >
            <span className="block font-semibold">{d.label}</span>
            <span className="block text-xs opacity-70">{d.hint}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-medium">Number of questions</p>
      <div className="mt-2 grid grid-cols-4 gap-3">
        {COUNTS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${optionClass(count === c)} text-center font-semibold`}
            onClick={() => setCount(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBox message={error} />
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={generate} disabled={!role.trim() || loading}>
          {loading && <Spinner />}
          {loading ? "Generating questions…" : "Start mock interview"}
        </Button>
      </div>
    </Card>
  );
}
