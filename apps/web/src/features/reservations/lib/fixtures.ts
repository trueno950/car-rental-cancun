import { ReservationAvailabilityResponseSchema, type ReservationBlockedDate } from "@rental/validations";

const reservationBlockedDates = ["2026-07-12", "2026-07-13", "2026-07-19", "2026-07-22"] as const;

ReservationAvailabilityResponseSchema.pick({ blockedDates: true }).parse({
  blockedDates: reservationBlockedDates,
});

export const RESERVATION_BLOCKED_DATES: readonly ReservationBlockedDate[] = reservationBlockedDates;
