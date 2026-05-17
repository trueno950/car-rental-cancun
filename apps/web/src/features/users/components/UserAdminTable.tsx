"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";

import type { ApiUser, UserRole } from "@rental/validations";

import { cn } from "@shared/lib";

import {
  updateUserRoleAction,
  updateUserFrequentAction,
} from "../actions/user-actions";
import type { UserAdminTableCopy } from "../types";

const ROLE_STYLES: Record<UserRole, string> = {
  customer:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  employee:
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  manager:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  admin:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const ROLES: UserRole[] = ["customer", "employee", "manager", "admin"];

type UserRowProps = {
  user: ApiUser;
  copy: UserAdminTableCopy;
};

function UserRow({ user, copy }: UserRowProps) {
  const [isRolePending, startRoleTransition] = useTransition();
  const [isFrequentPending, startFrequentTransition] = useTransition();

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as UserRole;
    startRoleTransition(async () => {
      await updateUserRoleAction(user.id, role);
    });
  }

  function handleFrequentToggle() {
    startFrequentTransition(async () => {
      await updateUserFrequentAction(user.id, !user.isFrequent);
    });
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </span>
          <span className="font-medium">{user.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            ROLE_STYLES[user.role],
          )}
        >
          {copy.roleLabels[user.role]}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleFrequentToggle}
          disabled={isFrequentPending}
          aria-label={user.isFrequent ? copy.removeFrequent : copy.markFrequent}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50",
            user.isFrequent
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Star
            className={cn(
              "size-3",
              user.isFrequent && "fill-current",
            )}
          />
          {user.isFrequent ? copy.removeFrequent : copy.markFrequent}
        </button>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={handleRoleChange}
          disabled={isRolePending}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 cursor-pointer"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {copy.roleLabels[role]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

type UserAdminTableProps = {
  users: ApiUser[];
  copy: UserAdminTableCopy;
};

export function UserAdminTable({ users, copy }: UserAdminTableProps) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{copy.empty}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {[
              copy.colName,
              copy.colEmail,
              copy.colRole,
              copy.colFrequent,
              copy.colActions,
            ].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <UserRow key={user.id} user={user} copy={copy} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
