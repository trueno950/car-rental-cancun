import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";

import type { CheckoutSessionResponse } from "@rental/validations";

import { AppConfigService } from "../config/config.service";
import type { PaymentGateway, WebhookEvent } from "./payment-gateway.interface";
import { PAYMENT_GATEWAY } from "./payment-gateway.token";
import { PaymentsRepository } from "./payments.repository";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(PaymentsRepository)
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    @Inject(AppConfigService)
    private readonly configService: AppConfigService,
  ) {}

  async createCheckoutSession(
    bookingId: string,
    requestingUserId: string,
  ): Promise<CheckoutSessionResponse> {
    const booking =
      await this.paymentsRepository.findBookingForCheckout(bookingId);

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== requestingUserId) {
      throw new ForbiddenException("You do not own this booking");
    }

    this.logger.log(
      `Creating Stripe checkout session for booking ${bookingId}`,
    );

    const result = await this.gateway.createCheckoutSession({
      bookingId,
      amount: booking.checkoutAmount,
      currency: "usd",
      successUrl: `${this.configService.getFrontendUrl()}/bookings/${bookingId}/confirmation`,
      cancelUrl: `${this.configService.getFrontendUrl()}/bookings/${bookingId}`,
    });

    await this.paymentsRepository.attachStripeSession(
      bookingId,
      result.sessionId,
    );

    return { checkoutUrl: result.checkoutUrl };
  }

  async processWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.gateway.constructWebhookEvent(rawBody, signature);
    await this.handleWebhookEvent(event);
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    const isNew = await this.paymentsRepository.recordEventIfNotExists(
      event.id,
      event.type,
    );

    if (!isNew) {
      this.logger.log(`Duplicate webhook event ${event.id} — skipping`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string;
          payment_intent?: string;
        };
        this.logger.log(
          `Handling checkout.session.completed for session ${session.id}`,
        );
        await this.paymentsRepository.confirmBookingBySession(
          session.id,
          session.payment_intent ?? null,
        );
        break;
      }
      default:
        this.logger.log(`Unhandled event type ${event.type} — no-op`);
    }
  }
}
