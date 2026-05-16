import { VehicleEnvelopeSchema, type Vehicle } from "@rental/validations";
import type { CreateVehicleDto, UpdateVehicleDto } from "@rental/validations";

import {
  VEHICLES_PATH,
  resolveVehiclesApiBaseUrl,
  fetchVehicleById,
  createVehicleRequest,
  updateVehicleRequest,
  deleteVehicleRequest,
} from "@core/http";

interface VehiclesApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface VehiclesAdminClientOptions extends VehiclesApiClientOptions {
  token: string;
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

export async function adminFetchVehicleById(
  id: string,
  opts: VehiclesAdminClientOptions,
): Promise<Vehicle> {
  return fetchVehicleById(id, opts);
}

export async function adminCreateVehicle(
  input: CreateVehicleDto,
  opts: VehiclesAdminClientOptions,
): Promise<Vehicle> {
  return createVehicleRequest(input, opts);
}

export async function adminUpdateVehicle(
  id: string,
  input: UpdateVehicleDto,
  opts: VehiclesAdminClientOptions,
): Promise<Vehicle> {
  return updateVehicleRequest(id, input, opts);
}

export async function adminDeleteVehicle(
  id: string,
  opts: VehiclesAdminClientOptions,
): Promise<void> {
  return deleteVehicleRequest(id, opts);
}
