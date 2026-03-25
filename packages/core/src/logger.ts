// packages/core/src/logger.ts
import pino from "pino";

// In Lambda, we output raw JSON for CloudWatch. Locally, use pino-pretty.
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.IS_LOCAL && {
    transport: { target: "pino-pretty" },
  }),
});

export { baseLogger as logger };

/**
 * AppLogger — contextual logger matching Express template's API.
 * Supports both static (global) and instance (contextual) methods.
 */
export class AppLogger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  // ==========================================
  // INSTANCE METHODS (Contextual)
  // ==========================================
  public info(msg: string, meta: Record<string, unknown> = {}) {
    baseLogger.info({ ...meta, context: this.context }, msg);
  }

  public warn(msg: string, meta: Record<string, unknown> = {}) {
    baseLogger.warn({ ...meta, context: this.context }, msg);
  }

  public debug(msg: string, meta: Record<string, unknown> = {}) {
    baseLogger.debug({ ...meta, context: this.context }, msg);
  }

  public error(msg: string | Error, meta: Record<string, unknown> = {}) {
    if (msg instanceof Error) {
      baseLogger.error(
        { ...meta, context: this.context, stack: msg.stack },
        msg.message,
      );
    } else {
      baseLogger.error({ ...meta, context: this.context }, msg);
    }
  }

  // ==========================================
  // STATIC METHODS (Global)
  // ==========================================
  static info(msg: string, meta?: Record<string, unknown>) {
    baseLogger.info(meta || {}, msg);
  }

  static warn(msg: string, meta?: Record<string, unknown>) {
    baseLogger.warn(meta || {}, msg);
  }

  static debug(msg: string, meta?: Record<string, unknown>) {
    baseLogger.debug(meta || {}, msg);
  }

  static error(msg: string | Error, meta?: Record<string, unknown>) {
    if (msg instanceof Error) {
      baseLogger.error({ ...meta, stack: msg.stack }, msg.message);
    } else {
      baseLogger.error(meta || {}, msg);
    }
  }
}
