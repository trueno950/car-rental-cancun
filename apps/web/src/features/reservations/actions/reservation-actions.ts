"use server";

import {
  ReservationAvailabilityRequestSchema,
  type ReservationAvailabilityRequest,
} from "@rental/validations";

import { submitReservationAvailability } from "../services/reservations.service";

export async function submitReservationAvailabilityAction(input: ReservationAvailabilityRequest) {
  const payload = ReservationAvailabilityRequestSchema.parse(input);

  return submitReservationAvailability(payload);
}
