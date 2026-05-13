"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";

import { cn } from "@shared/lib";

type MotionSkeletonProps = {
  className?: string;
};

export function MotionSkeleton({ className }: MotionSkeletonProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        className={cn("bg-muted", className)}
        initial={{ opacity: 0.55 }}
        transition={{ duration: 1.35, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />
    </LazyMotion>
  );
}
