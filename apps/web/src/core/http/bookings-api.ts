const DEFAULT_BOOKINGS_API_BASE_URL = "http://localhost:3001";

export const BOOKINGS_PATH = "/bookings";

export function resolveBookingsApiBaseUrl(override?: string) {
  return (
    override ?? process.env.RENTAL_API_BASE_URL ?? DEFAULT_BOOKINGS_API_BASE_URL
  );
}
