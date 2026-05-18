import { NextRequest } from "next/server";

import { proxyToApi } from "@/lib/api-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToApi(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
