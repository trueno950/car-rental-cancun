import {
  BadRequestException,
  ConflictException,
  Inject,
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

import { AppConfigService } from "../config/config.service";
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

  constructor(
    @Inject(BookingsRepository)
    private readonly bookingsRepository: BookingsRepository,
    @Inject(AppConfigService)
    private readonly configService: AppConfigService,
  ) {}

  async createBooking(
    dto: CreateBookingRequest,
    user: ApiUser,
  ): Promise<BookingResponse> {
    const isFrequent =
      (user as ApiUser & { isFrequent?: boolean }).isFrequent === true;
    const { depositRateFrequent, depositRateNew } =
      this.configService.getBookingConfig();
    const depositRate = isFrequent ? depositRateFrequent : depositRateNew;

    this.logger.log(`Creating booking for vehicle ${dto.vehicleId}`);

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

  async getById(id: string): Promise<BookingResponse> {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
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
