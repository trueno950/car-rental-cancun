import { ServiceUnavailableException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { NullGateway } from "./null.gateway";

describe("NullGateway", () => {
  const gateway = new NullGateway();

  it("createCheckoutSession throws ServiceUnavailableException", async () => {
    await expect(
      gateway.createCheckoutSession({
        bookingId: "11111111-1111-1111-1111-111111111111",
        amountCents: 5000,
        currency: "usd",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it("constructWebhookEvent throws ServiceUnavailableException", () => {
    expect(() =>
      gateway.constructWebhookEvent(Buffer.from("{}"), "sig"),
    ).toThrow(ServiceUnavailableException);
  });
});
