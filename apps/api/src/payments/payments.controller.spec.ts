import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

function makeService(
  overrides: Partial<PaymentsService> = {},
): PaymentsService {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123",
    }),
    handleWebhookEvent: vi.fn().mockResolvedValue(undefined),
    processWebhook: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as PaymentsService;
}

const user = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@x.com",
  name: "User",
  role: "customer" as const,
};

describe("PaymentsController", () => {
  describe("POST /bookings/:id/checkout-session", () => {
    it("delegates to service.createCheckoutSession", async () => {
      const service = makeService();
      const controller = new PaymentsController(service);

      const result = await controller.createCheckoutSession("booking-id", user);

      expect(service.createCheckoutSession).toHaveBeenCalledWith(
        "booking-id",
        user.id,
      );
      expect(result.checkoutUrl).toBe(
        "https://checkout.stripe.com/pay/cs_test_123",
      );
    });
  });

  describe("POST /payments/webhooks/stripe", () => {
    it("throws BadRequestException when rawBody is missing", async () => {
      const controller = new PaymentsController(makeService());

      await expect(
        controller.handleStripeWebhook({ rawBody: undefined } as never, "sig"),
      ).rejects.toThrow(BadRequestException);
    });

    it("delegates to service.processWebhook with rawBody and signature", async () => {
      const service = makeService();
      const controller = new PaymentsController(service);
      const rawBody = Buffer.from("{}");

      await controller.handleStripeWebhook({ rawBody } as never, "stripe-sig");

      expect(service.processWebhook).toHaveBeenCalledWith(
        rawBody,
        "stripe-sig",
      );
    });

    it("returns { received: true } after valid event", async () => {
      const controller = new PaymentsController(makeService());
      const result = await controller.handleStripeWebhook(
        { rawBody: Buffer.from("{}") } as never,
        "sig",
      );

      expect(result).toEqual({ received: true });
    });
  });
});
