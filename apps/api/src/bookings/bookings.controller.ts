import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type {
  ApiUser,
  AvailabilityQuery,
  AvailabilityResponse,
  BookingResponse,
  BookingTransitionRequest,
  CreateBookingRequest,
} from "@rental/validations";
import {
  AvailabilityQuerySchema,
  BookingTransitionRequestSchema,
  CreateBookingRequestSchema,
} from "@rental/validations";

import { CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Get("availability")
  @Public()
  async checkAvailability(
    @Query(new ZodValidationPipe(AvailabilityQuerySchema))
    query: AvailabilityQuery,
  ): Promise<AvailabilityResponse> {
    this.logger.log(`GET /bookings/availability vehicleId=${query.vehicleId}`);
    return this.bookingsService.checkAvailability(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("customer", "employee", "manager", "admin")
  async createBooking(
    @Body(new ZodValidationPipe(CreateBookingRequestSchema))
    dto: CreateBookingRequest,
    @CurrentUser() user: ApiUser,
  ): Promise<BookingResponse> {
    this.logger.log(`POST /bookings by user ${user.id}`);
    return this.bookingsService.createBooking(dto, user);
  }

  @Get("me")
  async getMyBookings(
    @CurrentUser() user: ApiUser,
  ): Promise<BookingResponse[]> {
    this.logger.log(`GET /bookings/me user=${user.id}`);
    return this.bookingsService.getMyBookings(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("employee", "manager", "admin")
  async getAllBookings(): Promise<BookingResponse[]> {
    this.logger.log("GET /bookings");
    return this.bookingsService.getAllBookings();
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles("employee", "manager", "admin")
  async updateStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(BookingTransitionRequestSchema))
    body: BookingTransitionRequest,
    @CurrentUser() user: ApiUser,
  ): Promise<BookingResponse> {
    this.logger.log(`PATCH /bookings/${id}/status → ${body.status}`);
    return this.bookingsService.transitionStatus(id, body.status, user);
  }
}
