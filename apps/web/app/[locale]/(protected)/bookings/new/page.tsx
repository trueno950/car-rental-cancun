import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarCheck, Shield, MapPin } from "lucide-react";
import Link from "next/link";

import { BookingForm } from "@features/bookings";
import type { BookingFormCopy } from "@features/bookings";
import { getVehicleByIdAction } from "@features/vehicles";

type BookingNewPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vehicleId?: string; vehicleLabel?: string }>;
};

export default async function BookingNewPage({
  params,
  searchParams,
}: BookingNewPageProps) {
  const { locale } = await params;
  const { vehicleId } = await searchParams;

  if (!vehicleId) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "BookingNewPage" });
  const vehicle = await getVehicleByIdAction(vehicleId);

  const copy: BookingFormCopy = {
    heading: t("heading"),
    helper: t("helper"),
    vehicleLabel: t("vehicleLabel"),
    dateRangeLabel: t("dateRangeLabel"),
    dateRangePlaceholder: t("dateRangePlaceholder"),
    notesLabel: t("notesLabel"),
    notesPlaceholder: t("notesPlaceholder"),
    submit: t("submit"),
    submitting: t("submitting"),
    submitError: t("submitError"),
    conflictError: t("conflictError"),
  };

  const vehicleLabel = vehicle
    ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
    : vehicleId;

  const dailyRate = vehicle
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(vehicle.dailyRate)
    : null;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href={`/${locale}/vehicles`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            Volver al catálogo
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div>
            <BookingForm
              vehicleId={vehicleId}
              vehicleLabel={vehicleLabel}
              copy={copy}
            />
          </div>

          <aside className="space-y-4">
            {vehicle && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div
                  className="h-44 bg-muted relative"
                  style={{
                    backgroundImage: `url(https://picsum.photos/seed/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}/600/360)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "contrast(1.05) saturate(0.85)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-bold text-lg leading-tight">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-white/70 text-sm">{vehicle.year}</p>
                  </div>
                </div>
                <div className="p-5">
                  {dailyRate && (
                    <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-border">
                      <span className="text-2xl font-bold text-foreground">{dailyRate}</span>
                      <span className="text-sm text-muted-foreground">/ día</span>
                    </div>
                  )}
                  <ul className="space-y-2.5">
                    {[
                      { icon: Shield, text: "Seguro incluido en el precio" },
                      { icon: MapPin, text: "Entrega en aeropuerto o hotel" },
                      { icon: CalendarCheck, text: "Confirmación inmediata" },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs text-primary font-medium mb-1">Sin cargos ocultos</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El precio que ves incluye seguro, impuestos y entrega. Sin letras chicas.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
