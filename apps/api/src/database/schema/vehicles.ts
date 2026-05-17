import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const vehiclesTable = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  dailyRateCents: integer("daily_rate_cents").notNull(),
  available: boolean("available").notNull().default(true),
  seats: integer("seats").notNull().default(5),
  doors: integer("doors").notNull().default(4),
  trunkLiters: integer("trunk_liters"),
  maxPayloadKg: integer("max_payload_kg"),
  transmissionType: varchar("transmission_type", { length: 50 })
    .notNull()
    .default("automatic"),
  fuelType: varchar("fuel_type", { length: 50 }).notNull().default("gasoline"),
  category: varchar("category", { length: 50 }).notNull().default("compact"),
  airConditioned: boolean("air_conditioned").notNull().default(true),
  airbags: integer("airbags"),
  licensePlate: varchar("license_plate", { length: 20 }),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
