import { z } from "zod";

export const USER_ROLE = {
  CUSTOMER: "customer",
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export const UserRoleSchema = z.enum([
  USER_ROLE.CUSTOMER,
  USER_ROLE.EMPLOYEE,
  USER_ROLE.MANAGER,
  USER_ROLE.ADMIN,
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const LoginCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const RegisterCredentialsSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const AuthTokenSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const ApiJwtClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: UserRoleSchema.optional(), // Phase A: optional with API-side default
  isFrequent: z.boolean().optional(),
});

export const ApiUserSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: UserRoleSchema, // always present after validate() applies default
  isFrequent: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
});

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

export const UpdateUserFrequentSchema = z.object({
  isFrequent: z.boolean(),
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
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type ApiJwtClaims = z.infer<typeof ApiJwtClaimsSchema>;
export type ApiUser = z.infer<typeof ApiUserSchema>;
export type UpdateUserRole = z.infer<typeof UpdateUserRoleSchema>;
export type UpdateUserFrequent = z.infer<typeof UpdateUserFrequentSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
