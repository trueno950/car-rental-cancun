import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { VehiclesController } from "./vehicles.controller";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AppController, VehiclesController],
  providers: [AppService],
})
export class AppModule {}
