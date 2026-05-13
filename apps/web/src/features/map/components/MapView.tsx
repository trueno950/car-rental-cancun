"use client";

import dynamic from "next/dynamic";

import type { MapViewProps } from "../types";

import { MapSkeleton } from "./MapSkeleton";

const ReservationMapClient = dynamic<MapViewProps>(() => import("./MapClient").then((module) => module.MapClient), {
  loading: () => <MapSkeleton />,
  ssr: false,
});

export function MapView(props: MapViewProps) {
  return <ReservationMapClient {...props} />;
}
