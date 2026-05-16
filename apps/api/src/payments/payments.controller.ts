import {
  BadRequestException,
  Controller,
  Headers,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import type { ApiUser, CheckoutSessionResponse } from "@rental/validations";

import { CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import { PaymentsService } from "./payments.service";

@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @Inject(PaymentsService)
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post("bookings/:id/checkout-session")
  async createCheckoutSession(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: ApiUser,
  ): Promise<CheckoutSessionResponse> {
    this.logger.log(`POST /bookings/${id}/checkout-session user=${user.id}`);
    return this.paymentsService.createCheckoutSession(id, user.id);
  }

  @Post("payments/webhooks/stripe")
  @Public()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") sig: string,
  ): Promise<{ received: boolean }> {
    if (!req.rawBody) {
      throw new BadRequestException(
        "Missing raw body for webhook verification",
      );
    }

    this.logger.log("POST /payments/webhooks/stripe");
    await this.paymentsService.processWebhook(req.rawBody, sig);

    return { received: true };
  }
}
