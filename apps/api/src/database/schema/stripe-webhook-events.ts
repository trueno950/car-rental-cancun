import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const stripeWebhookEventsTable = pgTable("stripe_webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 120 }).notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
