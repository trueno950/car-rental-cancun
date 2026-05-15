import { Injectable } from "@nestjs/common";
import { and, count, eq, gt, lt, or } from "drizzle-orm";
import type { BookingResponse } from "@rental/validations";
import { BOOKING_STATUS } from "@rental/validations";

import { DatabaseService } from "../database/database.service";
import { bookingsTable } from "../database/schema/bookings";
import { vehiclesTable } from "../database/schema/vehicles";

type BookingRow = typeof bookingsTable.$inferSelect;

export interface CreateBookingInput {
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  depositRate: number;
  notes?: string | undefined;
}

@Injectable()
export class BookingsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createWithAvailabilityCheck(
    input: CreateBookingInput,
  ): Promise<BookingResponse | "vehicle_not_found" | "conflict"> {
    return this.databaseService.db.transaction(async (tx) => {
      const vehicle = await tx
        .select({ dailyRateCents: vehiclesTable.dailyRateCents })
        .from(vehiclesTable)
        .where(eq(vehiclesTable.id, input.vehicleId))
        .limit(1);

      if (!vehicle[0]) return "vehicle_not_found";

      const durationDays = Math.ceil(
        (input.endDate.getTime() - input.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const totalPriceCents = vehicle[0].dailyRateCents * durationDays;
      const depositAmountCents = Math.round(
        totalPriceCents * input.depositRate,
      );

      const overlapping = await tx
        .select({ id: bookingsTable.id })
        .from(bookingsTable)
        .where(
          and(
            eq(bookingsTable.vehicleId, input.vehicleId),
            or(
              eq(bookingsTable.status, BOOKING_STATUS.CONFIRMED),
              eq(bookingsTable.status, BOOKING_STATUS.ACTIVE),
            ),
            lt(bookingsTable.startDate, input.endDate),
            gt(bookingsTable.endDate, input.startDate),
          ),
        )
        .for("update");

      if (overlapping.length > 0) return "conflict";

      const rows = await tx
        .insert(bookingsTable)
        .values({
          userId: input.userId,
          vehicleId: input.vehicleId,
          startDate: input.startDate,
          endDate: input.endDate,
          totalPriceCents,
          depositAmountCents,
          notes: input.notes,
          status: BOOKING_STATUS.PENDING,
        })
        .returning();

      return this.toDomain(rows[0]!);
    });
  }

  async findAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const rows = await this.databaseService.db
      .select({ count: count() })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.vehicleId, vehicleId),
          or(
            eq(bookingsTable.status, BOOKING_STATUS.CONFIRMED),
            eq(bookingsTable.status, BOOKING_STATUS.ACTIVE),
          ),
          lt(bookingsTable.startDate, endDate),
          gt(bookingsTable.endDate, startDate),
        ),
      );

    return (rows[0]?.count ?? 0) === 0;
  }

  async findByCustomer(userId: string): Promise<BookingResponse[]> {
    const rows = await this.databaseService.db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.userId, userId));

    return rows.map((row) => this.toDomain(row));
  }

  async findAll(): Promise<BookingResponse[]> {
    const rows = await this.databaseService.db.select().from(bookingsTable);
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<BookingResponse | null> {
    const rows = await this.databaseService.db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, id));

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async updateStatus(
    id: string,
    status: BookingRow["status"],
  ): Promise<BookingResponse> {
    const rows = await this.databaseService.db
      .update(bookingsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookingsTable.id, id))
      .returning();

    return this.toDomain(rows[0]!);
  }

  toDomain(row: BookingRow): BookingResponse {
    return {
      id: row.id,
      vehicleId: row.vehicleId,
      userId: row.userId,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate.toISOString(),
      status: row.status,
      totalPrice: row.totalPriceCents / 100,
      depositAmount:
        row.depositAmountCents != null
          ? row.depositAmountCents / 100
          : undefined,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
