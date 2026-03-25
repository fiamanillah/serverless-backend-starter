import { handle } from 'hono/aws-lambda';
import { createServiceApp } from '@serverless-backend-starter/core';

// Create a Hono app with all global middleware pre-configured
const app = createServiceApp({
    serviceName: 'test-service',
    basePath: '/test/v1',
});

import type { Context } from "hono";

// Add a simple test route
app.get('/test/v1/ping', (c: Context) => {
    return c.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
        status: 'working',
    });
});

// Export the Lambda handler
export const handler = handle(app);
