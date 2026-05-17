import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Fuel,
  Zap,
  Wind,
  Shield,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { auth } from "@core/auth";
import { listVehiclesAction } from "@features/vehicles";
import { getVehicleSpecs, getVehicleImageSeed } from "@features/vehicles/lib/vehicle-specs";

type VehicleDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "VehicleCatalogPage" });
  const session = await auth();

  const vehicles = await listVehiclesAction();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) notFound();

  const specs = getVehicleSpecs(vehicle.make, vehicle.model);
  const imageSeed = getVehicleImageSeed(vehicle.make, vehicle.model);
  const imageUrl = `https://picsum.photos/seed/${imageSeed}/1200/800`;

  const dailyRate = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(vehicle.dailyRate);

  const specItems = [
    { icon: Users, label: "Pasajeros", value: `${specs.seats} personas` },
    { icon: Zap, label: "Transmisión", value: specs.transmission },
    { icon: Fuel, label: "Combustible", value: specs.fuel },
    { icon: Wind, label: "Climatización", value: "Aire acondicionado" },
  ];

  const included = [
    "Seguro de responsabilidad civil incluido",
    "Impuestos y cargos incluidos",
    "Asistencia en carretera 24/7",
    "Sin cobros por kilometraje",
    "Entrega en aeropuerto o hotel",
    "Confirmación instantánea de reserva",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="relative bg-foreground pt-28 pb-10 px-6">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 100%, var(--color-primary) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href={`/${locale}/vehicles`}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Nuestra flota
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                {vehicle.year} · {vehicle.available ? t("availabilityAvailable") : t("availabilityUnavailable")}
              </p>
              <h1
                className="font-bold text-background leading-[1.08]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                {vehicle.make} {vehicle.model}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-background/50 text-xs mb-1">Desde</p>
              <p className="text-background font-bold text-4xl leading-none">
                {dailyRate}
              </p>
              <p className="text-background/50 text-sm mt-1">/{t("perDay")} · todo incluido</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-8">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-lg">
              <Image
                src={imageUrl}
                alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                fill
                className="object-cover"
                style={{ filter: "contrast(1.08) saturate(0.85)" }}
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
              {specs.tags.map((tag) => (
                <span
                  key={tag}
                  className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Especificaciones</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Incluido en el precio</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 border border-border p-6">
              <h2 className="text-base font-bold mb-3">Entrega y devolución</h2>
              <div className="space-y-3">
                {[
                  { icon: MapPin, text: "Aeropuerto Internacional de Cancún (CUN)" },
                  { icon: MapPin, text: "Hoteles en Zona Hotelera" },
                  { icon: MapPin, text: "Centro de Cancún" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                Coordinamos la entrega al confirmar tu reserva. Sin costo adicional.
              </p>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{dailyRate}</span>
                  <span className="text-sm text-muted-foreground">/{t("perDay")}</span>
                </div>
                <p className="text-xs text-primary font-medium">Precio todo incluido · Sin sorpresas</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {[
                    { icon: Shield, text: "Seguro incluido" },
                    { icon: MapPin, text: "Entrega a tu llegada" },
                    { icon: CalendarCheck, text: "Confirmación instantánea" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                {vehicle.available ? (
                  session ? (
                    <Link
                      href={`/${locale}/bookings/new?vehicleId=${vehicle.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.01]"
                    >
                      {t("bookButton")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href={`/${locale}/login`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                      >
                        Iniciar sesión para reservar
                      </Link>
                      <p className="text-xs text-muted-foreground text-center">
                        ¿No tenés cuenta?{" "}
                        <Link href={`/${locale}/register`} className="text-primary hover:underline">
                          Registrate gratis
                        </Link>
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl bg-muted px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                    {t("availabilityUnavailable")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs text-primary font-medium mb-1.5">Cancelación flexible</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Modificá o cancelá tu reserva hasta 48h antes de la entrega sin costo.
              </p>
            </div>

            <Link
              href={`/${locale}/vehicles`}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver otros vehículos
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
