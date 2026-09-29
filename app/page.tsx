"use client";

import { useEffect, useState } from "react";
import CvUpload from "@/components/CvUpload";
import InterviewConfigForm from "@/components/InterviewConfigForm";
import ProfileReview from "@/components/ProfileReview";
import Quiz from "@/components/Quiz";
import Results from "@/components/Results";
import type { CvProfile, InterviewConfig, Mcq } from "@/lib/schemas";

type Step = "upload" | "profile" | "config" | "quiz" | "results";

type AppState = {
  step: Step;
  profile: CvProfile | null;
  config: InterviewConfig | null;
  questions: Mcq[];
  answers: Record<string, number>;
  attempt: number;
};

const INITIAL: AppState = { step: "upload", profile: null, config: null, questions: [], answers: {}, attempt: 0 };
const STORAGE_KEY = "mock-interview-state";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload CV" },
  { key: "profile", label: "Review profile" },
  { key: "config", label: "Choose interview" },
  { key: "quiz", label: "Take test" },
  { key: "results", label: "Score" },
];

function Stepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex shrink-0 items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              i < currentIndex
                ? "bg-indigo-600 text-white"
                : i === currentIndex
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-800"
            }`}
          >
            {i < currentIndex ? "✓" : i + 1}
          </span>
          <span className={i === currentIndex ? "font-semibold" : "text-slate-500"}>{s.label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 dark:bg-slate-700" />}
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  // Restore progress after a refresh (sessionStorage is only available on the client).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setState({ ...INITIAL, ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const update = (patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { step, profile, config, questions, answers } = state;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">MI</div>
          <div>
            <h1 className="font-semibold leading-tight">Mock Interview Prep</h1>
            <p className="text-xs text-slate-500">AI-generated MCQs tailored to your CV</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Stepper current={step} />
        <div className="mt-6">
          {!hydrated ? null : step === "upload" || !profile ? (
            <CvUpload onExtracted={(p) => update({ ...INITIAL, profile: p, step: "profile" })} />
          ) : step === "profile" ? (
            <ProfileReview
              profile={profile}
              onBack={() => update(INITIAL)}
              onContinue={() => update({ step: "config" })}
            />
          ) : step === "config" || !config || questions.length === 0 ? (
            <InterviewConfigForm
              profile={profile}
              initial={config}
              onBack={() => update({ step: "profile" })}
              onGenerated={(c, qs) => update({ config: c, questions: qs, answers: {}, step: "quiz" })}
            />
          ) : step === "quiz" ? (
            <Quiz
              key={state.attempt}
              config={config}
              questions={questions}
              answers={answers}
              onAnswer={(id, i) => setState((s) => ({ ...s, answers: { ...s.answers, [id]: i } }))}
              onSubmit={() => update({ step: "results" })}
            />
          ) : (
            <Results
              config={config}
              questions={questions}
              answers={answers}
              onRetry={() => update({ answers: {}, step: "quiz", attempt: state.attempt + 1 })}
              onNewInterview={() => update({ step: "config", questions: [], answers: {} })}
              onStartOver={() => update(INITIAL)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
