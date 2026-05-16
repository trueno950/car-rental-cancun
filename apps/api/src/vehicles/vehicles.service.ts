import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  Vehicle,
} from "@rental/validations";

import { VehiclesRepository } from "./vehicles.repository";

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @Inject(VehiclesRepository)
    private readonly vehiclesRepository: VehiclesRepository,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    this.logger.log("Listing vehicles");
    return this.vehiclesRepository.findAll();
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehiclesRepository.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehiclesRepository.insert(dto);
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.vehiclesRepository.findById(id);
    if (!existing) throw new NotFoundException(`Vehicle ${id} not found`);
    return this.vehiclesRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.vehiclesRepository.findById(id);
    if (!existing) throw new NotFoundException(`Vehicle ${id} not found`);
    try {
      await this.vehiclesRepository.delete(id);
    } catch (err: unknown) {
      // Drizzle surfaces the raw pg DatabaseError which carries the Postgres error code.
      // Walk up to cause if necessary (some drivers wrap the error).
      const code = this.extractPgCode(err);

      if (code === "23503") {
        throw new ConflictException(
          "Vehicle has existing bookings; set available=false instead",
        );
      }
      throw err;
    }
  }

  async getAvailableVehicles(
    startDate: Date,
    endDate: Date,
  ): Promise<Vehicle[]> {
    return this.vehiclesRepository.findAvailable(startDate, endDate);
  }

  private extractPgCode(err: unknown): string | undefined {
    if (typeof err !== "object" || err === null) return undefined;
    // Direct pg error: has .code
    if ("code" in err && typeof (err as { code: unknown }).code === "string") {
      return (err as { code: string }).code;
    }
    // Wrapped error with .cause
    if ("cause" in err) {
      return this.extractPgCode((err as { cause: unknown }).cause);
    }
    return undefined;
  }
}
