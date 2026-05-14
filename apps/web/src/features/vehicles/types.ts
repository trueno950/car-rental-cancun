import type { Vehicle } from "@rental/validations";

export interface VehicleCatalogPageCopy {
  heading: string;
  helper: string;
  emptyTitle: string;
  emptyDescription: string;
  availabilityAvailable: string;
  availabilityUnavailable: string;
  perDay: string;
  yearLabel: string;
}

export interface VehicleCardProps {
  vehicle: Vehicle;
  copy: VehicleCatalogPageCopy;
  locale: string;
}

export interface VehicleGridProps {
  vehicles: readonly Vehicle[];
  copy: VehicleCatalogPageCopy;
  locale: string;
}
