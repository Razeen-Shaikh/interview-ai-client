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
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return fail("All fields are required", 400);
    }

    const emailNormalized = String(email).trim().toLowerCase();

    return await withDb(async () => {
      const existingUser = await User.findOne({ email: emailNormalized });
      if (existingUser) {
        return fail("User already exists", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: String(name).trim(),
        email: emailNormalized,
        password: hashedPassword,
      });

      const token = generateToken(user);
      const res = json(
        {
          success: true,
          message: "User registered successfully",
          user: { id: user._id, name: user.name, email: user.email },
        },
        201,
      );
      res.cookies.set(TOKEN_COOKIE, token, authCookieOptions());
      return res;
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
