"use server";

import { revalidatePath } from "next/cache";

import type { ApiUser, UserRole } from "@rental/validations";

import { auth } from "@core/auth";

import { listUsers, setUserRole, setUserFrequent } from "../services/users.service";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.apiAccessToken) throw new Error("Not authenticated");
  return session.apiAccessToken;
}

export async function listUsersAction(): Promise<ApiUser[]> {
  const token = await getToken();
  return listUsers({ token });
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<void> {
  const token = await getToken();
  await setUserRole(userId, role, { token });
  revalidatePath("/[locale]/admin/users", "layout");
}

export async function updateUserFrequentAction(
  userId: string,
  isFrequent: boolean,
): Promise<void> {
  const token = await getToken();
  await setUserFrequent(userId, isFrequent, { token });
  revalidatePath("/[locale]/admin/users", "layout");
}
