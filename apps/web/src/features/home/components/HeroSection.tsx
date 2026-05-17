"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type HeroSectionProps = {
  locale: string;
  headline: string;
  subheadline: string;
  ctaBrowse: string;
  ctaSignIn: string;
  showSignIn: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function HeroSection({
  locale,
  headline,
  subheadline,
  ctaBrowse,
  ctaSignIn,
  showSignIn,
}: HeroSectionProps) {
  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[oklch(0.10_0.015_200)]">
        <div
          className="absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "url(https://picsum.photos/seed/cancun-beach-resort/1920/1080)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.28) saturate(0.6)",
          }}
        />

        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 30% 60%, oklch(0.70 0.14 182 / 0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:py-40 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <FadeUp delay={0}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Cancun · Mexico
              </p>
            </FadeUp>

            <FadeUp delay={0.12}>
              <h1
                className="text-white font-bold leading-[1.08]"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.8rem)" }}
              >
                {headline}
              </h1>
            </FadeUp>

            <FadeUp delay={0.24}>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                {subheadline}
              </p>
            </FadeUp>

            <FadeUp delay={0.36}>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/vehicles`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
                >
                  {ctaBrowse}
                </Link>
                {showSignIn && (
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-4 text-sm font-semibold text-white hover:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                  >
                    {ctaSignIn}
                  </Link>
                )}
              </div>
            </FadeUp>

            <FadeUp delay={0.48}>
              <div className="flex gap-10 pt-4 border-t border-white/10">
                {[
                  { value: "100+", label: "Vehículos disponibles" },
                  { value: "4.9", label: "Estrellas de calificación" },
                  { value: "24h", label: "Atención al cliente" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          <m.div
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: EASE }}
            className="hidden lg:block relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/luxury-car-resort/800/600"
                alt="Flota de vehículos premium en Cancún"
                fill
                className="object-cover"
                style={{
                  filter: "contrast(1.1) saturate(0.85)",
                }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Desde</p>
                <p className="text-white text-2xl font-bold">
                  $41{" "}
                  <span className="text-sm font-normal text-white/60">/ día</span>
                </p>
                <p className="text-primary text-xs mt-1 font-medium">
                  Precio todo incluido · Sin sorpresas
                </p>
              </div>
            </div>

            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 pointer-events-none"
              style={{
                background: "var(--color-primary)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15 pointer-events-none"
              style={{
                background: "oklch(0.70 0.14 182)",
                filter: "blur(60px)",
              }}
            />
          </m.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>
    </LazyMotion>
  );
}
