import axios from "axios";

/**
 * API base URL ending in `/api`.
 * In the browser, uses the same hostname as the page (e.g. 127.0.0.1 vs localhost)
 * so the auth cookie set by Express on port 5000 matches the site origin.
 */
export function resolveApiBaseURL(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) {
    const base = env.replace(/\/+$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
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
