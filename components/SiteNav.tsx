"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/services/auth.service";
import { fetchSession, logoutUser } from "@/services/auth.service";

const links = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Custom interview" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  const loadSession = useCallback(() => {
    fetchSession().then(setUser);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession, pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Still clear UI if the network fails
    }
    setUser(null);
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4 sm:px-6">
        <Link
          href="/"
          className="mr-4 flex items-center gap-2 font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
            IA
          </span>
          <span className="hidden sm:inline">Interview AI</span>
        </Link>

        <div className="flex flex-1 flex-wrap items-center gap-0.5 sm:gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user === undefined ? (
            <span className="hidden text-sm text-slate-400 sm:inline" aria-hidden>
              …
            </span>
          ) : user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-slate-600 dark:text-slate-300 sm:inline">
                {user.name ?? user.email ?? "Signed in"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
