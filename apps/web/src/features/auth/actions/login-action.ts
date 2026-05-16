"use server";

import { AuthError } from "next-auth";

import { signIn } from "@core/auth";

export type LoginResult = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const locale = (formData.get("locale") as string) ?? "es";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: `/${locale}/vehicles`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos" };
    }
    throw error;
  }
}
