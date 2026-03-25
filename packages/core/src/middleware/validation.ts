// packages/core/src/middleware/validation.ts
import type { MiddlewareHandler, Context } from "hono";
import { z } from "zod";
import { ValidationError } from "../errors.ts";

interface ValidationSchema {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

/**
 * Zod validation middleware for Hono.
 * Validates body, query, and/or params against provided Zod schemas.
 * Stores validated data on context via c.set().
 */
export function validateRequest(schema: ValidationSchema): MiddlewareHandler {
  return async (c, next) => {
    try {
      // Validate body
      if (schema.body) {
        const body = await c.req.json();
        const parsed = schema.body.parse(body);
        c.set("validatedBody", parsed);
      }

      // Validate query parameters
      if (schema.query) {
        const query = c.req.query();
        const parsed = schema.query.parse(query);
        c.set("validatedQuery", parsed);
      }

      // Validate route params
      if (schema.params) {
        const params = c.req.param();
        const parsed = schema.params.parse(params);
        c.set("validatedParams", parsed);
      }

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        throw new ValidationError("Request validation failed", {
          issues,
          invalidFields: issues.length,
        });
      }
      throw error;
    }
  };
}

/**
 * Helper to retrieve validated data from Hono context
 */
export function getValidatedData(c: Context) {
  return {
    body: c.get("validatedBody"),
    query: c.get("validatedQuery") || c.req.query(),
    params: c.get("validatedParams") || c.req.param(),
  };
}
