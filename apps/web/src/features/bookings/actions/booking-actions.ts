"use server";

import type {
  BookingResponse,
  CreateBookingRequest,
} from "@rental/validations";

import { auth } from "../../../../auth";
import {
  createBooking,
  fetchAllBookings,
  fetchBookingById,
  fetchMyBookings,
} from "../services/bookings.service";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.apiAccessToken) {
    throw new Error("Not authenticated");
  }
  return session.apiAccessToken;
}

export async function createBookingAction(
  input: CreateBookingRequest,
): Promise<BookingResponse> {
  const token = await getToken();
  return createBooking(input, { token });
}

export async function getMyBookingsAction(): Promise<BookingResponse[]> {
  const token = await getToken();
  return fetchMyBookings({ token });
}

export async function getAllBookingsAction(): Promise<BookingResponse[]> {
  const token = await getToken();
  return fetchAllBookings({ token });
}

export async function getBookingByIdAction(
  id: string,
): Promise<BookingResponse | null> {
  const token = await getToken();
  return fetchBookingById(id, { token });
}
