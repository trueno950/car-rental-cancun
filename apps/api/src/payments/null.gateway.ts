import { ServiceUnavailableException } from "@nestjs/common";

import type {
  CheckoutResult,
  CreateCheckoutInput,
  PaymentGateway,
  WebhookEvent,
} from "./payment-gateway.interface";

export class NullGateway implements PaymentGateway {
  async createCheckoutSession(
    _input: CreateCheckoutInput,
  ): Promise<CheckoutResult> {
    throw new ServiceUnavailableException("Payment gateway disabled");
  }

  constructWebhookEvent(_rawBody: Buffer, _signature: string): WebhookEvent {
    throw new ServiceUnavailableException("Payment gateway disabled");
  }
}
