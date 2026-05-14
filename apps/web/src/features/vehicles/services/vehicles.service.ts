import { VehicleEnvelopeSchema, type Vehicle } from "@rental/validations";

import { VEHICLES_PATH, resolveVehiclesApiBaseUrl } from "@core/http";

interface VehiclesApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

export async function fetchVehicles(
  options: VehiclesApiClientOptions = {},
): Promise<Vehicle[]> {
  const apiBaseUrl = resolveVehiclesApiBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(new URL(VEHICLES_PATH, apiBaseUrl), {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Vehicle catalog proxy failed with status ${response.status}`,
    );
  }

  const envelope = VehicleEnvelopeSchema.parse(await response.json());
  return envelope.data;
}
