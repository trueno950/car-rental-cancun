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

export const VehicleEnvelopeSchema = z.object({
  data: VehicleSchema.array(),
});

export const VehicleAvailabilityQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type VehicleAvailabilityQuery = z.infer<
  typeof VehicleAvailabilityQuerySchema
>;
