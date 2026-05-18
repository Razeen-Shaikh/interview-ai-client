import { fail, handleRouteError, json, withDb } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import Interview from "@/lib/models/Interview";
import { generateInterviewQuestions } from "@/lib/services/ai.service";

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const { role, level, techStack } = body;

    if (
      !process.env.GEMINI_API_KEY?.trim() &&
      !process.env.OPENAI_API_KEY?.trim()
    ) {
      return fail(
        "Custom AI-generated questions require GEMINI_API_KEY (Google AI Studio) or OPENAI_API_KEY. Practice tests work without either.",
        503,
        { code: "AI_NOT_CONFIGURED" },
      );
    }

    if (
      !role ||
      !level ||
      !Array.isArray(techStack) ||
      techStack.length === 0 ||
      !techStack.every((t: unknown) => typeof t === "string" && t.trim().length > 0)
    ) {
      return fail(
        "Missing or invalid fields: role, level, and a non-empty techStack array of strings are required",
        400,
      );
    }

    const normalizedStack = techStack.map((t: string) => t.trim());

    const questions = await generateInterviewQuestions({
      role,
      level,
      techStack: normalizedStack,
    });

    const answers = questions.map((question: string) => ({ question }));

    return await withDb(async () => {
      const interview = await Interview.create({
        user: user.id,
        role,
        level,
        techStack: normalizedStack,
        questions,
        answers,
      });
      return json({ success: true, interview }, 201);
    });
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === "AI_NOT_CONFIGURED") {
      return fail(err.message, 503, { code: err.code });
    }
    return handleRouteError(error);
  }
}
