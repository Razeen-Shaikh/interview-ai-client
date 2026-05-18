import axios from "axios";

const DEFAULT_API_ORIGIN = "https://interview-ai-server-nu.vercel.app";

/**
 * API base URL ending in `/api`.
 * Defaults to the deployed server; override with NEXT_PUBLIC_API_URL for local dev.
 */
export function resolveApiBaseURL(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  const origin = env ? env.replace(/\/+$/, "") : DEFAULT_API_ORIGIN;
  return origin.endsWith("/api") ? origin : `${origin}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = resolveApiBaseURL();
  }
  return config;
});

export default api;
