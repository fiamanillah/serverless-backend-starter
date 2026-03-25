// packages/core/src/middleware/request-logger.ts
import type { MiddlewareHandler } from "hono";
import { logger } from "../logger.ts";

/**
 * Request logger — logs method, path, status, duration, IP, UA, and requestId.
 */
export function requestLogger(): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    const userAgent = c.req.header("user-agent") || "Unknown UA";
    const xff = c.req.header("x-forwarded-for");
    const ip = xff || c.req.header("x-real-ip") || "unknown";
    const requestId =
      (c.get("requestId") as string | undefined) || "unknown";

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;
    const contentLength = c.res.headers.get("content-length") || 0;
    const contentType = c.res.headers.get("content-type") || "unknown";

    logger.info(
      {
        method,
        path,
        status,
        duration,
        contentLength,
        contentType,
        ip,
        requestId,
        userAgent,
      },
      `📩 [${method}] ${path} | Status: ${status} | Time: ${duration}ms | IP: ${ip}`,
    );
  };
}
