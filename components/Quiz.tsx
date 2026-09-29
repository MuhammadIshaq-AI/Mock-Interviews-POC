"use client";

import { useState } from "react";
import type { InterviewConfig, Mcq } from "@/lib/schemas";
import { Button, Card } from "./ui";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({
  config,
  questions,
  answers,
  onAnswer,
  onSubmit,
}: {
  config: InterviewConfig;
  questions: Mcq[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const q = questions[index];
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined).length;
  const isLast = index === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          {config.role} · <span className="capitalize">{config.difficulty}</span>
        </span>
        <span>
          Question {index + 1} of {questions.length}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <span className="mt-6 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {q.topic}
      </span>
      <h2 className="mt-3 text-lg font-semibold leading-snug">{q.question}</h2>

      <div className="mt-5 space-y-3">
        {q.options.map((opt, i) => {
          const selected = answers[q.id] === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer(q.id, i)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                selected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                  : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="pt-0.5">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {questions.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to question ${i + 1}`}
            className={`h-8 w-8 rounded-md text-xs font-semibold ${
              i === index
                ? "bg-indigo-600 text-white"
                : answers[x.id] !== undefined
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Previous
        </Button>
        {isLast ? (
          <Button onClick={onSubmit} disabled={!allAnswered} title={allAnswered ? "" : "Answer every question to submit"}>
            Submit ({answeredCount}/{questions.length})
          </Button>
        ) : (
          <Button onClick={() => setIndex(index + 1)}>Next</Button>
        )}
      </div>
      {isLast && !allAnswered && (
        <p className="mt-3 text-right text-xs text-slate-500">Answer every question to submit.</p>
      )}
    </Card>
  );
}
