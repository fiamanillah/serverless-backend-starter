// services/auth-service/src/routes.ts
import { Hono } from "hono";
import { validateRequest } from "@serverless-backend-starter/core";
import { createUserSchema } from "./auth.dto.ts";
import { registerHandler } from "./register.ts";

/**
 * Auth service routes — mounted at /auth/v1
 */
const authRoutes = new Hono();

// POST /auth/v1/register
authRoutes.post(
  "/register",
  validateRequest(createUserSchema),
  registerHandler,
);

export { authRoutes };
