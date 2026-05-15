export interface CreateCheckoutInput {
  bookingId: string;
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: { object: unknown };
}

export interface PaymentGateway {
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutResult>;
  constructWebhookEvent(rawBody: Buffer, signature: string): WebhookEvent;
}
