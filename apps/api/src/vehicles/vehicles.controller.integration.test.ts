import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VehicleSchema } from "@rental/validations";

import { AppModule } from "../app.module";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor";
import { ResponseEnvelopeInterceptor } from "../common/interceptors/response-envelope.interceptor";
import { resetApiEnvCache } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { vehiclesTable } from "../database/schema/vehicles";
import { seedVehicles } from "../database/seed/vehicles.seed";

const TEST_DATABASE_URL =
  "postgresql://rental:rental@127.0.0.1:5432/rental_car_cancun";
const TEST_SECRET = "test-nextauth-secret";

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
