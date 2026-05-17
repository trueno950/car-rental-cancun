import { z } from "zod";

export const TRANSMISSION_TYPES = ["automatic", "manual", "4x4"] as const;
export const FUEL_TYPES = ["gasoline", "diesel", "hybrid", "electric"] as const;
export const VEHICLE_CATEGORIES = ["economy", "compact", "suv", "luxury"] as const;

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2000),
  dailyRate: z.number().positive(),
  available: z.boolean(),
  seats: z.number().int().min(1).max(20),
  doors: z.number().int().min(2).max(8),
  trunkLiters: z.number().int().positive().nullable(),
  maxPayloadKg: z.number().int().positive().nullable(),
  transmissionType: z.enum(TRANSMISSION_TYPES),
  fuelType: z.enum(FUEL_TYPES),
  category: z.enum(VEHICLE_CATEGORIES),
  airConditioned: z.boolean(),
  airbags: z.number().int().min(0).nullable(),
  licensePlate: z.string().max(20).nullable(),
  color: z.string().max(50).nullable(),
});

// Used only for parsing API responses — adds defaults so old API versions
// (pre-spec-migration) don't break the web client. The output type is
// identical to Vehicle, so callers see no difference.
const VehicleResponseSchema = VehicleSchema.extend({
  seats: z.number().int().min(1).max(20).default(5),
  doors: z.number().int().min(2).max(8).default(4),
  trunkLiters: z.number().int().positive().nullable().default(null),
  maxPayloadKg: z.number().int().positive().nullable().default(null),
  transmissionType: z.enum(TRANSMISSION_TYPES).default("automatic"),
  fuelType: z.enum(FUEL_TYPES).default("gasoline"),
  category: z.enum(VEHICLE_CATEGORIES).default("compact"),
  airConditioned: z.boolean().default(true),
  airbags: z.number().int().min(0).nullable().default(null),
  licensePlate: z.string().max(20).nullable().default(null),
  color: z.string().max(50).nullable().default(null),
});

export const CreateVehicleSchema = VehicleSchema.omit({ id: true });

/** All fields from CreateVehicleSchema become optional; per-field constraints are preserved. */
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export const VehicleEnvelopeSchema = z.object({
  data: VehicleResponseSchema.array(),
});

/** Single-vehicle response envelope returned by GET /vehicles/:id, POST /vehicles, PATCH /vehicles/:id. */
export const VehicleSingleEnvelopeSchema = z.object({
  data: VehicleResponseSchema,
});

export const VehicleAvailabilityQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];
export type VehicleAvailabilityQuery = z.infer<
  typeof VehicleAvailabilityQuerySchema
>;
