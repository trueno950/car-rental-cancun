"use server";

import type { Vehicle } from "@rental/validations";

import { fetchVehicles } from "../services/vehicles.service";

export async function listVehiclesAction(): Promise<Vehicle[]> {
  return fetchVehicles();
}
