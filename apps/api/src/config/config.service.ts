import { Injectable } from "@nestjs/common";
import type { PaymentsConfigResponse } from "@rental/validations";

import { getApiEnv } from "./env";

export interface BookingConfig {
  depositRateFrequent: number;
  depositRateNew: number;
}

@Injectable()
export class AppConfigService {
  getPaymentsConfig(): PaymentsConfigResponse {
    return { stripeEnabled: getApiEnv().STRIPE_ENABLED };
  }

  getBookingConfig(): BookingConfig {
    const env = getApiEnv();
    return {
      depositRateFrequent: env.DEPOSIT_RATE_FREQUENT,
      depositRateNew: env.DEPOSIT_RATE_NEW,
    };
  }
}
