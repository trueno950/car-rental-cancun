import { Module } from "@nestjs/common";

import { getApiEnv } from "../config/env";
import { NullGateway } from "./null.gateway";
import { PAYMENT_GATEWAY } from "./payment-gateway.token";
import { PaymentsController } from "./payments.controller";
import { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";
import { StripeGateway } from "./stripe.gateway";

@Module({
  providers: [
    PaymentsRepository,
    PaymentsService,
    {
      provide: PAYMENT_GATEWAY,
      useFactory: () => {
        const env = getApiEnv();
        if (env.STRIPE_ENABLED) {
          return new StripeGateway(
            env.STRIPE_SECRET_KEY!,
            env.STRIPE_WEBHOOK_SECRET!,
          );
        }
        return new NullGateway();
      },
    },
  ],
  controllers: [PaymentsController],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentsModule {}
