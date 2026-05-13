import { z } from "zod";

const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

const MAX_RESERVATION_NIGHTS = 30;
const bookingDateRangeIssue = "returnDate must be after pickupDate";
const bookingMaxRangeIssue = `Reservations cannot exceed ${MAX_RESERVATION_NIGHTS} nights`;

const isoDateTimeSchema = z.string().datetime();
const timezoneSchema = z.string().trim().min(1, { error: "timezone is required" });
const pickupLocationSchema = z.string().trim().min(2, { error: "pickupLocation is required" }).max(120);
const blockedDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "blocked date must use YYYY-MM-DD",
});

const bookingFields = {
  id: z.string().uuid(),
  userId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  startDate: isoDateTimeSchema,
  endDate: isoDateTimeSchema,
  totalPrice: z.number().positive(),
  status: z.enum([BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED]),
} as const;

function getRangeNights(startDate: Date, endDate: Date) {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

function addDateRangeIssues(
  values: { pickupDate: Date | string; returnDate: Date | string },
  ctx: z.RefinementCtx,
  fieldNames: { pickupDate: string; returnDate: string },
) {
  const pickupDate = values.pickupDate instanceof Date ? values.pickupDate : new Date(values.pickupDate);
  const returnDate = values.returnDate instanceof Date ? values.returnDate : new Date(values.returnDate);

  if (Number.isNaN(pickupDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.pickupDate],
      message: "pickupDate must be a valid date",
    });
  }

  if (Number.isNaN(returnDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.returnDate],
      message: "returnDate must be a valid date",
    });
  }

  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
    return;
  }

  if (pickupDate >= returnDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.returnDate],
      message: bookingDateRangeIssue,
    });
    return;
  }

  if (getRangeNights(pickupDate, returnDate) > MAX_RESERVATION_NIGHTS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.returnDate],
      message: bookingMaxRangeIssue,
    });
  }
}

const bookingDateOrder = <T extends { startDate: string; endDate: string }>(schema: z.ZodType<T>) =>
  schema.superRefine(({ startDate, endDate }, ctx) => {
    addDateRangeIssues(
      {
        pickupDate: startDate,
        returnDate: endDate,
      },
      ctx,
      {
        pickupDate: "startDate",
        returnDate: "endDate",
      },
    );
  });

export const BookingStatusSchema = bookingFields.status;

export const BookingSchema = bookingDateOrder(z.object(bookingFields));

export const CreateBookingSchema = bookingDateOrder(
  z.object({
    userId: bookingFields.userId,
    vehicleId: bookingFields.vehicleId,
    startDate: bookingFields.startDate,
    endDate: bookingFields.endDate,
    totalPrice: bookingFields.totalPrice,
    status: BookingStatusSchema.default(BOOKING_STATUS.PENDING),
  }),
);

export const ReservationCalendarRangeSchema = z
  .object({
    from: z.date({ error: "pickupDate is required" }),
    to: z.date({ error: "returnDate is required" }),
  })
  .superRefine((value, ctx) => {
    addDateRangeIssues(
      {
        pickupDate: value.from,
        returnDate: value.to,
      },
      ctx,
      {
        pickupDate: "from",
        returnDate: "to",
      },
    );
  });

export const ReservationRequestFormSchema = z.object({
  pickupLocation: pickupLocationSchema,
  timezone: timezoneSchema,
  dateRange: ReservationCalendarRangeSchema,
});

export const ReservationAvailabilityRequestSchema = z
  .object({
    pickupLocation: pickupLocationSchema,
    timezone: timezoneSchema,
    pickupDate: isoDateTimeSchema,
    returnDate: isoDateTimeSchema,
  })
  .superRefine((value, ctx) => {
    addDateRangeIssues(value, ctx, {
      pickupDate: "pickupDate",
      returnDate: "returnDate",
    });
  });

export const ReservationAvailabilityResponseSchema = z.object({
  available: z.boolean(),
  blockedDates: z.array(blockedDateSchema).default([]),
  nights: z.number().int().nonnegative(),
  timezone: timezoneSchema,
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type ReservationAvailabilityRequest = z.infer<typeof ReservationAvailabilityRequestSchema>;
export type ReservationAvailabilityResponse = z.infer<typeof ReservationAvailabilityResponseSchema>;
export type ReservationBlockedDate = z.infer<typeof blockedDateSchema>;
export type ReservationCalendarRange = z.infer<typeof ReservationCalendarRangeSchema>;
export type ReservationRequestFormValues = z.infer<typeof ReservationRequestFormSchema>;
