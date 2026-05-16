import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  VehicleSingleEnvelopeSchema,
} from "@rental/validations";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  Vehicle,
} from "@rental/validations";

const DEFAULT_VEHICLES_API_BASE_URL = "http://localhost:3001";

export const VEHICLES_PATH = "/vehicles";

export function resolveVehiclesApiBaseUrl(override?: string) {
  return (
    override ?? process.env.RENTAL_API_BASE_URL ?? DEFAULT_VEHICLES_API_BASE_URL
  );
}

export function vehicleByIdPath(id: string) {
  return `${VEHICLES_PATH}/${id}`;
}

interface VehiclesAdminApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  token: string;
}

async function apiFetch(
  path: string,
  options: VehiclesAdminApiClientOptions & { method?: string; body?: unknown },
): Promise<unknown> {
  const apiBaseUrl = resolveVehiclesApiBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(new URL(path, apiBaseUrl), {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.token}`,
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Vehicles API request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export async function fetchVehicleById(
  id: string,
  options: VehiclesAdminApiClientOptions,
): Promise<Vehicle> {
  const raw = await apiFetch(vehicleByIdPath(id), options);
  return VehicleSingleEnvelopeSchema.parse(raw).data;
}

export async function createVehicleRequest(
  input: CreateVehicleDto,
  options: VehiclesAdminApiClientOptions,
): Promise<Vehicle> {
  const payload = CreateVehicleSchema.parse(input);
  const raw = await apiFetch(VEHICLES_PATH, {
    ...options,
    method: "POST",
    body: payload,
  });
  return VehicleSingleEnvelopeSchema.parse(raw).data;
}

export async function updateVehicleRequest(
  id: string,
  input: UpdateVehicleDto,
  options: VehiclesAdminApiClientOptions,
): Promise<Vehicle> {
  const payload = UpdateVehicleSchema.parse(input);
  const raw = await apiFetch(vehicleByIdPath(id), {
    ...options,
    method: "PATCH",
    body: payload,
  });
  return VehicleSingleEnvelopeSchema.parse(raw).data;
}

export async function deleteVehicleRequest(
  id: string,
  options: VehiclesAdminApiClientOptions,
): Promise<void> {
  const apiBaseUrl = resolveVehiclesApiBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(new URL(vehicleByIdPath(id), apiBaseUrl), {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Vehicles API delete failed with status ${response.status}`,
    );
  }
}
