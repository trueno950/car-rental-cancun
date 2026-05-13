export interface MapLocation {
  id: string;
  name: string;
  note: string;
  position: [number, number];
}

export type MapViewProps = {
  className?: string;
  description: string;
  emptyLabel: string;
  locations: readonly MapLocation[];
  title: string;
};
