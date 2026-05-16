import type { ApiUser } from "@rental/validations";

import {
  fetchAllUsers,
  updateUserRoleRequest,
  updateUserFrequentRequest,
} from "@core/http";

interface UsersClientOptions {
  token: string;
}

export function listUsers(options: UsersClientOptions): Promise<ApiUser[]> {
  return fetchAllUsers(options);
}

export function setUserRole(
  id: string,
  role: string,
  options: UsersClientOptions,
): Promise<ApiUser> {
  return updateUserRoleRequest(id, role, options);
}

export function setUserFrequent(
  id: string,
  isFrequent: boolean,
  options: UsersClientOptions,
): Promise<ApiUser> {
  return updateUserFrequentRequest(id, isFrequent, options);
}
