import { z } from "zod";

import { ApiUserSchema } from "@rental/validations";
import type { ApiUser } from "@rental/validations";

const DEFAULT_API_BASE_URL = "http://localhost:3001";

export const USERS_PATH = "/users";

export function resolveUsersApiBaseUrl(override?: string) {
  return override ?? process.env.RENTAL_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

const UsersEnvelopeSchema = z.object({ data: z.array(ApiUserSchema) });
const UserEnvelopeSchema = z.object({ data: ApiUserSchema });

interface UsersApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  token: string;
}

async function apiFetch(
  path: string,
  options: UsersApiClientOptions & { method?: string; body?: unknown },
): Promise<unknown> {
  const apiBaseUrl = resolveUsersApiBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(new URL(path, apiBaseUrl), {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.token}`,
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Users API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchAllUsers(
  options: UsersApiClientOptions,
): Promise<ApiUser[]> {
  const raw = await apiFetch(USERS_PATH, options);
  return UsersEnvelopeSchema.parse(raw).data;
}

export async function updateUserRoleRequest(
  id: string,
  role: string,
  options: UsersApiClientOptions,
): Promise<ApiUser> {
  const raw = await apiFetch(`${USERS_PATH}/${id}/role`, {
    ...options,
    method: "PATCH",
    body: { role },
  });
  return UserEnvelopeSchema.parse(raw).data;
}

export async function updateUserFrequentRequest(
  id: string,
  isFrequent: boolean,
  options: UsersApiClientOptions,
): Promise<ApiUser> {
  const raw = await apiFetch(`${USERS_PATH}/${id}/frequent`, {
    ...options,
    method: "PATCH",
    body: { isFrequent },
  });
  return UserEnvelopeSchema.parse(raw).data;
}
