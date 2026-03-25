// packages/core/src/config.ts
// Lambda-friendly config — reads from process.env directly (SST handles env injection)

export const config = {
  server: {
    env: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTest: process.env.NODE_ENV === "test",
  },
  database: {
    url: process.env.DATABASE_URL,
    logging: process.env.DB_LOGGING === "true",
  },
  security: {
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: process.env.JWT_ISSUER || "serverless-app",
    },
  },
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export default config;
