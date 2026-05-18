import { fail, handleRouteError, json, withDb } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import Interview from "@/lib/models/Interview";
import { evaluateAnswer } from "@/lib/services/ai.service";

type Params = { params: Promise<{ interviewId: string }> };

export async function POST(request: Request, context: Params) {
  try {
    const user = await requireSession();
    const { interviewId } = await context.params;
    const body = await request.json();
    const { questionIndex, answer } = body;

    const qIndex = Number(questionIndex);
    if (!Number.isInteger(qIndex) || qIndex < 0) {
      return fail("Invalid questionIndex", 400);
    }

    return await withDb(async () => {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return fail("Interview not found", 404);
      }
      if (interview.user.toString() !== String(user.id)) {
        return fail("Not authorized to update this interview", 403);
      }
      if (qIndex >= interview.questions.length) {
        return fail("Question index out of range", 400);
      }

      const question = interview.questions[qIndex];
      const evaluation = (await evaluateAnswer({
        question,
        answer: typeof answer === "string" ? answer : "",
        role: interview.role,
        level: interview.level,
        techStack: interview.techStack,
      })) as {
        score?: number;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
      };

      const scoreNum = Number(evaluation.score);
      const safeScore = Number.isFinite(scoreNum)
        ? Math.min(10, Math.max(0, scoreNum))
        : 0;

      interview.answers[qIndex].answer = typeof answer === "string" ? answer : "";
      interview.answers[qIndex].feedback = evaluation.feedback ?? "";
      interview.answers[qIndex].score = safeScore;
      interview.answers[qIndex].strengths = Array.isArray(evaluation.strengths)
        ? evaluation.strengths
        : [];
      interview.answers[qIndex].improvements = Array.isArray(evaluation.improvements)
        ? evaluation.improvements
        : [];

      const totalScore = interview.answers.reduce(
        (acc: number, curr: { score?: number }) => acc + (Number(curr.score) || 0),
        0,
      );
      interview.overallScore = totalScore / interview.questions.length;

      await interview.save();

      return json({
        success: true,
        evaluation,
        overallScore: interview.overallScore,
      });
    });
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === "OPENAI_INSUFFICIENT_QUOTA") {
      return fail(err.message, 503, { code: err.code });
    }
    return handleRouteError(error);
  }
}
