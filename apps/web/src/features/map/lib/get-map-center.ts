import type { MapLocation } from "../types";

const FALLBACK_CENTER: [number, number] = [21.161908, -86.851528];

export function getMapCenter(locations: readonly MapLocation[]): [number, number] {
  if (locations.length === 0) {
    return FALLBACK_CENTER;
  }

  const totals = locations.reduce(
    (accumulator, location) => {
      accumulator.lat += location.position[0];
      accumulator.lng += location.position[1];
      return accumulator;
    },
    { lat: 0, lng: 0 },
  );

  return [totals.lat / locations.length, totals.lng / locations.length];
}
