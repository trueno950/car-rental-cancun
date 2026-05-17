CREATE TYPE "public"."fuel_type" AS ENUM('gasoline', 'diesel', 'hybrid', 'electric');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('automatic', 'manual', '4x4');--> statement-breakpoint
CREATE TYPE "public"."vehicle_category" AS ENUM('economy', 'compact', 'suv', 'luxury');--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "transmission_type" SET DEFAULT 'automatic'::"public"."transmission_type";--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "transmission_type" SET DATA TYPE "public"."transmission_type" USING "transmission_type"::"public"."transmission_type";--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "fuel_type" SET DEFAULT 'gasoline'::"public"."fuel_type";--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "fuel_type" SET DATA TYPE "public"."fuel_type" USING "fuel_type"::"public"."fuel_type";--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "category" SET DEFAULT 'compact'::"public"."vehicle_category";--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "category" SET DATA TYPE "public"."vehicle_category" USING "category"::"public"."vehicle_category";