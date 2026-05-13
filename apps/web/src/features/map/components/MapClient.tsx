"use client";

import { divIcon, type LatLngExpression } from "leaflet";
import { MapPinnedIcon } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";

import { MotionSurface } from "@shared/components/motion";
import { cn } from "@shared/lib";

import { getMapCenter } from "../lib/get-map-center";
import type { MapViewProps } from "../types";

const reservationMarkerIcon = divIcon({
  className: "reservation-map-marker-wrapper",
  html: '<span class="reservation-map-marker"><span class="reservation-map-marker__dot"></span></span>',
  iconAnchor: [22, 44],
  iconSize: [44, 44],
  popupAnchor: [0, -32],
});

export function MapClient({ className, description, emptyLabel, locations, title }: MapViewProps) {
  if (locations.length === 0) {
    return (
      <section className={cn("rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8", className)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-border/80 bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      </section>
    );
  }

  const center = getMapCenter(locations);

  return (
    <section className={className}>
      <MotionSurface className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8" layout>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <MapPinnedIcon className="size-3.5" aria-hidden="true" />
            <span className="tabular-nums">{locations.length}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-muted/20">
            <MapContainer
              attributionControl={false}
              center={center as LatLngExpression}
              className="h-[24rem] w-full"
              scrollWheelZoom={false}
              zoom={12}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ZoomControl position="bottomright" />

              {locations.map((location) => (
                <Marker
                  key={location.id}
                  icon={reservationMarkerIcon}
                  position={location.position as LatLngExpression}
                >
                  <Popup>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{location.name}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{location.note}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="grid gap-3">
            {locations.map((location, index) => (
              <MotionSurface
                key={location.id}
                className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
                delay={0.04 * index}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-background p-2.5 text-primary shadow-sm">
                    <MapPinnedIcon className="size-4.5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{location.name}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{location.note}</p>
                  </div>
                </div>
              </MotionSurface>
            ))}
          </div>
        </div>
      </MotionSurface>
    </section>
  );
}
