import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { ApiUser } from "@rental/validations";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ApiUser => {
    const request = ctx.switchToHttp().getRequest<{ user: ApiUser }>();
    return request.user;
  },
);
