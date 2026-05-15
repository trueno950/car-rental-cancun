import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { stripeWebhookEventsTable } from "../database/schema/stripe-webhook-events";
import { PaymentsRepository } from "./payments.repository";

const pool = new Pool({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: 5432,
  user: "rental",
  password: "rental",
  database: "rental_dev",
});

const db = drizzle(pool);

class StubDatabaseService {
  readonly db = db;
}

describe("PaymentsRepository (integration)", () => {
  const repo = new PaymentsRepository(new StubDatabaseService() as never);

  beforeEach(async () => {
    await db.delete(stripeWebhookEventsTable);
  });

  afterEach(async () => {
    await db.delete(stripeWebhookEventsTable);
  });

  it("recordEventIfNotExists returns true on first insert", async () => {
    const result = await repo.recordEventIfNotExists(
      "evt_integration_001",
      "checkout.session.completed",
    );
    expect(result).toBe(true);
  });

  it("recordEventIfNotExists returns false on duplicate insert", async () => {
    await repo.recordEventIfNotExists(
      "evt_integration_002",
      "checkout.session.completed",
    );
    const result = await repo.recordEventIfNotExists(
      "evt_integration_002",
      "checkout.session.completed",
    );
    expect(result).toBe(false);
  });
});
