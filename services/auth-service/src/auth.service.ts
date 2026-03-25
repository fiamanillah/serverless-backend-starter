// services/auth-service/src/auth.service.ts
import { db } from "@serverless-backend-starter/database";
import { AppLogger, ConflictError } from "@serverless-backend-starter/core";

export class AuthService {
  private logger = new AppLogger("AuthService");

  /**
   * Register a new user
   */
  public async register(
    email: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
  ) {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn("Registration failed: User already exists", { email });
      throw new ConflictError("A user with this email already exists");
    }

    const newUser = await db.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: passwordHash, // Hash passwords before calling this!
      },
    });

    this.logger.info("User registered successfully", { userId: newUser.id });

    return newUser;
  }
}

// Singleton instance for Lambda cold-start reuse
export const authService = new AuthService();
