import { Injectable } from "@nestjs/common";
import type { PaymentsConfigResponse } from "@rental/validations";

import { getApiEnv } from "./env";

@Injectable()
export class AppConfigService {
  getPaymentsConfig(): PaymentsConfigResponse {
    return { stripeEnabled: getApiEnv().STRIPE_ENABLED };
  }
}
