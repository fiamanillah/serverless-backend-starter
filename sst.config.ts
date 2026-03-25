/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "serverless-backend-starter",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // ==========================================
    // Shared environment variables for all Lambda functions
    // ==========================================
    const sharedEnv = {
      DATABASE_URL: process.env.DATABASE_URL || "",
      NODE_ENV: $app.stage === "production" ? "production" : "development",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
      JWT_SECRET: process.env.JWT_SECRET || "",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
      JWT_ISSUER: process.env.JWT_ISSUER || "serverless-app",
      IS_LOCAL: "true",
    };

    // ==========================================
    // API Gateway
    // ==========================================
    const api = new sst.aws.ApiGatewayV2("MyApi");

    // ==========================================
    // Auth Service — handles /auth/v1/*
    // ==========================================
    api.route("POST /auth/v1/register", {
      handler: "services/auth-service/index.handler",
      environment: sharedEnv,
      timeout: "30 seconds",
      memory: "256 MB",
    });

    // Health check for auth service
    api.route("GET /auth/v1/health", {
      handler: "services/auth-service/index.handler",
      environment: sharedEnv,
      timeout: "10 seconds",
      memory: "128 MB",
    });

    // Test endpoint
    api.route("GET /test/v1/ping", {
      handler: "services/test-service/index.handler",
      environment: sharedEnv,
      timeout: "10 seconds",
      memory: "128 MB",
    });

    // ==========================================
    // Add more services here:
    // ==========================================
    // api.route("$default", {
    //   handler: "services/some-service/index.handler",
    //   environment: sharedEnv,
    // });
  },
});
