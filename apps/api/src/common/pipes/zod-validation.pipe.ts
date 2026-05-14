import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
} from "@nestjs/common";
import type { ZodType, infer as zInfer } from "zod";

/**
 * Validates incoming values against a Zod schema.
 *
 * Usage:
 *   @Post()
 *   create(@Body(new ZodValidationPipe(CreateVehicleSchema)) dto: CreateVehicleDto) { ... }
 *
 * On failure, throws a BadRequestException with a structured payload:
 *   { code: "VALIDATION_ERROR", message: string, details: ZodFlattenedError }
 *
 * The global AllExceptionsFilter unwraps the HttpException response and
 * re-wraps it in the standard error envelope: { error: { code, message, details } }.
 */
@Injectable()
export class ZodValidationPipe<T extends ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown, _metadata: ArgumentMetadata): zInfer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: result.error.flatten(),
      });
    }
    return result.data;
  }
}
