import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { AppConfigService } from "../config/config.service";
import type { PaymentGateway } from "./payment-gateway.interface";
import type { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";

const BOOKING_ID = "aaaa0000-0000-0000-0000-000000000001";
const USER_ID = "11111111-1111-1111-1111-111111111111";

function makeRepo(
  overrides: Partial<PaymentsRepository> = {},
): PaymentsRepository {
  return {
    recordEventIfNotExists: vi.fn().mockResolvedValue(true),
    confirmBookingBySession: vi.fn().mockResolvedValue(undefined),
    findBookingForCheckout: vi.fn().mockResolvedValue({
      id: BOOKING_ID,
      userId: USER_ID,
      checkoutAmount: 20,
    }),
    attachStripeSession: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as PaymentsRepository;
}

function makeConfig(): AppConfigService {
  return {
    getPaymentsConfig: vi.fn().mockReturnValue({ stripeEnabled: false }),
    getBookingConfig: vi
      .fn()
      .mockReturnValue({ depositRateFrequent: 0.2, depositRateNew: 0.3 }),
    getFrontendUrl: vi.fn().mockReturnValue("http://localhost:3000"),
  } as unknown as AppConfigService;
}

function makeGateway(overrides: Partial<PaymentGateway> = {}): PaymentGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: "cs_test_123",
      checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123",
    }),
    constructWebhookEvent: vi.fn(),
    ...overrides,
  } as unknown as PaymentGateway;
}

describe("PaymentsService", () => {
  describe("createCheckoutSession()", () => {
    it("creates Stripe session and attaches it to booking", async () => {
      const repo = makeRepo();
      const gateway = makeGateway();
      const service = new PaymentsService(repo, gateway, makeConfig());

      const result = await service.createCheckoutSession(BOOKING_ID, USER_ID);

      expect(gateway.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ bookingId: BOOKING_ID, amount: 20 }),
      );
      expect(repo.attachStripeSession).toHaveBeenCalledWith(
        BOOKING_ID,
        "cs_test_123",
      );
      expect(result.checkoutUrl).toBe(
        "https://checkout.stripe.com/pay/cs_test_123",
      );
    });

    it("throws NotFoundException when booking does not exist", async () => {
      const repo = makeRepo({
        findBookingForCheckout: vi.fn().mockResolvedValue(null),
      });
      const service = new PaymentsService(repo, makeGateway(), makeConfig());

      await expect(
        service.createCheckoutSession(BOOKING_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when requesting user is not the owner", async () => {
      const service = new PaymentsService(
        makeRepo(),
        makeGateway(),
        makeConfig(),
      );

      await expect(
        service.createCheckoutSession(BOOKING_ID, "other-user-id"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("passes checkoutAmount from repository to gateway", async () => {
      const repo = makeRepo({
        findBookingForCheckout: vi.fn().mockResolvedValue({
          id: BOOKING_ID,
          userId: USER_ID,
          checkoutAmount: 100,
        }),
      });
      const gateway = makeGateway();
      const service = new PaymentsService(repo, gateway, makeConfig());

      await service.createCheckoutSession(BOOKING_ID, USER_ID);

      expect(gateway.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100 }),
      );
    });
  });

  describe("handleWebhookEvent()", () => {
    it("returns early when event is a duplicate", async () => {
      const repo = makeRepo({
        recordEventIfNotExists: vi.fn().mockResolvedValue(false),
      });
      const service = new PaymentsService(repo, makeGateway(), makeConfig());

      await service.handleWebhookEvent({
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_123" } },
      });

      expect(repo.confirmBookingBySession).not.toHaveBeenCalled();
    });

    it("confirms booking for checkout.session.completed", async () => {
      const repo = makeRepo();
      const service = new PaymentsService(repo, makeGateway(), makeConfig());

      await service.handleWebhookEvent({
        id: "evt_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_abc", payment_intent: "pi_abc" } },
      });

      expect(repo.confirmBookingBySession).toHaveBeenCalledWith(
        "cs_abc",
        "pi_abc",
      );
    });

    it("no-op for unrecognized event type", async () => {
      const repo = makeRepo();
      const service = new PaymentsService(repo, makeGateway(), makeConfig());

      await expect(
        service.handleWebhookEvent({
          id: "evt_123",
          type: "payment_intent.created",
          data: { object: {} },
        }),
      ).resolves.not.toThrow();

      expect(repo.confirmBookingBySession).not.toHaveBeenCalled();
    });
  });
});
