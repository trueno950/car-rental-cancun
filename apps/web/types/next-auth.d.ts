import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    apiAccessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
