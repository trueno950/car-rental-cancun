"use client";

import { useRef } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

import type { VehicleGridProps } from "../types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ vehicles, copy, locale }: VehicleGridProps) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (vehicles.length === 0) {
    return (
      <section
        role="status"
        className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center"
      >
        <h2 className="text-lg font-semibold">{copy.emptyTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.emptyDescription}</p>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <ul
        ref={ref}
        role="list"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {vehicles.map((vehicle, i) => (
          <m.li
            key={vehicle.id}
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
            transition={{
              delay: i * 0.1,
              duration: 0.65,
              ease: EASE,
            }}
          >
            <VehicleCard vehicle={vehicle} copy={copy} locale={locale} />
          </m.li>
        ))}
      </ul>
    </LazyMotion>
  );
}
