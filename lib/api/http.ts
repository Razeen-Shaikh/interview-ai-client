import "server-only";

import { NextResponse } from "next/server";

import connectDB from "@/lib/db/connect";
import { SessionError } from "@/lib/auth/session";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(
  message: string,
  status = 500,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

export async function withDb<T>(handler: () => Promise<T>): Promise<T> {
  await connectDB();
  return handler();
}

function isDbConnectionError(error: unknown): boolean {
  const err = error as Error & { name?: string };
  return (
    err.name === "MongooseError" ||
    err.name === "MongooseServerSelectionError" ||
    /MongoNetwork|buffering timed out|Server selection|Could not connect to any servers|whitelist/i.test(
      String(err.message),
    )
  );
}

export function mapDbError(error: unknown) {
  const err = error as Error;
  if (err.message === "JWT_SECRET is not set") {
    return { status: 500, message: "Server misconfigured" };
  }
  if (isDbConnectionError(error)) {
    return {
      status: 503,
      message:
        "Database unavailable. Allow your IP (or 0.0.0.0/0) in MongoDB Atlas → Network Access.",
    };
  }
  return { status: 500, message: "Server Error" };
}

export function handleRouteError(error: unknown) {
  if (error instanceof SessionError) {
    return fail(error.message, error.status);
  }
  const mapped = mapDbError(error);
  console.error(error);
  return fail(mapped.message, mapped.status);
}

export const TOKEN_COOKIE = "token";
export const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  };
}
