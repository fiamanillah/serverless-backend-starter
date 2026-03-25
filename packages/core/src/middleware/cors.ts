// packages/core/src/middleware/cors.ts
import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import { config } from "../config.ts";

/**
 * CORS middleware configured from environment variables
 */
export function corsMiddleware(): MiddlewareHandler {
  const origins = config.security.cors.allowedOrigins
    .split(",")
    .map((url) => url.trim());

  return cors({
    origin: origins,
    credentials: true,
  });
}
