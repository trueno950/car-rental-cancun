import { z } from "zod";

export const PaymentsConfigResponseSchema = z.object({
  stripeEnabled: z.boolean(),
});

export const CheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});

export const CheckoutSessionEnvelopeSchema = z.object({
  data: CheckoutSessionResponseSchema,
});

export type PaymentsConfigResponse = z.infer<
  typeof PaymentsConfigResponseSchema
>;
export type CheckoutSessionResponse = z.infer<
  typeof CheckoutSessionResponseSchema
>;
