import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SignJWT } from "jose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VehicleSchema, VehicleSingleEnvelopeSchema } from "@rental/validations";

import { AppModule } from "../app.module";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor";
import { ResponseEnvelopeInterceptor } from "../common/interceptors/response-envelope.interceptor";
import { resetApiEnvCache } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { bookingsTable } from "../database/schema/bookings";
import { usersTable } from "../database/schema/users";
import { vehiclesTable } from "../database/schema/vehicles";
import { seedVehicles } from "../database/seed/vehicles.seed";

const TEST_DATABASE_URL =
  "postgresql://rental:rental@127.0.0.1:5432/rental_car_cancun";
const TEST_SECRET = "test-nextauth-secret";

/** RFC 4122 v4 UUIDs required by Zod v4's strict uuid validation (variant byte must be 8/9/a/b). */
const TEST_MANAGER_ID = "11111111-1111-4111-a111-111111111111";
const TEST_CUSTOMER_ID = "22222222-2222-4222-b222-222222222222";

const VALID_VEHICLE_BODY = {
  make: "Honda",
  model: "Civic",
  year: 2024,
  dailyRate: 65.5,
  available: true,
  seats: 5,
  doors: 4,
  trunkLiters: 428,
  maxPayloadKg: 450,
  transmissionType: "automatic",
  fuelType: "gasoline",
  category: "compact",
  airConditioned: true,
  airbags: 4,
};

describe("GET /vehicles (integration)", () => {
  let app: INestApplication | null = null;

  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: TEST_SECRET,
      NODE_ENV: "test",
      PORT: "3001",
    };
    resetApiEnvCache();
  });

  afterEach(async () => {
    if (app) {
      const db = app.get(DatabaseService).db;
      await db.delete(vehiclesTable);
      await app.close();
      app = null;
    }
    resetApiEnvCache();
  });

  async function bootstrap() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseEnvelopeInterceptor(),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    return app;
  }

  it("returns DB-backed vehicles parseable by VehicleSchema.array()", async () => {
    const instance = await bootstrap();
    const db = instance.get(DatabaseService).db;
    await seedVehicles(db);

    const response = await request(instance.getHttpServer()).get("/vehicles");

    expect(response.status).toBe(200);
    const parsed = VehicleSchema.array().safeParse(response.body.data);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.length).toBeGreaterThanOrEqual(3);
  });

  it("does not leak dailyRateCents past the repository boundary", async () => {
    const instance = await bootstrap();
    const db = instance.get(DatabaseService).db;
    await seedVehicles(db);

    const response = await request(instance.getHttpServer()).get("/vehicles");
    const body = JSON.stringify(response.body);
    expect(body).not.toContain("dailyRateCents");
    expect(body).not.toContain("daily_rate_cents");
  });

  it("returns an empty array when the table is empty", async () => {
    const instance = await bootstrap();
    const db = instance.get(DatabaseService).db;
    await db.delete(vehiclesTable);

    const response = await request(instance.getHttpServer()).get("/vehicles");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });
});

// ─── Role-gated write endpoints ───────────────────────────────────────────────

describe("Vehicles write endpoints (integration)", () => {
  let app: INestApplication | null = null;

  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: TEST_SECRET,
      NODE_ENV: "test",
      PORT: "3001",
    };
    resetApiEnvCache();
  });

  afterEach(async () => {
    if (app) {
      const db = app.get(DatabaseService).db;
      await db.delete(bookingsTable);
      await db.delete(vehiclesTable);
      await db.delete(usersTable);
      await app.close();
      app = null;
    }
    resetApiEnvCache();
  });

  async function bootstrap() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseEnvelopeInterceptor(),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    return app;
  }

  async function signToken(
    role: "customer" | "employee" | "manager" | "admin",
    userId: string = TEST_MANAGER_ID,
  ) {
    return new SignJWT({ email: "test@example.com", name: "Test User", role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
  }

  async function seedUser(
    instance: INestApplication,
    opts: { id: string; role: "customer" | "employee" | "manager" | "admin" },
  ) {
    const db = instance.get(DatabaseService).db;
    await db
      .insert(usersTable)
      .values({
        id: opts.id,
        email: `${opts.role}-${opts.id.slice(0, 4)}@test.com`,
        name: `${opts.role} user`,
        role: opts.role,
      })
      .onConflictDoNothing();
  }

  // ── Public regression guard ──────────────────────────────────────────────

  it("GET /vehicles without JWT → 200 (public regression)", async () => {
    const instance = await bootstrap();

    const response = await request(instance.getHttpServer()).get("/vehicles");

    expect(response.status).toBe(200);
  });

  it("GET /vehicles/available without JWT → 200 (public regression)", async () => {
    const instance = await bootstrap();
    const startDate = "2025-06-01T00:00:00.000Z";
    const endDate = "2025-06-05T00:00:00.000Z";

    const response = await request(instance.getHttpServer()).get(
      `/vehicles/available?startDate=${startDate}&endDate=${endDate}`,
    );

    expect(response.status).toBe(200);
  });

  // ── POST /vehicles ───────────────────────────────────────────────────────

  it("POST /vehicles — manager JWT → 201 with { data: vehicle } and decimal dailyRate", async () => {
    const instance = await bootstrap();
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(VALID_VEHICLE_BODY);

    expect(response.status).toBe(201);
    const parsed = VehicleSingleEnvelopeSchema.safeParse(response.body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.dailyRate).toBe(65.5);
      expect(parsed.data.data.make).toBe("Honda");
    }
  });

  it("POST /vehicles — admin JWT → 201", async () => {
    const instance = await bootstrap();
    const token = await signToken("admin");

    const response = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(VALID_VEHICLE_BODY);

    expect(response.status).toBe(201);
  });

  it("POST /vehicles — customer JWT → 403 Forbidden", async () => {
    const instance = await bootstrap();
    const token = await signToken("customer", TEST_CUSTOMER_ID);

    const response = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(VALID_VEHICLE_BODY);

    expect(response.status).toBe(403);
  });

  it("POST /vehicles — no JWT → 401 Unauthorized", async () => {
    const instance = await bootstrap();

    const response = await request(instance.getHttpServer())
      .post("/vehicles")
      .send(VALID_VEHICLE_BODY);

    expect(response.status).toBe(401);
  });

  it("POST /vehicles — invalid body (missing make) → 400 Bad Request", async () => {
    const instance = await bootstrap();
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({ model: "Civic", year: 2024, dailyRate: 65, available: true });

    expect(response.status).toBe(400);
  });

  // ── GET /vehicles/:id ────────────────────────────────────────────────────

  it("GET /vehicles/:id — manager JWT → 200 with vehicle", async () => {
    const instance = await bootstrap();
    const managerToken = await signToken("manager");

    // Create a vehicle first
    const createResponse = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${managerToken}`)
      .send(VALID_VEHICLE_BODY);
    expect(createResponse.status).toBe(201);
    const vehicleId = createResponse.body.data.id as string;

    const response = await request(instance.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(vehicleId);
  });

  it("GET /vehicles/:id — no JWT → 401 Unauthorized", async () => {
    const instance = await bootstrap();

    const response = await request(instance.getHttpServer()).get(
      "/vehicles/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(401);
  });

  it("GET /vehicles/:id — manager JWT, vehicle not found → 404", async () => {
    const instance = await bootstrap();
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .get("/vehicles/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  // ── PATCH /vehicles/:id ──────────────────────────────────────────────────

  it("PATCH /vehicles/:id — manager JWT → 200 with updated vehicle", async () => {
    const instance = await bootstrap();
    const managerToken = await signToken("manager");

    const createResponse = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${managerToken}`)
      .send(VALID_VEHICLE_BODY);
    expect(createResponse.status).toBe(201);
    const vehicleId = createResponse.body.data.id as string;

    const response = await request(instance.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ dailyRate: 80 });

    expect(response.status).toBe(200);
    expect(response.body.data.dailyRate).toBe(80);
  });

  it("PATCH /vehicles/:id — customer JWT → 403 Forbidden", async () => {
    const instance = await bootstrap();
    const customerToken = await signToken("customer", TEST_CUSTOMER_ID);

    const response = await request(instance.getHttpServer())
      .patch("/vehicles/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ dailyRate: 80 });

    expect(response.status).toBe(403);
  });

  it("PATCH /vehicles/:id — manager JWT, not found → 404", async () => {
    const instance = await bootstrap();
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .patch("/vehicles/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ dailyRate: 80 });

    expect(response.status).toBe(404);
  });

  // ── DELETE /vehicles/:id ─────────────────────────────────────────────────

  it("DELETE /vehicles/:id — manager JWT → 204 No Content", async () => {
    const instance = await bootstrap();
    const managerToken = await signToken("manager");

    const createResponse = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${managerToken}`)
      .send(VALID_VEHICLE_BODY);
    expect(createResponse.status).toBe(201);
    const vehicleId = createResponse.body.data.id as string;

    const response = await request(instance.getHttpServer())
      .delete(`/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.status).toBe(204);
  });

  it("DELETE /vehicles/:id — manager JWT, not found → 404", async () => {
    const instance = await bootstrap();
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .delete("/vehicles/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("DELETE /vehicles/:id — vehicle with active booking → 409 Conflict", async () => {
    const instance = await bootstrap();
    const managerToken = await signToken("manager");

    // Seed a user and vehicle, then seed a booking (FK dependency)
    await seedUser(instance, { id: TEST_CUSTOMER_ID, role: "customer" });

    const createVehicleResponse = await request(instance.getHttpServer())
      .post("/vehicles")
      .set("Authorization", `Bearer ${managerToken}`)
      .send(VALID_VEHICLE_BODY);
    expect(createVehicleResponse.status).toBe(201);
    const vehicleId = createVehicleResponse.body.data.id as string;

    // Seed a booking that references the vehicle
    const db = instance.get(DatabaseService).db;
    await db.insert(bookingsTable).values({
      userId: TEST_CUSTOMER_ID,
      vehicleId,
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-05"),
      totalPriceCents: 26200,
      depositAmountCents: 7860,
      status: "confirmed",
    });

    const response = await request(instance.getHttpServer())
      .delete(`/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.status).toBe(409);
  });
});
