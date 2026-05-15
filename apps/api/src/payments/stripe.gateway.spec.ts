import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCheckoutSessionsCreate = vi.fn();
const mockWebhooksConstructEvent = vi.fn();

vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockCheckoutSessionsCreate,
        },
      },
      webhooks: {
        constructEvent: mockWebhooksConstructEvent,
      },
    })),
  };
});

import { StripeGateway } from "./stripe.gateway";

describe("StripeGateway", () => {
  let gateway: StripeGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new StripeGateway("sk_test_fake", "whsec_fake");
  });

  describe("createCheckoutSession", () => {
    it("calls stripe.checkout.sessions.create and returns sessionId and checkoutUrl", async () => {
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/pay/cs_test_123",
      });

      const result = await gateway.createCheckoutSession({
        bookingId: "11111111-1111-1111-1111-111111111111",
        amountCents: 5000,
        currency: "usd",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        customerEmail: "test@example.com",
      });

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledOnce();
      expect(result).toEqual({
        sessionId: "cs_test_123",
        checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123",
      });
    });
  });

  describe("constructWebhookEvent", () => {
    it("delegates to stripe.webhooks.constructEvent and returns the event", () => {
      const fakeEvent = {
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } },
      };
      mockWebhooksConstructEvent.mockReturnValue(fakeEvent);

      const rawBody = Buffer.from('{"id":"evt_test_123"}');
      const result = gateway.constructWebhookEvent(rawBody, "sig_test");

      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        rawBody,
        "sig_test",
        "whsec_fake",
      );
      expect(result).toEqual(fakeEvent);
    });

    it("throws BadRequestException when signature is invalid", () => {
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error(
          "No signatures found matching the expected signature for payload",
        );
      });

      expect(() =>
        gateway.constructWebhookEvent(Buffer.from("{}"), "bad_sig"),
      ).toThrow(BadRequestException);
    });
  });
});
