const DEFAULT_RESERVATION_API_BASE_URL = "http://localhost:3001";

export const RESERVATION_AVAILABILITY_PATH = "/bookings/availability";

export function resolveReservationApiBaseUrl(override?: string) {
  return override ?? process.env.RENTAL_API_BASE_URL ?? DEFAULT_RESERVATION_API_BASE_URL;
}
