import Image from "next/image";
import Link from "next/link";
import { Users, Fuel, Zap, Wind } from "lucide-react";

import type { VehicleCardProps } from "../types";
import { getVehicleSpecs, getVehicleImageSeed } from "../lib/vehicle-specs";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VehicleCard({ vehicle, copy, locale }: VehicleCardProps) {
  const specs = getVehicleSpecs(vehicle.make, vehicle.model);
  const imageSeed = getVehicleImageSeed(vehicle.make, vehicle.model);
  const imageUrl = `https://picsum.photos/seed/${imageSeed}/800/520`;

  return (
    <article
      aria-label={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ filter: "contrast(1.08) saturate(0.85)" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <span
            className={
              vehicle.available
                ? "inline-flex items-center rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white"
                : "inline-flex items-center rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/70"
            }
          >
            {vehicle.available ? copy.availabilityAvailable : copy.availabilityUnavailable}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <div className="rounded-xl bg-black/65 backdrop-blur-sm px-3 py-1.5 text-right">
            <p className="text-white text-lg font-bold leading-none">
              {formatCurrency(vehicle.dailyRate, locale)}
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">/{copy.perDay}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {copy.yearLabel} {vehicle.year}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{specs.seats} pasajeros</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Zap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{specs.transmission}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Fuel className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{specs.fuel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Wind className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Aire acond.</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap mt-auto">
          {specs.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        {vehicle.available ? (
          <Link
            href={`/${locale}/bookings/new?vehicleId=${vehicle.id}`}
            className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.01]"
          >
            {copy.bookButton}
          </Link>
        ) : (
          <div className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed">
            {copy.availabilityUnavailable}
          </div>
        )}
      </div>
    </article>
  );
}
