"use server";

import type { Vehicle } from "@rental/validations";
import type { CreateVehicleDto, UpdateVehicleDto } from "@rental/validations";

import { revalidatePath } from "next/cache";

import { auth } from "@core/auth";
import {
  adminFetchVehicleById,
  adminCreateVehicle,
  adminUpdateVehicle,
  adminDeleteVehicle,
  fetchVehicles,
} from "../services/vehicles.service";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.apiAccessToken) {
    throw new Error("Not authenticated");
  }
  return session.apiAccessToken;
}

export async function listVehiclesAction(): Promise<Vehicle[]> {
  return fetchVehicles();
}

export async function getVehicleByIdAction(
  id: string,
): Promise<Vehicle | null> {
  try {
    const token = await getToken();
    return await adminFetchVehicleById(id, { token });
  } catch {
    return null;
  }
}

export async function createVehicleAction(
  input: CreateVehicleDto,
): Promise<Vehicle> {
  const token = await getToken();
  const vehicle = await adminCreateVehicle(input, { token });
  revalidatePath("/[locale]/admin/vehicles", "page");
  return vehicle;
}

export async function updateVehicleAction(
  id: string,
  input: UpdateVehicleDto,
): Promise<Vehicle> {
  const token = await getToken();
  const vehicle = await adminUpdateVehicle(id, input, { token });
  revalidatePath("/[locale]/admin/vehicles", "page");
  return vehicle;
}

export async function deleteVehicleAction(id: string): Promise<void> {
  const token = await getToken();
  await adminDeleteVehicle(id, { token });
  revalidatePath("/[locale]/admin/vehicles", "page");
}
