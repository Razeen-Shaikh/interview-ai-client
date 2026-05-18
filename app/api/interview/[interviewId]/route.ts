import { fail, handleRouteError, json, withDb } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import Interview from "@/lib/models/Interview";

type Params = { params: Promise<{ interviewId: string }> };

export async function GET(_request: Request, context: Params) {
  try {
    const user = await requireSession();
    const { interviewId } = await context.params;

    return await withDb(async () => {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return fail("Interview not found", 404);
      }
      if (interview.user.toString() !== String(user.id)) {
        return fail("Not authorized to view this interview", 403);
      }
      return json({ success: true, interview });
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
