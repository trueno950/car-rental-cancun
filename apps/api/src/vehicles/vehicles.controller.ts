import { Controller, Get, Inject, Logger, Query } from "@nestjs/common";
import { VehicleAvailabilityQuerySchema } from "@rental/validations";
import type { Vehicle, VehicleAvailabilityQuery } from "@rental/validations";

import { Public } from "../auth/public.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(
    @Inject(VehiclesService)
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Public()
  @Get()
  async listVehicles(): Promise<Vehicle[]> {
    return this.vehiclesService.findAll();
  }

  @Public()
  @Get("available")
  async getAvailableVehicles(
    @Query(new ZodValidationPipe(VehicleAvailabilityQuerySchema))
    query: VehicleAvailabilityQuery,
  ): Promise<Vehicle[]> {
    this.logger.log(`GET /vehicles/available startDate=${query.startDate}`);
    return this.vehiclesService.getAvailableVehicles(
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }
}
