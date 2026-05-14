import type { DefaultSession } from "next-auth";
import type { UserRole } from "@rental/validations";

declare module "next-auth" {
  interface Session {
    apiAccessToken?: string;
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}
