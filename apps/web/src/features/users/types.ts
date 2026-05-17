import type { ApiUser, UserRole } from "@rental/validations";

export type UserAdminTableCopy = {
  empty: string;
  colName: string;
  colEmail: string;
  colRole: string;
  colFrequent: string;
  colCreatedAt: string;
  colActions: string;
  roleLabels: Record<UserRole, string>;
  markFrequent: string;
  removeFrequent: string;
};

export type UserAdminTableProps = {
  users: ApiUser[];
  copy: UserAdminTableCopy;
};
