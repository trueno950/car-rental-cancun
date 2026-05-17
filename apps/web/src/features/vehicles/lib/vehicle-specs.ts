type VehicleSpecs = {
  seats: number;
  transmission: string;
  fuel: string;
  tags: string[];
};

type VehicleProfile = {
  category: "economy" | "compact" | "suv" | "luxury";
  seats: number;
  transmission: string;
  fuel: string;
  tags: string[];
};

const PROFILES: Record<string, VehicleProfile> = {
  "toyota_yaris": {
    category: "economy",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Bajo consumo", "Ideal ciudad"],
  },
  "toyota_corolla": {
    category: "compact",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Confiable", "Cómodo"],
  },
  "volkswagen_jetta": {
    category: "compact",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Premium", "Gran maletero"],
  },
  "jeep_wrangler": {
    category: "suv",
    seats: 4,
    transmission: "4x4",
    fuel: "Gasolina",
    tags: ["Todo terreno", "Aventura"],
  },
  "jeep_compass": {
    category: "suv",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["SUV", "Familiar"],
  },
  "nissan_versa": {
    category: "economy",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Económico", "Eficiente"],
  },
  "nissan_kicks": {
    category: "suv",
    seats: 5,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["SUV compacta", "Tecnología"],
  },
  "chevrolet_spark": {
    category: "economy",
    seats: 4,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Compacto", "Fácil estacionar"],
  },
  "ford_explorer": {
    category: "suv",
    seats: 7,
    transmission: "Automático",
    fuel: "Gasolina",
    tags: ["Familiar", "7 plazas"],
  },
};

const DEFAULT_COMPACT: VehicleProfile = {
  category: "compact",
  seats: 5,
  transmission: "Automático",
  fuel: "Gasolina",
  tags: ["Cómodo", "Confiable"],
};

const IMAGE_SEEDS: Record<string, string> = {
  economy: "city-car-silver",
  compact: "sedan-modern-car",
  suv: "suv-adventure-road",
  luxury: "luxury-car-dark",
};

const VEHICLE_IMAGE_OVERRIDES: Record<string, string> = {
  "toyota_yaris": "compact-silver-car",
  "volkswagen_jetta": "vw-sedan-silver",
  "jeep_wrangler": "jeep-offroad-adventure",
  "nissan_versa": "economy-car-white",
};

export function getVehicleSpecs(make: string, model: string): VehicleSpecs {
  const key = `${make.toLowerCase()}_${model.toLowerCase()}`;
  const profile = PROFILES[key] ?? DEFAULT_COMPACT;
  return {
    seats: profile.seats,
    transmission: profile.transmission,
    fuel: profile.fuel,
    tags: profile.tags,
  };
}

export function getVehicleImageSeed(make: string, model: string): string {
  const key = `${make.toLowerCase()}_${model.toLowerCase()}`;
  if (VEHICLE_IMAGE_OVERRIDES[key]) return VEHICLE_IMAGE_OVERRIDES[key];
  const profile = PROFILES[key] ?? DEFAULT_COMPACT;
  return IMAGE_SEEDS[profile.category] ?? "modern-car";
}
