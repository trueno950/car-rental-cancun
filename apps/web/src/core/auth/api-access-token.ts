import { SignJWT } from "jose";
import { ApiJwtClaimsSchema } from "@rental/validations";
import type { UserRole } from "@rental/validations";

import { getWebEnv } from "../../../env";

interface ApiAccessTokenUser {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  isFrequent?: boolean;
}

interface CreateApiAccessTokenInput {
  expiresAt: Date | string;
  user: ApiAccessTokenUser;
}

export async function createApiAccessToken({
  expiresAt,
  user,
}: CreateApiAccessTokenInput) {
  const env = getWebEnv();
  const claims = ApiJwtClaimsSchema.parse({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isFrequent: user.isFrequent,
  });

  return new SignJWT({
    email: claims.email,
    name: claims.name,
    sub: claims.sub,
    role: claims.role,
    ...(claims.isFrequent !== undefined
      ? { isFrequent: claims.isFrequent }
      : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("rental-car-cancun-web")
    .setAudience("rental-car-cancun-api")
    .setSubject(claims.sub)
    .setExpirationTime(Math.floor(new Date(expiresAt).getTime() / 1000))
    .sign(new TextEncoder().encode(env.NEXTAUTH_SECRET));
}
