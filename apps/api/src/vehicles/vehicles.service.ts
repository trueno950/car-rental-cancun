import { Injectable, Logger } from "@nestjs/common";
import type { Vehicle } from "@rental/validations";

import { VehiclesRepository } from "./vehicles.repository";

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  async findAll(): Promise<Vehicle[]> {
    this.logger.log("Listing vehicles");
    return this.vehiclesRepository.findAll();
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehiclesRepository.findById(id);
  }

  async getAvailableVehicles(
    startDate: Date,
    endDate: Date,
  ): Promise<Vehicle[]> {
    return this.vehiclesRepository.findAvailable(startDate, endDate);
  }
}
