import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  VehicleAvailabilityQuerySchema,
} from "@rental/validations";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  Vehicle,
  VehicleAvailabilityQuery,
} from "@rental/validations";

import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
@UseGuards(RolesGuard)
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

  @Get(":id")
  @Roles("manager", "admin")
  async getById(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<Vehicle> {
    return this.vehiclesService.findByIdOrThrow(id);
  }

  @Post()
  @Roles("manager", "admin")
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(CreateVehicleSchema)) body: CreateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.create(body);
  }

  @Patch(":id")
  @Roles("manager", "admin")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateVehicleSchema)) body: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.update(id, body);
  }

  @Delete(":id")
  @Roles("manager", "admin")
  @HttpCode(204)
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.vehiclesService.remove(id);
  }
}
