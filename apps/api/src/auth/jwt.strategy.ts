import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ApiJwtClaimsSchema, type ApiUser } from "@rental/validations";
import { ExtractJwt, Strategy } from "passport-jwt";

import { getApiEnv } from "../config/env";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getApiEnv().NEXTAUTH_SECRET,
    });
  }

  validate(payload: unknown): ApiUser {
    const parsed = ApiJwtClaimsSchema.safeParse(payload);

    if (!parsed.success) {
      throw new UnauthorizedException("Invalid JWT payload");
    }

    return {
      id: parsed.data.sub,
      email: parsed.data.email,
      name: parsed.data.name,
    };
  }
}
