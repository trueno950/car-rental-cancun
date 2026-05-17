import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ShieldCheck,
  MapPin,
  CalendarCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { auth } from "@core/auth";
import { HeroSection } from "@features/home";
import { TrustMarquee } from "@shared/components/ui/TrustMarquee";
import { AnimatedSection } from "@shared/components/motion/AnimatedSection";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const session = await auth();

  const features = [
    {
      icon: ShieldCheck,
      title: t("feature1Title"),
      description: t("feature1Description"),
      span: "col-span-2",
      highlight: true,
    },
    {
      icon: MapPin,
      title: t("feature2Title"),
      description: t("feature2Description"),
      span: "col-span-1",
      highlight: false,
    },
    {
      icon: CalendarCheck,
      title: t("feature3Title"),
      description: t("feature3Description"),
      span: "col-span-1",
      highlight: false,
    },
    {
      icon: Sparkles,
      title: "Flota 2022–2024",
      description: "Vehículos modernos con mantenimiento riguroso. Siempre en óptimas condiciones para tu viaje.",
      span: "col-span-2",
      highlight: false,
    },
  ];

  return (
    <main className="overflow-x-hidden w-full">
      <HeroSection
        locale={locale}
        headline={t("headline")}
        subheadline={t("subheadline")}
        ctaBrowse={t("ctaBrowse")}
        ctaSignIn={t("ctaSignIn")}
        showSignIn={!session}
      />

      <TrustMarquee />

      <section className="px-6 py-24 md:py-36 max-w-7xl mx-auto">
        <AnimatedSection className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Por qué elegirnos
          </p>
          <h2
            className="font-bold text-foreground max-w-2xl leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
          >
            Renta sin complicaciones,
            <br />
            experiencia sin igual
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 grid-auto-flow-dense">
          {features.map((feat, i) => (
            <AnimatedSection
              key={feat.title}
              delay={i * 0.08}
              className={
                i === 0 || i === 3
                  ? "lg:col-span-2"
                  : "lg:col-span-1"
              }
            >
              <div
                className={`h-full rounded-2xl border border-border p-7 flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/30 ${
                  feat.highlight
                    ? "bg-primary/5"
                    : "bg-card"
                }`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                    feat.highlight ? "bg-primary/15" : "bg-muted"
                  }`}
                >
                  <feat.icon
                    className={`h-5 w-5 ${feat.highlight ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{feat.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feat.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border px-6 py-24 md:py-36">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Nuestra flota
              </p>
              <h2
                className="font-bold text-foreground leading-[1.1]"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
              >
                Autos para cada
                <br />
                tipo de viaje
              </h2>
            </div>
            <Link
              href={`/${locale}/vehicles`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: "Económicos",
                description: "Perfectos para explorar la ciudad. Bajo consumo, fácil estacionamiento.",
                from: "Desde $41/día",
                seed: "compact-silver-car",
                bg: "from-sky-900/60",
              },
              {
                title: "SUV y 4x4",
                description: "Aventura sin límites. Ideales para Tulum, Chichen Itzá y cenotes.",
                from: "Desde $98/día",
                seed: "jeep-offroad-adventure",
                bg: "from-emerald-900/60",
              },
              {
                title: "Sedanes premium",
                description: "Viajes de negocio o vacaciones familiares con máximo confort.",
                from: "Desde $62/día",
                seed: "vw-sedan-silver",
                bg: "from-violet-900/60",
              },
            ].map((cat, i) => (
              <AnimatedSection key={cat.title} delay={i * 0.12}>
                <Link
                  href={`/${locale}/vehicles`}
                  className="group relative block h-72 rounded-2xl overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-center bg-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      backgroundImage: `url(https://picsum.photos/seed/${cat.seed}/600/400)`,
                      filter: "contrast(1.1) saturate(0.7) brightness(0.85)",
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${cat.bg} via-transparent to-transparent`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white font-bold text-xl leading-tight">{cat.title}</p>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">{cat.description}</p>
                    <p className="text-primary font-semibold text-sm mt-3">{cat.from}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-36 max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="rounded-3xl bg-foreground px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 60% 80% at 50% 120%, var(--color-primary) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                Reservá hoy
              </p>
              <h2
                className="font-bold text-background leading-[1.1] mb-5"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Tu aventura en Cancún
                <br />
                empieza aquí
              </h2>
              <p className="text-background/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Explorá nuestra flota y reservá en minutos. Precio todo incluido, sin sorpresas.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href={`/${locale}/vehicles`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
                >
                  Ver nuestra flota
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {!session && (
                  <Link
                    href={`/${locale}/register`}
                    className="inline-flex items-center rounded-full border border-background/20 bg-background/10 px-8 py-4 text-sm font-semibold text-background hover:bg-background/20 transition-all duration-200 backdrop-blur-sm"
                  >
                    Crear cuenta gratis
                  </Link>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-foreground">CancunRent</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} · Renta de autos en Cancún · Todos los derechos reservados
          </p>
          <div className="flex gap-6">
            <Link
              href={`/${locale}/vehicles`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Flota
            </Link>
            {!session && (
              <Link
                href={`/${locale}/login`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
