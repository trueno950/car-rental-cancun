import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SignJWT } from "jose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../app.module";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor";
import { ResponseEnvelopeInterceptor } from "../common/interceptors/response-envelope.interceptor";
import { resetApiEnvCache } from "../config/env";
import { DatabaseService } from "../database/database.service";
import { usersTable } from "../database/schema/users";

const TEST_DATABASE_URL =
  "postgresql://rental:rental@127.0.0.1:5432/rental_car_cancun";
const TEST_SECRET = "test-nextauth-secret";
const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440010";
const TEST_USER_ID_2 = "550e8400-e29b-41d4-a716-446655440011";

describe("auth foundation integration", () => {
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
      await app.close();
      app = null;
    }

    resetApiEnvCache();
  });

  async function createApplication() {
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

  async function signValidToken(
    role: "customer" | "employee" | "manager" | "admin" = "customer",
  ) {
    return new SignJWT({
      email: "joel@example.com",
      name: "Joel May",
      role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(TEST_USER_ID)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
  }

  it("allows requests to public endpoints without a bearer token", async () => {
    const instance = await createApplication();

    const response = await request(instance.getHttpServer()).get("/vehicles");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("rejects protected endpoints without a bearer token", async () => {
    const instance = await createApplication();

    const response = await request(instance.getHttpServer()).get("/profile");

    expect(response.status).toBe(401);
  });

  it("accepts a valid bearer token and exposes the user payload", async () => {
    const instance = await createApplication();
    const token = await signValidToken();

    const response = await request(instance.getHttpServer())
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        id: TEST_USER_ID,
        email: "joel@example.com",
        name: "Joel May",
        role: "customer",
      },
    });
  });

  it("token without role claim defaults to customer in profile response", async () => {
    const instance = await createApplication();
    // Token signed without a role claim (pre-deploy tokens)
    const token = await new SignJWT({
      email: "joel@example.com",
      name: "Joel May",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(TEST_USER_ID)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));

    const response = await request(instance.getHttpServer())
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("customer");
  });
});

describe("GET /users (integration)", () => {
  let app: INestApplication | null = null;

  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: TEST_SECRET,
      NODE_ENV: "test",
      PORT: "3002",
    };
    resetApiEnvCache();
  });

  afterEach(async () => {
    if (app) {
      const db = app.get(DatabaseService).db;
      await db.delete(usersTable);
      await app.close();
      app = null;
    }
    resetApiEnvCache();
  });

  async function createApplication() {
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
    userId = TEST_USER_ID,
  ) {
    return new SignJWT({ email: "test@example.com", name: "Test User", role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
  }

  it("employee token → 200 and returns user list", async () => {
    const instance = await createApplication();
    const token = await signToken("employee");

    const response = await request(instance.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("customer token → 403 Forbidden", async () => {
    const instance = await createApplication();
    const token = await signToken("customer");

    const response = await request(instance.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("no token → 401 Unauthorized", async () => {
    const instance = await createApplication();

    const response = await request(instance.getHttpServer()).get("/users");

    expect(response.status).toBe(401);
  });
});

describe("PATCH /users/:id/role (integration)", () => {
  let app: INestApplication | null = null;

  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: TEST_SECRET,
      NODE_ENV: "test",
      PORT: "3003",
    };
    resetApiEnvCache();
  });

  afterEach(async () => {
    if (app) {
      const db = app.get(DatabaseService).db;
      await db.delete(usersTable);
      await app.close();
      app = null;
    }
    resetApiEnvCache();
  });

  async function createApplication() {
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

  async function seedUser(
    instance: INestApplication,
    opts: {
      id: string;
      email: string;
      name: string;
      role: "customer" | "employee" | "manager" | "admin";
    },
  ) {
    const db = instance.get(DatabaseService).db;
    await db.insert(usersTable).values({
      id: opts.id,
      email: opts.email,
      name: opts.name,
      role: opts.role,
    });
  }

  async function signToken(
    role: "customer" | "employee" | "manager" | "admin",
    userId = TEST_USER_ID,
  ) {
    return new SignJWT({ email: "caller@example.com", name: "Caller", role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
  }

  it("manager sets employee role → 200", async () => {
    const instance = await createApplication();
    await seedUser(instance, {
      id: TEST_USER_ID_2,
      email: "target@example.com",
      name: "Target",
      role: "customer",
    });
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .patch(`/users/${TEST_USER_ID_2}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "employee" });

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("employee");
  });

  it("manager tries to set admin role → 403", async () => {
    const instance = await createApplication();
    await seedUser(instance, {
      id: TEST_USER_ID_2,
      email: "target@example.com",
      name: "Target",
      role: "customer",
    });
    const token = await signToken("manager");

    const response = await request(instance.getHttpServer())
      .patch(`/users/${TEST_USER_ID_2}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(response.status).toBe(403);
  });

  it("admin sets admin role → 200", async () => {
    const instance = await createApplication();
    await seedUser(instance, {
      id: TEST_USER_ID_2,
      email: "target@example.com",
      name: "Target",
      role: "customer",
    });
    const token = await signToken("admin");

    const response = await request(instance.getHttpServer())
      .patch(`/users/${TEST_USER_ID_2}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("admin");
  });

  it("employee token → 403 (guard blocks before service)", async () => {
    const instance = await createApplication();
    const token = await signToken("employee");

    const response = await request(instance.getHttpServer())
      .patch(`/users/${TEST_USER_ID_2}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "employee" });

    expect(response.status).toBe(403);
  });
});
