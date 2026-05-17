ALTER TYPE "public"."booking_status" ADD VALUE 'active' BEFORE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'completed' BEFORE 'cancelled';--> statement-breakpoint
CREATE TABLE "stripe_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(120) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_amount_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_checkout_session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_frequent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "seats" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "doors" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "trunk_liters" integer;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "max_payload_kg" integer;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "transmission_type" varchar(50) DEFAULT 'automatic' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "fuel_type" varchar(50) DEFAULT 'gasoline' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "category" varchar(50) DEFAULT 'compact' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "air_conditioned" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "airbags" integer;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "license_plate" varchar(20);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "color" varchar(50);