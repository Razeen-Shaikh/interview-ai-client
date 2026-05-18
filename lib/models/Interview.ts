import "server-only";

import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: String,
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  score: { type: Number, default: 0 },
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    level: String,
    techStack: [String],
    questions: [String],
    answers: [answerSchema],
    overallScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Interview ||
  mongoose.model("Interview", interviewSchema);
