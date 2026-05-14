import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Catches every uncaught exception and serializes the canonical error envelope:
 *   { error: { code, message, details? } }
 *
 * Behavior:
 * - HttpException with object payload → reuse code/message/details fields when present
 * - HttpException with string payload → code derives from the HttpStatus enum name
 * - Unknown error → 500 + { code: "INTERNAL_ERROR", message: "Internal server error" }
 *   and log the full stack at error level.
 *
 * Services MUST throw HttpException subclasses (NotFoundException, ConflictException, etc).
 * Raw `throw new Error(...)` is forbidden by AGENTS.md and ESLint review.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const envelope = this.envelopeFromHttpException(exception, status);
      response.status(status).json(envelope);
      return;
    }

    // Unknown error path — log full context, never leak details.
    const stack =
      exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(
      `Unhandled exception on [${request.method}] ${request.originalUrl ?? request.url}`,
      stack,
    );

    const envelope: ErrorEnvelope = {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(envelope);
  }

  private envelopeFromHttpException(
    exception: HttpException,
    status: number,
  ): ErrorEnvelope {
    const raw = exception.getResponse();

    if (typeof raw === "string") {
      return {
        error: {
          code: this.codeFromStatus(status),
          message: raw,
        },
      };
    }

    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const code =
        typeof obj["code"] === "string"
          ? obj["code"]
          : this.codeFromStatus(status);
      const message =
        typeof obj["message"] === "string"
          ? obj["message"]
          : Array.isArray(obj["message"])
            ? (obj["message"] as string[]).join(", ")
            : exception.message;
      const details = "details" in obj ? obj["details"] : undefined;

      return {
        error: {
          code,
          message,
          ...(details !== undefined ? { details } : {}),
        },
      };
    }

    return {
      error: {
        code: this.codeFromStatus(status),
        message: exception.message,
      },
    };
  }

  private codeFromStatus(status: number): string {
    const name = (HttpStatus as unknown as Record<number, string | undefined>)[
      status
    ];
    return typeof name === "string" ? name : "HTTP_ERROR";
  }
}
