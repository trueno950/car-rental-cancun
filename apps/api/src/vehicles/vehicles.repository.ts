import { Inject, Injectable } from "@nestjs/common";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  Vehicle,
} from "@rental/validations";
import { BOOKING_STATUS } from "@rental/validations";
import { and, eq, gt, lt, notInArray, or } from "drizzle-orm";

import { DatabaseService } from "../database/database.service";
import { bookingsTable } from "../database/schema/bookings";
import { vehiclesTable } from "../database/schema/vehicles";

/**
 * Vehicles persistence boundary.
 *
 * MONEY CONVENTION (see AGENTS.md > NestJS Backend Architecture > Money Fields):
 *   - DB stores integer cents: `dailyRateCents`
 *   - API exposes decimal: `dailyRate = dailyRateCents / 100`
 *   - Conversion happens HERE and ONLY here. Services and controllers
 *     never see *Cents.
 */
@Injectable()
export class VehiclesRepository {
  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    const rows = await this.databaseService.db.select().from(vehiclesTable);
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Vehicle | null> {
    const [row] = await this.databaseService.db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findAvailable(startDate: Date, endDate: Date): Promise<Vehicle[]> {
    const bookedIds = this.databaseService.db
      .select({ vehicleId: bookingsTable.vehicleId })
      .from(bookingsTable)
      .where(
        and(
          or(
            eq(bookingsTable.status, BOOKING_STATUS.CONFIRMED),
            eq(bookingsTable.status, BOOKING_STATUS.ACTIVE),
          ),
          lt(bookingsTable.startDate, endDate),
          gt(bookingsTable.endDate, startDate),
        ),
      );

    const rows = await this.databaseService.db
      .select()
      .from(vehiclesTable)
      .where(
        and(
          eq(vehiclesTable.available, true),
          notInArray(vehiclesTable.id, bookedIds),
        ),
      );

    return rows.map((row) => this.toDomain(row));
  }

  async insert(input: CreateVehicleDto): Promise<Vehicle> {
    const [row] = await this.databaseService.db
      .insert(vehiclesTable)
      .values({
        make: input.make,
        model: input.model,
        year: input.year,
        dailyRateCents: Math.round(input.dailyRate * 100),
        available: input.available,
        seats: input.seats,
        doors: input.doors,
        trunkLiters: input.trunkLiters ?? null,
        maxPayloadKg: input.maxPayloadKg ?? null,
        transmissionType: input.transmissionType,
        fuelType: input.fuelType,
        category: input.category,
        airConditioned: input.airConditioned,
        airbags: input.airbags ?? null,
        licensePlate: input.licensePlate ?? null,
        color: input.color ?? null,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(id: string, input: UpdateVehicleDto): Promise<Vehicle> {
    const patch: Partial<typeof vehiclesTable.$inferInsert> = {};
    if (input.make !== undefined) patch.make = input.make;
    if (input.model !== undefined) patch.model = input.model;
    if (input.year !== undefined) patch.year = input.year;
    if (input.dailyRate !== undefined)
      patch.dailyRateCents = Math.round(input.dailyRate * 100);
    if (input.available !== undefined) patch.available = input.available;
    if (input.seats !== undefined) patch.seats = input.seats;
    if (input.doors !== undefined) patch.doors = input.doors;
    if (input.trunkLiters !== undefined) patch.trunkLiters = input.trunkLiters;
    if (input.maxPayloadKg !== undefined)
      patch.maxPayloadKg = input.maxPayloadKg;
    if (input.transmissionType !== undefined)
      patch.transmissionType = input.transmissionType;
    if (input.fuelType !== undefined) patch.fuelType = input.fuelType;
    if (input.category !== undefined) patch.category = input.category;
    if (input.airConditioned !== undefined)
      patch.airConditioned = input.airConditioned;
    if (input.airbags !== undefined) patch.airbags = input.airbags;
    if (input.licensePlate !== undefined) patch.licensePlate = input.licensePlate;
    if (input.color !== undefined) patch.color = input.color;
    patch.updatedAt = new Date();

    const [row] = await this.databaseService.db
      .update(vehiclesTable)
      .set(patch)
      .where(eq(vehiclesTable.id, id))
      .returning();
    return this.toDomain(row!);
  }

  async delete(id: string): Promise<void> {
    await this.databaseService.db
      .delete(vehiclesTable)
      .where(eq(vehiclesTable.id, id));
  }

  private toDomain(row: typeof vehiclesTable.$inferSelect): Vehicle {
    return {
      id: row.id,
      make: row.make,
      model: row.model,
      year: row.year,
      dailyRate: row.dailyRateCents / 100,
      available: row.available,
      seats: row.seats,
      doors: row.doors,
      trunkLiters: row.trunkLiters,
      maxPayloadKg: row.maxPayloadKg,
      transmissionType: row.transmissionType as Vehicle["transmissionType"],
      fuelType: row.fuelType as Vehicle["fuelType"],
      category: row.category as Vehicle["category"],
      airConditioned: row.airConditioned,
      airbags: row.airbags,
      licensePlate: row.licensePlate ?? null,
      color: row.color ?? null,
    };
  }
}
