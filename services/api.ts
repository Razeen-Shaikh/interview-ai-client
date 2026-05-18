import axios from "axios";

const DEFAULT_API_ORIGIN = "https://interview-ai-server-nu.vercel.app";

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * API base URL ending in `/api`.
 * Deployed client uses same-origin `/api` (Next rewrite → server). Local dev
 * calls the remote API directly. Override with NEXT_PUBLIC_API_URL if needed.
 */
export function resolveApiBaseURL(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) {
    const base = env.replace(/\/+$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }
  if (typeof window !== "undefined") {
    if (!isLocalDevHost(window.location.hostname)) {
      return "/api";
    }
    return `${DEFAULT_API_ORIGIN}/api`;
  }
  return `${DEFAULT_API_ORIGIN}/api`;
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
