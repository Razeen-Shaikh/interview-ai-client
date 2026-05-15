"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  getInterview,
  submitAnswer,
  type InterviewRecord,
} from "@/services/interview.service";
import { cancelSpeech, speakText } from "@/utils/speakText";

function firstUnansweredIndex(interview: InterviewRecord): number {
  const idx = interview.answers.findIndex(
    (a) => !a.answer || !String(a.answer).trim(),
  );
  return idx === -1 ? interview.questions.length : idx;
}

export default function InterviewPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [answerText, setAnswerText] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [lastEvaluation, setLastEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
  } | null>(null);

  const {
    transcript,
    listening,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  const reloadInterview = useCallback(async () => {
    const data = await getInterview(interviewId);
    setInterview(data.interview);
  }, [interviewId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        await reloadInterview();
      } catch (err) {
        if (cancelled) return;
        if (isAxiosError(err)) {
          const body = err.response?.data as { message?: string } | undefined;
          setLoadError(body?.message ?? err.message ?? "Could not load interview.");
        } else {
          setLoadError("Could not load interview.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelSpeech();
    };
  }, [reloadInterview]);

  const activeIndex = useMemo(
    () => (interview ? firstUnansweredIndex(interview) : 0),
    [interview],
  );

  const isComplete =
    interview !== null && activeIndex >= interview.questions.length;

  const currentQuestion =
    interview && activeIndex < interview.questions.length
      ? interview.questions[activeIndex]
      : null;

  const progressPct =
    interview && interview.questions.length > 0
      ? Math.round(((activeIndex + 1) / interview.questions.length) * 100)
      : 0;

  useEffect(() => {
    if (!currentQuestion) return;
    speakText(currentQuestion);
    return () => {
      cancelSpeech();
    };
  }, [currentQuestion]);

  const handleStopVoice = () => {
    stopListening();
    setAnswerText((prev) => {
      const t = transcript.trim();
      if (!t) return prev;
      return prev ? `${prev.trim()}\n${t}` : t;
    });
    clearTranscript();
  };

  const handleSubmit = async () => {
    if (!interview || isComplete) return;

    const trimmed = answerText.trim();
    if (!trimmed) {
      setSubmitError("Type an answer or use voice input, then add it to the answer box.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    setLastEvaluation(null);

    try {
      const res = await submitAnswer(interviewId, {
        questionIndex: activeIndex,
        answer: trimmed,
      });

      setLastEvaluation(res.evaluation);
      setAnswerText("");
      clearTranscript();
      await reloadInterview();
    } catch (err) {
      if (isAxiosError(err)) {
        const body = err.response?.data as { message?: string } | undefined;
        setSubmitError(body?.message ?? err.message ?? "Submit failed.");
      } else {
        setSubmitError("Submit failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-1 items-center gap-3 px-4 py-16 text-slate-600 dark:text-slate-400 sm:px-6">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        Loading interview…
      </div>
    );
  }

  if (loadError || !interview) {
    return (
      <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {loadError ?? "Interview not found."}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Practice tests
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            Custom interview
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Done
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Interview complete
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Overall score{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {interview.overallScore != null
                ? interview.overallScore.toFixed(1)
                : "—"}
            </span>{" "}
            / 10
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link
              href="/practice"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Another practice test
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            >
              New custom interview
            </Link>
          </div>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Question {activeIndex + 1} of {interview.questions.length}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{progressPct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Voice interview
      </h1>

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Current question
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-800 dark:text-slate-100">{currentQuestion}</p>
        <button
          type="button"
          onClick={() => currentQuestion && speakText(currentQuestion)}
          className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
        >
          Replay question
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startListening}
          disabled={listening}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {listening ? "Listening…" : "Start recording"}
        </button>
        <button
          type="button"
          onClick={handleStopVoice}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          Stop &amp; append to answer
        </button>
      </div>

      <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {listening ? "Listening…" : "Idle"}
        </span>
        {" · "}
        <span className="italic">{transcript || "No live transcript yet"}</span>
      </p>

      <div className="mt-8">
        <label htmlFor="answer" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Your answer
        </label>
        <textarea
          id="answer"
          rows={6}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 p-4 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-50"
          placeholder="Type here and/or append from voice after stopping recording."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
      </div>

      {submitError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit answer"}
      </button>

      {lastEvaluation && (
        <div className="mt-10 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-indigo-50/40 p-6 dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/20 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI evaluation</h2>
          <p className="mt-4 text-lg">
            Score{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{lastEvaluation.score}</span>{" "}
            / 10
          </p>
          <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">{lastEvaluation.feedback}</p>
          {lastEvaluation.strengths && lastEvaluation.strengths.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Strengths
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {lastEvaluation.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {lastEvaluation.improvements && lastEvaluation.improvements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Improvements
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {lastEvaluation.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
