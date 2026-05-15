import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { BOOKING_STATUS } from "@rental/validations";

import { DatabaseService } from "../database/database.service";
import { bookingsTable } from "../database/schema/bookings";
import { stripeWebhookEventsTable } from "../database/schema/stripe-webhook-events";

export interface BookingForCheckout {
  id: string;
  userId: string;
  /** Decimal amount to charge (deposit if set, otherwise full price) */
  checkoutAmount: number;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async recordEventIfNotExists(
    stripeEventId: string,
    eventType: string,
  ): Promise<boolean> {
    const result = await this.databaseService.db
      .insert(stripeWebhookEventsTable)
      .values({ stripeEventId, eventType })
      .onConflictDoNothing({ target: stripeWebhookEventsTable.stripeEventId })
      .returning({ id: stripeWebhookEventsTable.id });

    return result.length > 0;
  }

  async confirmBookingBySession(
    stripeCheckoutSessionId: string,
    stripePaymentIntentId: string | null,
  ): Promise<void> {
    await this.databaseService.db
      .update(bookingsTable)
      .set({
        status: BOOKING_STATUS.CONFIRMED,
        stripePaymentIntentId: stripePaymentIntentId ?? undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookingsTable.stripeCheckoutSessionId, stripeCheckoutSessionId),
          eq(bookingsTable.status, BOOKING_STATUS.PENDING),
        ),
      );
  }

  async findBookingForCheckout(id: string): Promise<BookingForCheckout | null> {
    const rows = await this.databaseService.db
      .select({
        id: bookingsTable.id,
        userId: bookingsTable.userId,
        depositAmountCents: bookingsTable.depositAmountCents,
        totalPriceCents: bookingsTable.totalPriceCents,
      })
      .from(bookingsTable)
      .where(eq(bookingsTable.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const raw = rows[0];
    const checkoutAmount =
      (raw.depositAmountCents ?? raw.totalPriceCents) / 100;

    return { id: raw.id, userId: raw.userId, checkoutAmount };
  }

  async attachStripeSession(
    bookingId: string,
    stripeCheckoutSessionId: string,
  ): Promise<void> {
    await this.databaseService.db
      .update(bookingsTable)
      .set({ stripeCheckoutSessionId, updatedAt: new Date() })
      .where(eq(bookingsTable.id, bookingId));
  }
}
