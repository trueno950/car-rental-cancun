import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { tap, type Observable } from "rxjs";

/**
 * Logs every request lifecycle: `[METHOD] /path -> STATUS in Xms`.
 *
 * IMPORTANT: Never logs request body, headers, query params, or response body.
 * Those may contain PII (emails, names) or secrets (JWT, password fields).
 * If you need richer logging, add it at the service layer via Logger.log with
 * sanitized identifiers (IDs only).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt;
          this.logger.log(
            `[${method}] ${url} -> ${response.statusCode} in ${durationMs}ms`,
          );
        },
        error: () => {
          // The AllExceptionsFilter logs the full error with stack.
          // Here we just emit a same-shape line so timing is captured even on failure.
          const durationMs = Date.now() - startedAt;
          this.logger.warn(`[${method}] ${url} -> error in ${durationMs}ms`);
        },
      }),
    );
  }
}
