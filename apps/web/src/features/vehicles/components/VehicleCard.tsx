import Link from "next/link";

import type { VehicleCardProps } from "../types";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VehicleCard({ vehicle, copy, locale }: VehicleCardProps) {
  const availabilityLabel = vehicle.available
    ? copy.availabilityAvailable
    : copy.availabilityUnavailable;

  return (
    <article
      aria-label={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {vehicle.make} {vehicle.model}
        </h2>
        <p className="text-sm text-muted-foreground">
          {copy.yearLabel}: {vehicle.year}
        </p>
      </header>

      <p className="text-2xl font-semibold">
        {formatCurrency(vehicle.dailyRate, locale)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          / {copy.perDay}
        </span>
      </p>

      <span
        className={
          vehicle.available
            ? "inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700"
            : "inline-flex w-fit items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        }
      >
        {availabilityLabel}
      </span>

      {vehicle.available && (
        <Link
          href={`/${locale}/bookings/new?vehicleId=${vehicle.id}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {copy.bookButton}
        </Link>
      )}
    </article>
  );
}
