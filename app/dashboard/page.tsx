"use client";

import { useState } from "react";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createInterview } from "@/services/interview.service";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500";

export default function DashboardPage() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [techStack, setTechStack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateInterview = async () => {
    setError(null);

    const stack = techStack
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean);

    if (!role.trim() || !level.trim() || stack.length === 0) {
      setError("Please fill role, experience level, and at least one technology (comma-separated).");
      return;
    }

    setLoading(true);

    try {
      const data = await createInterview({
        role: role.trim(),
        level: level.trim(),
        techStack: stack,
      });

      if (data.success && data.interview?._id) {
        router.push(`/interview/${data.interview._id}`);
        return;
      }

      setError("Unexpected response from server.");
    } catch (err) {
      if (isAxiosError(err)) {
        const body = err.response?.data as { message?: string; code?: string } | undefined;
        if (body?.code === "AI_NOT_CONFIGURED") {
          setError(
            `${body.message ?? "AI is not configured."} Use Practice tests instead.`,
          );
          return;
        }
        if (body?.code === "OPENAI_INSUFFICIENT_QUOTA") {
          setError(
            `${body.message ?? "AI quota exceeded."} Try Practice tests or wait and retry.`,
          );
          return;
        }
        setError(body?.message ?? err.message ?? "Could not create interview.");
        return;
      }

      setError("Could not create interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">Custom interview</span>
      </nav>

      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Step 2 · Tailored path
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Custom AI interview
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The server uses Google Gemini (if <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">GEMINI_API_KEY</code> is set) or OpenAI to generate five questions. For a quicker start with no keys, use{" "}
          <Link href="/practice" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Practice tests
          </Link>
          .
        </p>

        <ol className="mt-8 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              1
            </span>
            <span className="text-slate-700 dark:text-slate-300">Describe role &amp; stack</span>
          </li>
          <li className="hidden text-slate-300 sm:block dark:text-slate-600">→</li>
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              2
            </span>
            <span className="text-slate-600 dark:text-slate-400">Generate &amp; answer with voice</span>
          </li>
        </ol>

        {error && (
          <div
            className="mt-6 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            <p>{error}</p>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/login" className="font-semibold underline">
                Log in
              </Link>
              <Link href="/practice" className="font-semibold underline">
                Practice tests
              </Link>
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <input
              id="role"
              type="text"
              placeholder="e.g. Frontend Engineer"
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Experience level
            </label>
            <input
              id="level"
              type="text"
              placeholder="e.g. Mid, Senior"
              className={inputClass}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="stack" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tech stack
            </label>
            <input
              id="stack"
              type="text"
              placeholder="Comma-separated: React, TypeScript, Node"
              className={inputClass}
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleCreateInterview}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {loading ? "Generating…" : "Generate & start interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
