import { z } from "zod";

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2000),
  dailyRate: z.number().positive(),
  available: z.boolean(),
});

export const CreateVehicleSchema = VehicleSchema.omit({ id: true });

/** All fields from CreateVehicleSchema become optional; per-field constraints are preserved. */
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export const VehicleEnvelopeSchema = z.object({
  data: VehicleSchema.array(),
});

/** Single-vehicle response envelope returned by GET /vehicles/:id, POST /vehicles, PATCH /vehicles/:id. */
export const VehicleSingleEnvelopeSchema = z.object({
  data: VehicleSchema,
});

export const VehicleAvailabilityQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;
export type VehicleAvailabilityQuery = z.infer<
  typeof VehicleAvailabilityQuerySchema
>;
