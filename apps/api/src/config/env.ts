import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const apiEnvSchema = databaseEnvSchema
  .extend({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    STRIPE_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1")
      .pipe(z.boolean())
      .default(false),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    DEPOSIT_RATE_FREQUENT: z.coerce.number().default(0.2),
    DEPOSIT_RATE_NEW: z.coerce.number().default(0.3),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
  })
  .superRefine((data, ctx) => {
    if (data.STRIPE_ENABLED) {
      if (!data.STRIPE_SECRET_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["STRIPE_SECRET_KEY"],
          message: "STRIPE_SECRET_KEY is required when STRIPE_ENABLED=true",
        });
      }
      if (!data.STRIPE_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["STRIPE_WEBHOOK_SECRET"],
          message: "STRIPE_WEBHOOK_SECRET is required when STRIPE_ENABLED=true",
        });
      }
    }
  });

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

type EnvInput = Record<string, string | undefined>;

let cachedEnv: ApiEnv | null = null;

function formatEnvError(prefix: string, error: z.ZodError): never {
  const issues = error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid ${prefix} environment variables: ${issues}`);
}

export function parseDatabaseEnv(input: EnvInput = process.env): DatabaseEnv {
  const parsed = databaseEnvSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  return formatEnvError("database", parsed.error);
}

export function parseApiEnv(input: EnvInput = process.env): ApiEnv {
  const parsed = apiEnvSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  return formatEnvError("api", parsed.error);
}

export function getApiEnv(): ApiEnv {
  cachedEnv ??= parseApiEnv(process.env);
  return cachedEnv;
}

export function resetApiEnvCache() {
  cachedEnv = null;
}
