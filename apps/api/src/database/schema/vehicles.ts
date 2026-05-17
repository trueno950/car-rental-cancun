import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  VEHICLE_CATEGORIES,
  type TransmissionType,
  type FuelType,
  type VehicleCategory,
} from "@rental/validations";

export const transmissionTypeEnum = pgEnum(
  "transmission_type",
  Object.values(TRANSMISSION_TYPES) as [
    TransmissionType,
    ...TransmissionType[],
  ],
);
export const fuelTypeEnum = pgEnum(
  "fuel_type",
  Object.values(FUEL_TYPES) as [FuelType, ...FuelType[]],
);
export const vehicleCategoryEnum = pgEnum(
  "vehicle_category",
  Object.values(VEHICLE_CATEGORIES) as [VehicleCategory, ...VehicleCategory[]],
);

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
  transmissionType: transmissionTypeEnum("transmission_type")
    .notNull()
    .default("automatic"),
  fuelType: fuelTypeEnum("fuel_type").notNull().default("gasoline"),
  category: vehicleCategoryEnum("category").notNull().default("compact"),
  airConditioned: boolean("air_conditioned").notNull().default(true),
  airbags: integer("airbags"),
  licensePlate: varchar("license_plate", { length: 20 }),
  color: varchar("color", { length: 50 }),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
