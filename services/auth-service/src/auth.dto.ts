// services/auth-service/src/auth.dto.ts
import { z } from "zod";

export const createUserSchema = {
  body: z.object({
    email: z.email("Invalid email address"),
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    username: z.string().optional(),
  }),
};

export type CreateUserDTO = z.infer<typeof createUserSchema.body>;
