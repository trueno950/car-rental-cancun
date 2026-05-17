export {
  listVehiclesAction,
  getVehicleByIdAction,
  getPublicVehicleByIdAction,
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
} from "./actions/vehicle-actions";
export { VehicleCard } from "./components/VehicleCard";
export { VehicleGrid } from "./components/VehicleGrid";
export { VehicleForm } from "./components/VehicleForm";
export { VehicleAdminTable } from "./components/VehicleAdminTable";
export { fetchVehicles } from "./services/vehicles.service";
export { getVehicleImageSeed } from "./lib/vehicle-specs";
export type { VehicleView } from "./view-model";
export type {
  VehicleCardProps,
  VehicleCatalogPageCopy,
  VehicleGridProps,
  VehicleFormCopy,
  VehicleAdminTableCopy,
} from "./types";
