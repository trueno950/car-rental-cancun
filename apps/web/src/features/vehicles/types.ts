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
  bookButton: string;
  viewDetails: string;
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

export interface VehicleFormCopy {
  titleCreate: string;
  titleEdit: string;
  fieldMake: string;
  fieldModel: string;
  fieldYear: string;
  fieldDailyRate: string;
  fieldAvailable: string;
  submitCreate: string;
  submitUpdate: string;
  cancel: string;
  validationRequired: string;
  validationPositive: string;
  validationMinYear: string;
  errorGeneric: string;
}

export interface VehicleAdminTableCopy {
  colMake: string;
  colModel: string;
  colYear: string;
  colDailyRate: string;
  colAvailable: string;
  colActions: string;
  actionEdit: string;
  actionDelete: string;
  deleteConfirm: string;
  availabilityAvailable: string;
  availabilityUnavailable: string;
  empty: string;
}
