const DEFAULT_VEHICLES_API_BASE_URL = "http://localhost:3001";

export const VEHICLES_PATH = "/vehicles";

export function resolveVehiclesApiBaseUrl(override?: string) {
  return (
    override ?? process.env.RENTAL_API_BASE_URL ?? DEFAULT_VEHICLES_API_BASE_URL
  );
}
