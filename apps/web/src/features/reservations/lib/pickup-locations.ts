export interface ReservationPickupLocation {
  id: string;
  name: string;
  note: string;
  position: [number, number];
}

export const RESERVATION_PICKUP_LOCATIONS = [
  {
    id: "cun-airport",
    name: "Cancún International Airport",
    note: "Terminal corridor handoff for airport arrivals.",
    position: [21.0365, -86.8771],
  },
  {
    id: "hotel-zone",
    name: "Hotel Zone",
    note: "Boulevard Kukulcán delivery route through the resort strip.",
    position: [21.1215, -86.7553],
  },
  {
    id: "puerto-juarez",
    name: "Puerto Juárez",
    note: "Gran Puerto transfer point near the ferry terminal.",
    position: [21.1758, -86.8254],
  },
] as const satisfies readonly ReservationPickupLocation[];
