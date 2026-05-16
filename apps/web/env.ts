import { z } from "zod";

const webEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.url())
    .default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

type EnvInput = Record<string, string | undefined>;

let cachedEnv: WebEnv | null = null;

export function parseWebEnv(input: EnvInput = process.env): WebEnv {
  const parsed = webEnvSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid web environment variables: ${issues}`);
}

export function getWebEnv(): WebEnv {
  cachedEnv ??= parseWebEnv(process.env);
  return cachedEnv;
}

export function resetWebEnvCache() {
  cachedEnv = null;
}
