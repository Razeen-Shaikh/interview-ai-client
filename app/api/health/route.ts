import mongoose from "mongoose";

import { json } from "@/lib/api/http";
import connectDB from "@/lib/db/connect";

export async function GET() {
  let db = "disconnected";
  let dbError: string | null = null;

  try {
    await connectDB();
    db = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (error) {
    db = "error";
    dbError = error instanceof Error ? error.message : "Unknown error";
  }

  return json({
    success: true,
    db,
    dbError,
    env: {
      mongo: Boolean(process.env.MONGODB_URI?.trim()),
      jwt: Boolean(process.env.JWT_SECRET),
    },
  });
}
