// packages/core/src/error-handler.ts
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  AppError,
  AuthenticationError,
  HTTPStatusCode,
  ValidationError,
} from "./errors.ts";
import { errorMapperRegistry } from "./error-mapper.ts";
import { logger } from "./logger.ts";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    requestId: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Normalize any thrown error into an AppError
 */
function normalizeError(err: unknown): AppError {
  // 1. Already an AppError
  if (err instanceof AppError) {
    return err;
  }

  // 2. Delegate to registered infrastructure error mappers (e.g., Prisma)
  const mappedError = errorMapperRegistry.map(err);
  if (mappedError) {
    return mappedError;
  }

  // 3. Handle validation errors
  if (err instanceof Error && err.name === "ValidationError") {
    return new ValidationError(err.message, { originalError: err });
  }

  // 4. Handle JSON parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    return new AppError({
      statusCode: HTTPStatusCode.BAD_REQUEST,
      message: "Invalid JSON in request body",
      code: "INVALID_JSON",
      details: { originalError: err.message },
    });
  }

  // 5. Handle JWT errors
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token", {
      originalError: err.message,
    });
  }

  if (err instanceof Error && err.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired", {
      originalError: err.message,
    });
  }

  // 6. Generic Error
  if (err instanceof Error) {
    return new AppError({
      statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
      message: err.message || "Internal server error",
      code: "INTERNAL_ERROR",
      details: { originalError: err.message, stack: err.stack },
    });
  }

  // 7. Unknown error type
  return new AppError({
    statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    details: { originalError: String(err) },
  });
}

function logError(error: AppError, c: Context): void {
  const method = c.req.method;
  const path = c.req.path;
  const requestId =
    (c.get("requestId") as string | undefined) || "unknown";
  const ip =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

  const logPayload = {
    method,
    path,
    statusCode: error.statusCode,
    code: error.code,
    ip,
    requestId,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  };

  if (error.statusCode >= 500) {
    logger.error({ ...logPayload, stack: error.stack }, `❌ ${error.message}`);
  } else if (error.statusCode >= 400) {
    logger.warn(logPayload, `⚠️ ${error.message}`);
  } else {
    logger.info(logPayload, `ℹ️ ${error.message}`);
  }
}

/**
 * Hono onError handler — drop-in for `app.onError()`
 */
export function honoErrorHandler(err: Error, c: Context): Response {
  const appError = normalizeError(err);

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      timestamp: new Date().toISOString(),
      requestId:
        (c.get("requestId") as string | undefined) || "unknown",
      ...(appError.details ? { details: appError.details } : {}),
      ...(process.env.NODE_ENV === "development"
        ? { stack: appError.stack }
        : {}),
    },
  };

  logError(appError, c);

  return c.json(errorResponse, appError.statusCode as ContentfulStatusCode);
}
