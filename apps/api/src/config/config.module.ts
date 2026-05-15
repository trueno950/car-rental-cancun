import { Module } from "@nestjs/common";

import { ConfigController } from "./config.controller";
import { AppConfigService } from "./config.service";

@Module({
  controllers: [ConfigController],
  providers: [AppConfigService],
})
export class AppConfigModule {}
