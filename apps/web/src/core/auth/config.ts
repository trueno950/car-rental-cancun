import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";

import { getWebEnv } from "../../../env";
import { createApiAccessToken } from "./api-access-token";
import { getAuthDb } from "./db/client";
import { accountsTable, sessionsTable, usersTable, verificationTokensTable } from "./db/schema";

interface BuildAuthConfigOptions {
  adapter?: NextAuthConfig["adapter"];
}

export function buildAuthConfig(options: BuildAuthConfigOptions = {}): NextAuthConfig {
  const env = getWebEnv();

  return {
    adapter:
      options.adapter ??
      DrizzleAdapter(getAuthDb(), {
        usersTable,
        accountsTable,
        sessionsTable,
        verificationTokensTable,
      }),
    secret: env.NEXTAUTH_SECRET,
    trustHost: true,
    session: {
      strategy: "database",
    },
    providers: [],
    pages: {
      signIn: "/es/login",
    },
    callbacks: {
      async signIn({ user }) {
        return Boolean(user.email && user.name);
      },
      async session({ session, user }) {
        if (!session.user?.email || !session.user.name) {
          return session;
        }

        session.user.id = user.id;
        session.apiAccessToken = await createApiAccessToken({
          expiresAt: session.expires,
          user: {
            id: user.id,
            email: session.user.email,
            name: session.user.name,
          },
        });

        return session;
      },
    },
  } satisfies NextAuthConfig;
}
