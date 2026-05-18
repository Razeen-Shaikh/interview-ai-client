import bcrypt from "bcryptjs";

import {
  authCookieOptions,
  fail,
  handleRouteError,
  json,
  TOKEN_COOKIE,
  withDb,
} from "@/lib/api/http";
import { generateToken } from "@/lib/auth/token";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return fail("Email and password required", 400);
    }

    const emailNormalized = String(email).trim().toLowerCase();

    return await withDb(async () => {
      const user = await User.findOne({ email: emailNormalized });
      if (!user) {
        return fail("Invalid credentials", 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return fail("Invalid credentials", 401);
      }

      const token = generateToken(user);
      const res = json({
        success: true,
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email },
      });
      res.cookies.set(TOKEN_COOKIE, token, authCookieOptions());
      return res;
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
