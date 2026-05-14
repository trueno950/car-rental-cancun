import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ApiUser, UserRole } from "@rental/validations";

import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true; // no @Roles() → no role gate
    }

    const request = context.switchToHttp().getRequest<{ user?: ApiUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        "Authentication required for role-gated route",
      );
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenException("Insufficient role");
    }

    return true;
  }
}
