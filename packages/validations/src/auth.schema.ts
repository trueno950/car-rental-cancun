import { z } from "zod";

export const LoginCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const AuthTokenSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const ApiJwtClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1),
});

export const ApiUserSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1),
});

export const UserSessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.email(),
    name: z.string().min(1),
  }),
  token: AuthTokenSchema,
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type ApiJwtClaims = z.infer<typeof ApiJwtClaimsSchema>;
export type ApiUser = z.infer<typeof ApiUserSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
