import { fail, handleRouteError, json, withDb } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import { getTemplateById } from "@/lib/data/interviewTemplates";
import Interview from "@/lib/models/Interview";

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { templateId } = body;

    if (!templateId || typeof templateId !== "string") {
      return fail("templateId is required", 400);
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return fail("Unknown interview template", 404);
    }

    return await withDb(async () => {
      const questions = [...template.questions];
      const answers = questions.map((question) => ({ question }));

      const interview = await Interview.create({
        user: user.id,
        role: template.role,
        level: template.level,
        techStack: [...template.techStack],
        questions,
        answers,
      });

      return json({ success: true, interview }, 201);
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
