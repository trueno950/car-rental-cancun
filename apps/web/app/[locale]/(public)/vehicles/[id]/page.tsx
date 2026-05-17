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
  DoorOpen,
  Package,
  Weight,
  Shield,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { auth } from "@core/auth";
import {
  listVehiclesAction,
  getVehicleImageSeed,
  type VehicleView,
} from "@features/vehicles";

type VehicleDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function buildSpecItems(vehicle: VehicleView, tSpecs: (key: string) => string) {
  const items = [
    {
      icon: Users,
      label: tSpecs("labels.seats"),
      value: `${vehicle.seats} ${tSpecs("units.persons")}`,
    },
    {
      icon: DoorOpen,
      label: tSpecs("labels.doors"),
      value: `${vehicle.doors} ${tSpecs("units.doors")}`,
    },
    {
      icon: Zap,
      label: tSpecs("labels.transmissionType"),
      value: tSpecs(`transmission.${vehicle.transmissionType}`),
    },
    {
      icon: Fuel,
      label: tSpecs("labels.fuelType"),
      value: tSpecs(`fuel.${vehicle.fuelType}`),
    },
    {
      icon: Wind,
      label: tSpecs("labels.airConditioned"),
      value: vehicle.airConditioned ? tSpecs("units.yes") : tSpecs("units.no"),
    },
  ];

  if (vehicle.trunkLiters != null) {
    items.push({
      icon: Package,
      label: tSpecs("labels.trunkLiters"),
      value: `${vehicle.trunkLiters} ${tSpecs("units.liters")}`,
    });
  }

  if (vehicle.maxPayloadKg != null) {
    items.push({
      icon: Weight,
      label: tSpecs("labels.maxPayloadKg"),
      value: `${vehicle.maxPayloadKg} ${tSpecs("units.kg")}`,
    });
  }

  if (vehicle.airbags != null) {
    items.push({
      icon: Shield,
      label: tSpecs("labels.airbags"),
      value: `${vehicle.airbags} ${tSpecs("units.airbags")}`,
    });
  }

  return items;
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { locale, id } = await params;
  const [t, tCatalog, tSpecs] = await Promise.all([
    getTranslations({ locale, namespace: "VehicleDetailPage" }),
    getTranslations({ locale, namespace: "VehicleCatalogPage" }),
    getTranslations({ locale, namespace: "VehicleSpecs" }),
  ]);
  const session = await auth();

  const vehicles = await listVehiclesAction();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) notFound();

  const imageSeed = getVehicleImageSeed(
    vehicle.make,
    vehicle.model,
    vehicle.category,
  );
  const imageUrl =
    vehicle.imageUrl ?? `https://picsum.photos/seed/${imageSeed}/1200/800`;

  const dailyRate = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(vehicle.dailyRate);

  const specItems = buildSpecItems(vehicle, (key) =>
    tSpecs(key as Parameters<typeof tSpecs>[0]),
  );

  const included = [
    t("included.insurance"),
    t("included.taxes"),
    t("included.roadside"),
    t("included.mileage"),
    t("included.delivery"),
    t("included.confirmation"),
  ];

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="relative bg-foreground pt-28 pb-10 px-6">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 100%, var(--color-primary) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href={`/${locale}/vehicles`}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToFleet")}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                {vehicle.year} ·{" "}
                {vehicle.available
                  ? tCatalog("availabilityAvailable")
                  : tCatalog("availabilityUnavailable")}
              </p>
              <h1
                className="font-bold text-background leading-[1.08]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                {vehicle.make} {vehicle.model}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-background/50 text-xs mb-1">{t("from")}</p>
              <p className="text-background font-bold text-4xl leading-none">
                {dailyRate}
              </p>
              <p className="text-background/50 text-sm mt-1">
                /{tCatalog("perDay")} · {t("allInclusive")}
              </p>
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
              <span className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                {tSpecs(`category.${vehicle.category}`)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">{t("specsHeading")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">{t("includedHeading")}</h2>
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
              <h2 className="text-base font-bold mb-3">{t("pickupHeading")}</h2>
              <div className="space-y-3">
                {[
                  "Aeropuerto Internacional de Cancún (CUN)",
                  "Hoteles en Zona Hotelera",
                  "Centro de Cancún",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                {t("pickupNote")}
              </p>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{dailyRate}</span>
                  <span className="text-sm text-muted-foreground">
                    /{tCatalog("perDay")}
                  </span>
                </div>
                <p className="text-xs text-primary font-medium">
                  {t("priceTagline")}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {[
                    { icon: Shield, text: "Seguro incluido" },
                    { icon: MapPin, text: "Entrega a tu llegada" },
                    { icon: CalendarCheck, text: "Confirmación instantánea" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
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
                      {tCatalog("bookButton")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href={`/${locale}/login`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                      >
                        {t("loginToBook")}
                      </Link>
                      <p className="text-xs text-muted-foreground text-center">
                        {t("noAccount")}{" "}
                        <Link
                          href={`/${locale}/register`}
                          className="text-primary hover:underline"
                        >
                          {t("register")}
                        </Link>
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl bg-muted px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                    {tCatalog("availabilityUnavailable")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs text-primary font-medium mb-1.5">
                {t("cancellationTitle")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("cancellationText")}
              </p>
            </div>

            <Link
              href={`/${locale}/vehicles`}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("viewOtherVehicles")}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
