ALTER TABLE "vehicles"
  ADD COLUMN "seats" integer NOT NULL DEFAULT 5,
  ADD COLUMN "doors" integer NOT NULL DEFAULT 4,
  ADD COLUMN "trunk_liters" integer,
  ADD COLUMN "max_payload_kg" integer,
  ADD COLUMN "transmission_type" varchar(50) NOT NULL DEFAULT 'automatic',
  ADD COLUMN "fuel_type" varchar(50) NOT NULL DEFAULT 'gasoline',
  ADD COLUMN "category" varchar(50) NOT NULL DEFAULT 'compact',
  ADD COLUMN "air_conditioned" boolean NOT NULL DEFAULT true,
  ADD COLUMN "airbags" integer;
