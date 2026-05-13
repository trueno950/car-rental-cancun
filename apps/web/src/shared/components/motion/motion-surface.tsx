"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

import { cn } from "@shared/lib";

type MotionSurfaceProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  layout?: boolean;
};

export function MotionSurface({ children, className, delay = 0, layout = false }: MotionSurfaceProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ opacity: 1, y: 0 }}
        className={cn(className)}
        initial={{ opacity: 0, y: 12 }}
        layout={layout}
        transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
