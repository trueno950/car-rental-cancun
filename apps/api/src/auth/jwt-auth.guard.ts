import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { ExecutionContext } from "@nestjs/common";

import { IS_PUBLIC_ROUTE_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  override canActivate(context: ExecutionContext) {
    const isPublic =
      Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, context.getHandler()) ??
      Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, context.getClass());

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    error: Error | null,
    user: TUser | false | null,
  ) {
    if (error || !user) {
      throw error ?? new UnauthorizedException();
    }

    return user;
  }
}
