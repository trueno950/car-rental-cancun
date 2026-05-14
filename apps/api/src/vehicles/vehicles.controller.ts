import { Controller, Get, Logger } from "@nestjs/common";

import { Public } from "../auth/public.decorator";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  async listVehicles() {
    return this.vehiclesService.findAll();
  }
}
