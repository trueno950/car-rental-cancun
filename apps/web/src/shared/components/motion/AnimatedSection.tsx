"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@shared/lib";

const EASE = [0.22, 1, 0.36, 1] as const;

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const initial = {
    opacity: 0,
    y: direction === "up" ? 40 : 0,
    x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={ref}
        initial={initial}
        animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
        transition={{
          delay,
          duration: 0.7,
          ease: EASE,
        }}
        className={cn(className)}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
