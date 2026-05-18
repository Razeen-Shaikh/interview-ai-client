import axios from "axios";

/** Same-origin Next.js API routes under /app/api */
export function resolveApiBaseURL(): string {
  return "/api";
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  withCredentials: true,
});

export default api;
