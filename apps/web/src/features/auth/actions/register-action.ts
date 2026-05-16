"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { RegisterCredentialsSchema } from "@rental/validations";

import { getAuthDb } from "@core/auth/db/client";
import { usersTable } from "@core/auth/db/schema";

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerAction(
  formData: unknown,
): Promise<RegisterResult> {
  const parsed = RegisterCredentialsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "INVALID" };
  }

  const { name, email, password } = parsed.data;
  const db = getAuthDb();

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existing) {
    return { success: false, error: "EMAIL_IN_USE" };
  }

  const hashed = await hash(password, 12);

  await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
  });

  return { success: true };
}
