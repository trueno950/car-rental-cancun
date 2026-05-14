CREATE TYPE "public"."role" AS ENUM('customer', 'employee', 'manager', 'admin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'customer' NOT NULL;