import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

import { LoginCredentialsSchema, type UserRole } from "@rental/validations";

import { getWebEnv } from "../../../env";
import { createApiAccessToken } from "./api-access-token";
import { getAuthDb } from "./db/client";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
} from "./db/schema";

interface BuildAuthConfigOptions {
  adapter?: NextAuthConfig["adapter"];
}

export function buildAuthConfig(
  options: BuildAuthConfigOptions = {},
): NextAuthConfig {
  const env = getWebEnv();
  const db = getAuthDb();

  const providers: NextAuthConfig["providers"] = [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, email),
        });

        if (!user?.password) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isFrequent: user.isFrequent,
        };
      },
    }),
  ];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      Facebook({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
      }),
    );
  }

  return {
    adapter:
      options.adapter ??
      DrizzleAdapter(db, {
        usersTable,
        accountsTable,
        sessionsTable,
        verificationTokensTable,
      }),
    secret: env.NEXTAUTH_SECRET,
    trustHost: true,
    session: {
      strategy: "jwt",
    },
    providers,
    pages: {
      signIn: "/es/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          if (user.id) token.id = user.id;
          token.role =
            ((user as { role?: string }).role as UserRole) ?? "customer";
          token.isFrequent =
            (user as { isFrequent?: boolean }).isFrequent ?? false;
        }
        return token;
      },
      async session({ session, token }) {
        if (!session.user?.email || !session.user.name) {
          return session;
        }

        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "customer";
        session.apiAccessToken = await createApiAccessToken({
          expiresAt: session.expires,
          user: {
            id: token.id ?? "",
            email: session.user.email,
            name: session.user.name,
            role: token.role ?? "customer",
            isFrequent: token.isFrequent ?? false,
          },
        });

        return session;
      },
    },
  } satisfies NextAuthConfig;
}
