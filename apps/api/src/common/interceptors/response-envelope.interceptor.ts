import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { Response } from "express";
import { map, type Observable } from "rxjs";

/**
 * Wraps every successful response in the canonical envelope: { data: T }.
 *
 * Skip conditions:
 *  - 204 No Content responses (no body should ever leave the server)
 *  - Already-enveloped payloads ({ data: ... } shape) — defensive, avoids double-wrap
 *  - Paginated payloads of shape { items, total, page, pageSize } are remapped
 *    to { data: items, meta: { total, page, pageSize } }
 *
 * Errors are NEVER wrapped here — the AllExceptionsFilter owns the error envelope.
 */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((payload: unknown) => {
        if (response.statusCode === 204) {
          return payload;
        }

        if (isAlreadyEnveloped(payload)) {
          return payload;
        }

        if (isPaginatedShape(payload)) {
          const { items, total, page, pageSize } = payload;
          return {
            data: items,
            meta: { total, page, pageSize },
          };
        }

        return { data: payload };
      }),
    );
  }
}

function isAlreadyEnveloped(value: unknown): value is { data: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Object.keys(value).every((key) => key === "data" || key === "meta")
  );
}

function isPaginatedShape(value: unknown): value is {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
} {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v["items"]) &&
    typeof v["total"] === "number" &&
    typeof v["page"] === "number" &&
    typeof v["pageSize"] === "number"
  );
}
