import NextAuth from "next-auth";

import { buildAuthConfig } from "./src/core/auth/config";

export const authConfig = buildAuthConfig();
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
