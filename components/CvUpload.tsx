"use client";

import { useRef, useState } from "react";
import type { CvProfile } from "@/lib/schemas";
import { Button, Card, ErrorBox, Spinner } from "./ui";

const ACCEPTED = [".pdf", ".docx", ".txt"];
const MAX_BYTES = 5 * 1024 * 1024;

export default function CvUpload({ onExtracted }: { onExtracted: (profile: CvProfile) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function pick(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setError("Please upload a PDF, DOCX or TXT file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File is larger than 5 MB.");
      return;
    }
    setFile(f);
  }

  async function extract() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract-cv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyse CV.");
      onExtracted(data.profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyse CV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold">Upload your CV</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        AI will extract your skills and experience, then build a mock interview around them.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
            : "border-slate-300 hover:border-indigo-400 dark:border-slate-700"
        }`}
      >
        <svg className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        <p className="mt-3 font-medium">{file ? file.name : "Drag & drop your CV here, or click to browse"}</p>
        <p className="mt-1 text-xs text-slate-500">PDF, DOCX or TXT · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBox message={error} />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={extract} disabled={!file || loading}>
          {loading && <Spinner />}
          {loading ? "Analysing CV…" : "Analyse CV"}
        </Button>
      </div>
    </Card>
  );
}
