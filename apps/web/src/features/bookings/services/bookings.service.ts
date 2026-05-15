import {
  BookingResponseSchema,
  CheckoutSessionResponseSchema,
  CreateBookingRequestSchema,
} from "@rental/validations";
import type {
  BookingResponse,
  CheckoutSessionResponse,
  CreateBookingRequest,
} from "@rental/validations";

import { BOOKINGS_PATH, resolveBookingsApiBaseUrl } from "@core/http";

interface BookingsApiClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  token: string;
}

async function apiFetch(
  path: string,
  options: BookingsApiClientOptions & { method?: string; body?: unknown },
): Promise<unknown> {
  const apiBaseUrl = resolveBookingsApiBaseUrl(options.apiBaseUrl);
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
      `Bookings API request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export async function createBooking(
  input: CreateBookingRequest,
  options: BookingsApiClientOptions,
): Promise<BookingResponse> {
  const payload = CreateBookingRequestSchema.parse(input);
  const data = await apiFetch(BOOKINGS_PATH, {
    ...options,
    method: "POST",
    body: payload,
  });
  return BookingResponseSchema.parse(data);
}

export async function fetchMyBookings(
  options: BookingsApiClientOptions,
): Promise<BookingResponse[]> {
  const data = await apiFetch(`${BOOKINGS_PATH}/me`, options);
  return BookingResponseSchema.array().parse(data);
}

export async function fetchAllBookings(
  options: BookingsApiClientOptions,
): Promise<BookingResponse[]> {
  const data = await apiFetch(BOOKINGS_PATH, options);
  return BookingResponseSchema.array().parse(data);
}

export async function createCheckoutSession(
  bookingId: string,
  options: BookingsApiClientOptions,
): Promise<CheckoutSessionResponse> {
  const data = await apiFetch(
    `${BOOKINGS_PATH}/${bookingId}/checkout-session`,
    { ...options, method: "POST" },
  );
  return CheckoutSessionResponseSchema.parse(data);
}

export async function fetchBookingById(
  id: string,
  options: BookingsApiClientOptions,
): Promise<BookingResponse | null> {
  try {
    const data = await apiFetch(`${BOOKINGS_PATH}/${id}`, options);
    return BookingResponseSchema.parse(data);
  } catch {
    return null;
  }
}
