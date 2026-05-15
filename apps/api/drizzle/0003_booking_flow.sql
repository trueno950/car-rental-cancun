-- WARNING: ALTER TYPE ... ADD VALUE cannot run inside a PostgreSQL transaction block.
-- If drizzle-kit wraps this in a transaction, these two statements will fail.
-- Run them manually before applying the rest, or use a migration runner that supports
-- running statements outside of transactions (e.g., drizzle-kit with --no-transaction).
ALTER TYPE "booking_status" ADD VALUE IF NOT EXISTS 'active';
ALTER TYPE "booking_status" ADD VALUE IF NOT EXISTS 'completed';

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deposit_amount_cents" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" varchar(255);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" varchar(255);

CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "stripe_event_id" varchar(255) NOT NULL UNIQUE,
  "event_type" varchar(120) NOT NULL,
  "processed_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_frequent" boolean NOT NULL DEFAULT false;
