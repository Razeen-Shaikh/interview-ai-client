"use client";

import { useState } from "react";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { registerUser } from "@/services/auth.service";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (isAxiosError(err)) {
        const body = err.response?.data as { message?: string } | undefined;
        setError(body?.message ?? err.message ?? "Registration failed.");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Already have one?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-800 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Doe"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="At least 6 characters"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
