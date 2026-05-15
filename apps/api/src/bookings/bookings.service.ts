import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type {
  ApiUser,
  AvailabilityQuery,
  AvailabilityResponse,
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
} from "@rental/validations";

import { getApiEnv } from "../config/env";
import { BookingsRepository } from "./bookings.repository";

const STATE_MACHINE: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async createBooking(
    dto: CreateBookingRequest,
    user: ApiUser,
  ): Promise<BookingResponse> {
    const isFrequent =
      (user as ApiUser & { isFrequent?: boolean }).isFrequent === true;
    const env = getApiEnv();
    const depositRate = isFrequent
      ? env.DEPOSIT_RATE_FREQUENT
      : env.DEPOSIT_RATE_NEW;

    this.logger.log(
      `Creating booking for user ${user.id}, vehicle ${dto.vehicleId}`,
    );

    const booking = await this.bookingsRepository.createWithAvailabilityCheck({
      userId: user.id,
      vehicleId: dto.vehicleId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      depositRate,
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });

    if (booking === "vehicle_not_found") {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    if (booking === "conflict") {
      throw new ConflictException(
        "Vehicle is not available for the selected dates",
      );
    }

    return booking;
  }

  async checkAvailability(
    query: AvailabilityQuery,
  ): Promise<AvailabilityResponse> {
    const available = await this.bookingsRepository.findAvailability(
      query.vehicleId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
    return { available };
  }

  async getMyBookings(userId: string): Promise<BookingResponse[]> {
    return this.bookingsRepository.findByCustomer(userId);
  }

  async getAllBookings(): Promise<BookingResponse[]> {
    return this.bookingsRepository.findAll();
  }

  async transitionStatus(
    id: string,
    newStatus: BookingStatus,
    _actor: ApiUser,
  ): Promise<BookingResponse> {
    const booking = await this.bookingsRepository.findById(id);

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    const allowed = STATE_MACHINE[booking.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition booking from '${booking.status}' to '${newStatus}'`,
      );
    }

    return this.bookingsRepository.updateStatus(id, newStatus);
  }
}
