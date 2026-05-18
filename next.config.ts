import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "mongoose",
    "mongodb",
    "bson",
    "jsonwebtoken",
    "bcryptjs",
    "openai",
    "@google/generative-ai",
  ],
};

export default nextConfig;
