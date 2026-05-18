import { NextRequest, NextResponse } from "next/server";

const API_ORIGIN =
  process.env.API_URL?.replace(/\/+$/, "") ??
  "https://interview-ai-server-nu.vercel.app";

const FORWARD_REQUEST_HEADERS = ["content-type", "cookie", "authorization"];

export async function proxyToApi(
  req: NextRequest,
  path: string[],
): Promise<NextResponse> {
  const pathStr = path.join("/");
  const url = `${API_ORIGIN}/api/${pathStr}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(url, init);

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || lower === "transfer-encoding") return;
    responseHeaders.set(key, value);
  });

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}
