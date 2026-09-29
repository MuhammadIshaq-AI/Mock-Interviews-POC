import type { InterviewConfig, Mcq } from "@/lib/schemas";
import { Button, Card } from "./ui";

const LETTERS = ["A", "B", "C", "D"];

function verdict(pct: number) {
  if (pct >= 80) return { label: "Interview ready", tone: "text-emerald-600" };
  if (pct >= 60) return { label: "Almost there", tone: "text-amber-600" };
  return { label: "Needs more practice", tone: "text-red-600" };
}

export default function Results({
  config,
  questions,
  answers,
  onRetry,
  onNewInterview,
  onStartOver,
}: {
  config: InterviewConfig;
  questions: Mcq[];
  answers: Record<string, number>;
  onRetry: () => void;
  onNewInterview: () => void;
  onStartOver: () => void;
}) {
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const pct = Math.round((correct / questions.length) * 100);
  const v = verdict(pct);

  const topics = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const t = topics.get(q.topic) ?? { correct: 0, total: 0 };
    t.total++;
    if (answers[q.id] === q.correctIndex) t.correct++;
    topics.set(q.topic, t);
  }

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <p className="text-sm text-slate-500">
          {config.role} · <span className="capitalize">{config.difficulty}</span>
        </p>
        <p className="mt-4 text-6xl font-bold tabular-nums">{pct}%</p>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {correct} of {questions.length} correct
        </p>
        <p className={`mt-1 font-semibold ${v.tone}`}>{v.label}</p>

        <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
          {[...topics.entries()].map(([topic, t]) => (
            <div key={topic}>
              <div className="flex justify-between text-xs">
                <span className="font-medium">{topic}</span>
                <span className="tabular-nums text-slate-500">
                  {t.correct}/{t.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(t.correct / t.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onRetry}>
            Retake same questions
          </Button>
          <Button variant="secondary" onClick={onStartOver}>
            Upload new CV
          </Button>
          <Button onClick={onNewInterview}>New mock interview</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Review your answers</h2>
        <ol className="mt-4 space-y-6">
          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.correctIndex;
            return (
              <li key={q.id} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0 dark:border-slate-800">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-sm font-bold ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <p className="font-medium">
                    {i + 1}. {q.question}
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5 pl-6 text-sm">
                  {q.options.map((opt, j) => {
                    const style =
                      j === q.correctIndex
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : j === chosen
                          ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                          : "border-transparent text-slate-600 dark:text-slate-400";
                    return (
                      <li key={j} className={`rounded-lg border px-3 py-1.5 ${style}`}>
                        <span className="font-semibold">{LETTERS[j]}.</span> {opt}
                        {j === chosen && <span className="ml-2 text-xs opacity-75">(your answer)</span>}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 pl-6 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Why: </span>
                  {q.explanation}
                </p>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
