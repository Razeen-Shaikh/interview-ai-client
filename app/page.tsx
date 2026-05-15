import Link from "next/link";

const steps = [
  { n: "1", title: "Create an account", body: "One free account unlocks custom interviews and saved sessions." },
  { n: "2", title: "Pick a path", body: "Use a ready-made practice test or generate a custom interview from your CV." },
  { n: "3", title: "Answer out loud", body: "Speak your answers; get structured AI feedback and scores." },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Voice-first technical interviews
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Practice interviews that feel{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            real
          </span>
          , not robotic
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Ready-made templates, AI-generated questions from your CV, spoken answers with feedback — all in one place.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
          >
            Get started free
          </Link>
          <Link
            href="/practice"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-8 py-3.5 text-base font-semibold text-slate-800 backdrop-blur transition hover:border-indigo-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-indigo-800"
          >
            Browse practice tests
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {s.n}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        <Link
          href="/practice"
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/30 dark:hover:border-indigo-800"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Fastest path
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Practice tests</h3>
          <p className="mt-2 flex-1 text-slate-600 dark:text-slate-400">
            Pick a role, start an interview in one click. No setup required.
          </p>
          <span className="mt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Open practice →
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-violet-50/50 p-8 shadow-sm transition hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:to-violet-950/30 dark:hover:border-violet-800"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Tailored
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Custom interview</h3>
          <p className="mt-2 flex-1 text-slate-600 dark:text-slate-400">
            Paste your CV and job description; we generate questions and scoring criteria for you.
          </p>
          <span className="mt-6 text-sm font-semibold text-violet-600 dark:text-violet-400">
            Open dashboard →
          </span>
        </Link>
      </div>

      <p className="mt-14 text-center text-sm text-slate-500 dark:text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
