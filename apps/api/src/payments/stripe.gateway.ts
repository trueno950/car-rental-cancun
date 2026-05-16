import { BadRequestException } from "@nestjs/common";
// eslint-disable-next-line import/no-named-as-default
import Stripe from "stripe";

import type {
  CheckoutResult,
  CreateCheckoutInput,
  PaymentGateway,
  WebhookEvent,
} from "./payment-gateway.interface";

export class StripeGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(
    private readonly secretKey: string,
    private readonly webhookSecret: string,
  ) {
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(
    input: CreateCheckoutInput,
  ): Promise<CheckoutResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: input.currency,
            unit_amount: Math.round(input.amount * 100),
            product_data: {
              name: `Booking deposit — ${input.bookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      ...(input.customerEmail !== undefined && {
        customer_email: input.customerEmail,
      }),
      metadata: { bookingId: input.bookingId },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
    };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): WebhookEvent {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
      return event as unknown as WebhookEvent;
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }
  }
}
