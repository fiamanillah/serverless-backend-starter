// packages/core/src/middleware/security-headers.ts
import type { MiddlewareHandler } from "hono";

/**
 * Security headers middleware — replaces helmet for Lambda
 */
export function securityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    await next();

    c.header("x-content-type-options", "nosniff");
    c.header("x-frame-options", "DENY");
    c.header("x-xss-protection", "1; mode=block");
    c.header("referrer-policy", "strict-origin-when-cross-origin");
  };
}
