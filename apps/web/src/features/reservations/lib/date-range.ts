import { differenceInCalendarDays, format, isSameDay, parseISO, startOfDay } from "date-fns";

import {
  ReservationAvailabilityRequestSchema,
  type ReservationAvailabilityRequest,
  type ReservationBlockedDate,
  type ReservationCalendarRange,
  type ReservationRequestFormValues,
} from "@rental/validations";

const RESERVATION_DATE_LABEL_FORMAT = "MMM d, yyyy";

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function mapBlockedDates(blockedDates: readonly ReservationBlockedDate[]) {
  return blockedDates.map((blockedDate) => startOfDay(parseISO(blockedDate)));
}

export function getReservationNights(dateRange?: ReservationCalendarRange) {
  if (!dateRange) {
    return 0;
  }

  return Math.max(differenceInCalendarDays(startOfDay(dateRange.to), startOfDay(dateRange.from)), 0);
}

export function formatReservationDateRange(dateRange?: { from?: Date | undefined; to?: Date | undefined }) {
  if (!dateRange?.from) {
    return "Select pickup and return dates";
  }

  if (!dateRange.to) {
    return format(dateRange.from, RESERVATION_DATE_LABEL_FORMAT);
  }

  return `${format(dateRange.from, RESERVATION_DATE_LABEL_FORMAT)} → ${format(dateRange.to, RESERVATION_DATE_LABEL_FORMAT)}`;
}

export function isBlockedDate(date: Date, blockedDates: readonly Date[]) {
  return blockedDates.some((blockedDate) => isSameDay(blockedDate, date));
}

export function createReservationAvailabilityPayload(
  values: ReservationRequestFormValues,
): ReservationAvailabilityRequest {
  return ReservationAvailabilityRequestSchema.parse({
    pickupLocation: values.pickupLocation,
    timezone: values.timezone,
    pickupDate: values.dateRange.from.toISOString(),
    returnDate: values.dateRange.to.toISOString(),
  });
}
