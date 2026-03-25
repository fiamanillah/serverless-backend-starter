// packages/core/src/errors.ts

// ==========================================
// HTTP Status Code Enum
// ==========================================
export enum HTTPStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  MOVED_TEMPORARILY = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  REQUEST_URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  CLIENT_CLOSED_REQUEST = 499,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  NETWORK_AUTHENTICATION_REQUIRED = 511,
}

// ==========================================
// Base AppError
// ==========================================
export interface AppErrorArgs {
  statusCode: HTTPStatusCode;
  message: string;
  code?: string;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: HTTPStatusCode;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(args: AppErrorArgs) {
    super(args.message);
    this.name = this.constructor.name;
    this.statusCode = args.statusCode;
    this.code = args.code || "APP_ERROR";
    this.isOperational = args.isOperational ?? true;
    this.details = args.details;

    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      ...(process.env.NODE_ENV === "development" && this.details
        ? { details: this.details }
        : {}),
    };
  }
}

// ==========================================
// Specific Error Subclasses
// ==========================================

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.BAD_REQUEST,
      message,
      code: "VALIDATION_ERROR",
      details,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.NOT_FOUND,
      message: `${resource} not found`,
      code: "NOT_FOUND",
      details,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.UNAUTHORIZED,
      message,
      code: "AUTHENTICATION_ERROR",
      details,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.FORBIDDEN,
      message,
      code: "AUTHORIZATION_ERROR",
      details,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.CONFLICT,
      message,
      code: "CONFLICT_ERROR",
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.TOO_MANY_REQUESTS,
      message,
      code: "RATE_LIMIT_ERROR",
      details,
    });
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload too large", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.PAYLOAD_TOO_LARGE,
      message,
      code: "PAYLOAD_TOO_LARGE",
      details,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR,
      message,
      code: "DATABASE_ERROR",
      details,
      isOperational: false,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.BAD_GATEWAY,
      message,
      code: "EXTERNAL_SERVICE_ERROR",
      details,
    });
  }
}

export class TimeoutError extends AppError {
  constructor(message = "Request timeout", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.REQUEST_TIMEOUT,
      message,
      code: "TIMEOUT_ERROR",
      details,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super({
      statusCode: HTTPStatusCode.BAD_REQUEST,
      message,
      code: "BAD_REQUEST_ERROR",
      details,
    });
  }
}
