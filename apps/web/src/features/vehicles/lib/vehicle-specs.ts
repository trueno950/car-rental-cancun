const IMAGE_SEEDS: Record<string, string> = {
  economy: "city-car-silver",
  compact: "sedan-modern-car",
  suv: "suv-adventure-road",
  luxury: "luxury-car-dark",
};

const VEHICLE_IMAGE_OVERRIDES: Record<string, string> = {
  toyota_yaris: "compact-silver-car",
  volkswagen_jetta: "vw-sedan-silver",
  jeep_wrangler: "jeep-offroad-adventure",
  nissan_versa: "economy-car-white",
};

export function getVehicleImageSeed(
  make: string,
  model: string,
  category?: string,
): string {
  const key = `${make.toLowerCase()}_${model.toLowerCase()}`;
  if (VEHICLE_IMAGE_OVERRIDES[key]) return VEHICLE_IMAGE_OVERRIDES[key];
  if (category && IMAGE_SEEDS[category]) return IMAGE_SEEDS[category];
  return "modern-car";
}
