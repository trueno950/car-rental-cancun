import type { VehicleGridProps } from "../types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ vehicles, copy, locale }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <section
        role="status"
        className="rounded-3xl border border-dashed border-border bg-muted/30 p-10 text-center"
      >
        <h2 className="text-lg font-semibold">{copy.emptyTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {copy.emptyDescription}
        </p>
      </section>
    );
  }

  return (
    <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <li key={vehicle.id}>
          <VehicleCard vehicle={vehicle} copy={copy} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
