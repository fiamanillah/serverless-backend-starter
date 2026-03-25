// packages/core/src/utils/pagination.ts
import type { Context } from "hono";
import type { PaginationOptions } from "../types.ts";

/**
 * Extract pagination params from Hono context query string
 */
export function extractPaginationParams(
  c: Context,
  maxLimit: number = 100,
): PaginationOptions {
  const page = Math.max(1, parseInt(c.req.query("page") || "1") || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(c.req.query("limit") || "10") || 10),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Generic Prisma paginate helper
 */
export async function paginate<T>(
  model: { findMany: (args: any) => Promise<T[]>; count: (args: any) => Promise<number> },
  args: Record<string, unknown>,
  page: number = 1,
  limit: number = 10,
) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;
  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: args.where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
