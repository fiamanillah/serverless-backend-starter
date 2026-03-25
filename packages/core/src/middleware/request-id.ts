// packages/core/src/middleware/request-id.ts
import type { MiddlewareHandler } from "hono";
import crypto from "crypto";

/**
 * Assigns a unique request ID (from existing header or new UUID)
 * and sets it on the Hono context + response header.
 */
export function requestId(): MiddlewareHandler {
  return async (c, next) => {
    const existingId =
      c.req.header("x-request-id") || c.req.header("x-correlation-id");

    const id = existingId || crypto.randomUUID();

    // Store on context for use by other middleware / handlers
    c.set("requestId", id);

    // Add to response headers
    c.header("x-request-id", id);

    await next();
  };
}
