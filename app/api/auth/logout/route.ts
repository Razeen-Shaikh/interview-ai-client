import { json, TOKEN_COOKIE } from "@/lib/api/http";

export async function POST() {
  const res = json({ success: true, message: "Logged out" });
  res.cookies.delete(TOKEN_COOKIE);
  return res;
}
