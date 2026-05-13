import { z } from "zod";

export const invalidInlineSchemaBoundary = z.object({
  pickupLocation: z.string().min(1),
});
