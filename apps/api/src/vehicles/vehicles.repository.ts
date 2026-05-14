import { Injectable } from "@nestjs/common";
import type { Vehicle } from "@rental/validations";

import { DatabaseService } from "../database/database.service";
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
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Vehicle[]> {
    const rows = await this.databaseService.db.select().from(vehiclesTable);
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: typeof vehiclesTable.$inferSelect): Vehicle {
    return {
      id: row.id,
      make: row.make,
      model: row.model,
      year: row.year,
      dailyRate: row.dailyRateCents / 100,
      available: row.available,
    };
  }
}
