// services/auth-service/src/register.ts
import type { Context } from "hono";
import { sendCreatedResponse } from "@serverless-backend-starter/core";
import { authService } from "./auth.service.ts";
import type { CreateUserDTO } from "./auth.dto.ts";

/**
 * Handler: POST /auth/v1/register
 */
export async function registerHandler(c: Context): Promise<Response> {
  // 1. Extract the validated body (populated by validateRequest middleware)
  const { email, firstName, lastName, password } =
    c.get("validatedBody") as CreateUserDTO;

  // 2. Pass the data to the Service Layer (Business Logic)
  const newUser = await authService.register(
    email,
    firstName,
    lastName,
    password,
  );

  // 3. Remove sensitive information before sending back
  const { password: _, ...userWithoutPassword } = newUser;

  // 4. Send standardized response
  return sendCreatedResponse(c, userWithoutPassword, "User registered successfully");
}
