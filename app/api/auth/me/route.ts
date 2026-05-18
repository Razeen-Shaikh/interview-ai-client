import { fail, handleRouteError, json } from "@/lib/api/http";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Unauthorized", 401);
    }
    return json({ success: true, user });
  } catch (error) {
    return handleRouteError(error);
  }
}
