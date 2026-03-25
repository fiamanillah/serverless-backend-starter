// packages/core/src/error-mapper.ts
import type { AppError } from "./errors.ts";

export type ErrorMapper = (err: unknown) => AppError | undefined | null;

class ErrorMapperRegistry {
  private mappers: ErrorMapper[] = [];

  /** Register a new custom error mapper from an infrastructure provider */
  public register(mapper: ErrorMapper): void {
    this.mappers.push(mapper);
  }

  /** Run the error through all registered mappers */
  public map(err: unknown): AppError | null {
    for (const mapper of this.mappers) {
      const mappedError = mapper(err);
      if (mappedError) {
        return mappedError;
      }
    }
    return null;
  }
}

// Singleton instance
export const errorMapperRegistry = new ErrorMapperRegistry();
