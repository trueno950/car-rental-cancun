-- deposit_amount_cents is always computed on booking creation; backfill any
-- rows that might have a NULL (none expected in dev) then enforce NOT NULL.
UPDATE "bookings" SET "deposit_amount_cents" = 0 WHERE "deposit_amount_cents" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "deposit_amount_cents" SET NOT NULL;
