import "server-only";

import mongoose from "mongoose";

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = { conn: null, promise: null };
}

const cache = globalCache.mongooseCache;

/** Ensure URI includes a database name (Atlas URLs often end with `/?options` only). */
function resolveMongoUri(): string {
  const raw = process.env.MONGODB_URI?.trim();
  if (!raw) {
    throw new Error("MONGODB_URI is not set");
  }

  const dbName = process.env.MONGODB_DB_NAME?.trim() || "interview-ai";

  if (/^mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(raw)) {
    return raw;
  }
  if (/^mongodb(\+srv)?:\/\/[^/]+\/\?/.test(raw)) {
    return raw.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+)\/\?/, `$1/${dbName}?`);
  }
  if (/^mongodb(\+srv)?:\/\/[^/]+\?/.test(raw)) {
    return raw.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+)\?/, `$1/${dbName}?`);
  }
  if (/^mongodb(\+srv)?:\/\/[^/]+\/?$/.test(raw)) {
    return raw.replace(/\/?$/, `/${dbName}`);
  }
  return raw;
}

export default async function connectDB() {
  const uri = resolveMongoUri();

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 1,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }

  return cache.conn;
}
