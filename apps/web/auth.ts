import NextAuth from "next-auth";

import { buildAuthConfig } from "@core/auth";

export const authConfig = buildAuthConfig();
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
