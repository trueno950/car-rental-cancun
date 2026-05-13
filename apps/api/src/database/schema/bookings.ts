import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { usersTable } from "./users";
import { vehiclesTable } from "./vehicles";

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

export const bookingStatusEnum = pgEnum("booking_status", [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CANCELLED,
]);

export const bookingsTable = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id, { onDelete: "restrict" }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  totalPriceCents: integer("total_price_cents").notNull(),
  status: bookingStatusEnum("status").notNull().default(BOOKING_STATUS.PENDING),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookingsRelations = relations(bookingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [bookingsTable.userId],
    references: [usersTable.id],
  }),
  vehicle: one(vehiclesTable, {
    fields: [bookingsTable.vehicleId],
    references: [vehiclesTable.id],
  }),
}));
