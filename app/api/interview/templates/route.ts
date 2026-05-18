import { handleRouteError, json } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import { listTemplateSummaries } from "@/lib/data/interviewTemplates";

export async function GET() {
  try {
    await requireSession();
    return json({ success: true, templates: listTemplateSummaries() });
  } catch (error) {
    return handleRouteError(error);
  }
}
