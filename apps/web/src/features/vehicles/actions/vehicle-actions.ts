"use server";

import type {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
} from "@rental/validations";

import { revalidatePath } from "next/cache";

import { auth } from "@core/auth";
import {
  adminFetchVehicleById,
  adminCreateVehicle,
  adminUpdateVehicle,
  adminDeleteVehicle,
  fetchVehicles,
} from "../services/vehicles.service";
import {
  uploadVehicleImage,
  deleteVehicleImage,
  extractCloudinaryPublicId,
} from "@core/cloudinary";

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

export async function getPublicVehicleByIdAction(
  id: string,
): Promise<Vehicle | null> {
  const { fetchVehicleByIdPublic } =
    await import("../services/vehicles.service");
  return fetchVehicleByIdPublic(id);
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
  revalidatePath("/", "layout");
  return vehicle;
}

export async function updateVehicleAction(
  id: string,
  input: UpdateVehicleDto,
): Promise<Vehicle> {
  const token = await getToken();
  const vehicle = await adminUpdateVehicle(id, input, { token });
  revalidatePath("/", "layout");
  return vehicle;
}

export async function deleteVehicleAction(id: string): Promise<void> {
  const token = await getToken();
  await adminDeleteVehicle(id, { token });
  revalidatePath("/", "layout");
}

export async function uploadVehicleImageAction(
  formData: FormData,
): Promise<string> {
  await getToken();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }
  return uploadVehicleImage(file);
}

export async function deleteVehicleImageAction(url: string): Promise<void> {
  await getToken();
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  await deleteVehicleImage(publicId);
}
