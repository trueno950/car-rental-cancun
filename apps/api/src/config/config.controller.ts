import { Controller, Get, Logger } from "@nestjs/common";
import type { PaymentsConfigResponse } from "@rental/validations";

import { Public } from "../auth/public.decorator";
import { AppConfigService } from "./config.service";

@Controller("config")
export class ConfigController {
  private readonly logger = new Logger(ConfigController.name);

  constructor(private readonly configService: AppConfigService) {}

  @Get("payments")
  @Public()
  getPaymentsConfig(): PaymentsConfigResponse {
    this.logger.log("GET /config/payments");
    return this.configService.getPaymentsConfig();
  }
}
