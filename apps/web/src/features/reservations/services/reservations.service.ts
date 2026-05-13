import {
  ReservationAvailabilityRequestSchema,
  ReservationAvailabilityResponseSchema,
  type ReservationAvailabilityRequest,
  type ReservationAvailabilityResponse,
} from "@rental/validations";

import { RESERVATION_AVAILABILITY_PATH, resolveReservationApiBaseUrl } from "@core/http";

interface ReservationApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

function adaptReservationAvailabilityResponse(input: unknown): ReservationAvailabilityResponse {
  return ReservationAvailabilityResponseSchema.parse(input);
}

export async function submitReservationAvailability(
  input: ReservationAvailabilityRequest,
  options: ReservationApiClientOptions = {},
): Promise<ReservationAvailabilityResponse> {
  const payload = ReservationAvailabilityRequestSchema.parse(input);
  const apiBaseUrl = resolveReservationApiBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(new URL(RESERVATION_AVAILABILITY_PATH, apiBaseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Reservation availability proxy failed with status ${response.status}`);
  }

  return adaptReservationAvailabilityResponse(await response.json());
}
