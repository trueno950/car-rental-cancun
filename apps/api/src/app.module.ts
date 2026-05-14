import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { VehiclesModule } from "./vehicles/vehicles.module";

@Module({
  imports: [DatabaseModule, AuthModule, VehiclesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
