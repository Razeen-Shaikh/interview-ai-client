"use client";

import { useEffect, useState } from "react";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createInterviewFromTemplate,
  getInterviewTemplates,
  type InterviewTemplateSummary,
} from "@/services/interview.service";

export default function PracticePage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<InterviewTemplateSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadError(null);
      setLoadingList(true);

      try {
        const data = await getInterviewTemplates();
        if (cancelled) return;
        setTemplates(data.templates ?? []);
        if (data.templates?.[0]?.id) {
          setSelectedId(data.templates[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        if (isAxiosError(err)) {
          const body = err.response?.data as { message?: string } | undefined;
          setLoadError(body?.message ?? err.message ?? "Could not load tests.");
        } else {
          setLoadError("Could not load tests.");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = templates.find((t) => t.id === selectedId);

  const handleStart = async () => {
    if (!selectedId) return;

    setStartError(null);
    setStarting(true);

    try {
      const data = await createInterviewFromTemplate(selectedId);
      if (data.success && data.interview?._id) {
        router.push(`/interview/${data.interview._id}`);
        return;
      }
      setStartError("Unexpected response from server.");
    } catch (err) {
      if (isAxiosError(err)) {
        const body = err.response?.data as { message?: string } | undefined;
        setStartError(body?.message ?? err.message ?? "Could not start test.");
      } else {
        setStartError("Could not start test.");
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">Practice tests</span>
      </nav>

      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Step 1 · Fastest path
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Practice tests
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Ready-made interviews with fixed questions. No API keys required to start. Scoring uses{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">practice mode</strong>{" "}
          unless the server has{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">GEMINI_API_KEY</code>{" "}
          or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">OPENAI_API_KEY</code>.
        </p>
      </div>

      {loadError && (
        <div
          className="mt-8 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {loadError}
          <p className="mt-2">
            <Link href="/login" className="font-semibold underline">
              Log in
            </Link>{" "}
            to load your assigned tests.
          </p>
        </div>
      )}

      {loadingList ? (
        <div className="mt-12 flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading tests…
        </div>
      ) : (
        <>
          <p className="mt-10 text-sm font-medium text-slate-700 dark:text-slate-300">Choose a test</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((t) => {
              const isSel = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSel
                        ? "border-indigo-400 bg-indigo-50/90 shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-600 dark:bg-indigo-950/40 dark:ring-indigo-500/30"
                        : "border-slate-200/80 bg-white/70 hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-900"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      {t.level} · {t.questionCount} questions
                    </span>
                    <span className="mt-1 block font-semibold text-slate-900 dark:text-white">{t.title}</span>
                    <span className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{t.summary}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected && (
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Selected · details
              </h2>
              <dl className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <dt className="inline font-medium text-slate-500 dark:text-slate-400">Role </dt>
                  <dd className="inline">{selected.role}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-500 dark:text-slate-400">Level </dt>
                  <dd className="inline">{selected.level}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-500 dark:text-slate-400">Stack </dt>
                  <dd className="inline">{selected.techStack.join(", ")}</dd>
                </div>
              </dl>
            </div>
          )}

          {startError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
              {startError}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleStart}
              disabled={starting || !selectedId || templates.length === 0}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
            >
              {starting ? "Starting…" : "Start this test"}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Want AI-written questions?{" "}
              <Link href="/dashboard" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                Custom interview
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
