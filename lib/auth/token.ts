import "server-only";

import jwt from "jsonwebtoken";

export type SessionUser = {
  id: string;
  name?: string;
  email?: string;
};

export function generateToken(user: {
  _id: unknown;
  name?: string;
  email?: string;
}): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(
    {
      id: String(user._id),
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string): SessionUser | null {
  if (!process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
