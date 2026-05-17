"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Fuel, Zap, DoorOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import type { VehicleCardProps } from "../types";
import { getVehicleImageSeed } from "../lib/vehicle-specs";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VehicleCard({ vehicle, copy, locale }: VehicleCardProps) {
  const tSpecs = useTranslations("VehicleSpecs");
  const imageSeed = getVehicleImageSeed(
    vehicle.make,
    vehicle.model,
    vehicle.category,
  );
  const imageUrl =
    vehicle.imageUrl ?? `https://picsum.photos/seed/${imageSeed}/800/520`;
  const detailHref = `/${locale}/vehicles/${vehicle.id}`;

  const chips = [
    {
      icon: Users,
      value: `${vehicle.seats} ${tSpecs("units.persons")}`,
    },
    {
      icon: Zap,
      value: tSpecs(`transmission.${vehicle.transmissionType}`),
    },
    {
      icon: Fuel,
      value: tSpecs(`fuel.${vehicle.fuelType}`),
    },
    {
      icon: DoorOpen,
      value: `${vehicle.doors} ${tSpecs("units.doors")}`,
    },
  ];

  return (
    <article
      aria-label={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
    >
      <Link
        href={detailHref}
        className="relative h-52 overflow-hidden bg-muted block"
      >
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
            {vehicle.available
              ? copy.availabilityAvailable
              : copy.availabilityUnavailable}
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
      </Link>

      <div className="flex flex-col gap-4 p-5 flex-1">
        <Link href={detailHref} className="group/title">
          <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight group-hover/title:text-primary transition-colors">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {copy.yearLabel} {vehicle.year}
          </p>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          {chips.map(({ icon: Icon, value }) => (
            <div
              key={value}
              className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-auto">
          <Link
            href={detailHref}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {copy.viewDetails}
          </Link>
          {vehicle.available && (
            <Link
              href={`/${locale}/bookings/new?vehicleId=${vehicle.id}`}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {copy.bookButton}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
