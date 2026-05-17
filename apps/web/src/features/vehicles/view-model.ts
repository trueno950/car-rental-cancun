/**
 * Presentation-layer vehicle shape. Structurally compatible with the domain
 * Vehicle but owned by the feature — insulates UI components from domain
 * contract changes.
 */
export type VehicleView = {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  available: boolean;
  seats: number;
  doors: number;
  trunkLiters: number | null;
  maxPayloadKg: number | null;
  transmissionType: "automatic" | "manual" | "4x4";
  fuelType: "gasoline" | "diesel" | "hybrid" | "electric";
  category: "economy" | "compact" | "suv" | "luxury";
  airConditioned: boolean;
  airbags: number | null;
  licensePlate: string | null;
  color: string | null;
  imageUrl: string | null;
};
