import { pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const verificationTokensTable = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);
