import { getTranslations } from "next-intl/server";
import { Activity, Car, CheckCircle, Clock, DollarSign, Users } from "lucide-react";

import type { BookingStatus } from "@rental/validations";

import { getAllBookingsAction } from "@features/bookings";
import { listVehiclesAction } from "@features/vehicles";
import { listUsersAction } from "@features/users";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type KpiCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

function KpiCard({ label, value, sub, Icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-start gap-4">
      <span className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground/60">{sub}</p> : null}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminDashboardPage" });

  const [bookings, vehicles, users] = await Promise.all([
    getAllBookingsAction(),
    listVehiclesAction(),
    listUsersAction(),
  ]);

  const byStatus = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<BookingStatus, number>>,
  );

  const completedRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingActions = (byStatus.pending ?? 0) + (byStatus.confirmed ?? 0);
  const availableVehicles = vehicles.filter((v) => v.available).length;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <KpiCard
            label={t("stats.completedRevenue")}
            value={formatCurrency(completedRevenue)}
            sub={t("stats.completedRevenueHint")}
            Icon={DollarSign}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <KpiCard
            label={t("stats.activeRentals")}
            value={byStatus.active ?? 0}
            Icon={Activity}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <KpiCard
            label={t("stats.pendingActions")}
            value={pendingActions}
            sub={t("stats.pendingActionsHint")}
            Icon={Clock}
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <KpiCard
            label={t("stats.availableVehicles")}
            value={`${availableVehicles} / ${vehicles.length}`}
            Icon={Car}
            accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
          <KpiCard
            label={t("stats.completedBookings")}
            value={byStatus.completed ?? 0}
            Icon={CheckCircle}
            accent="bg-slate-500/10 text-slate-600 dark:text-slate-400"
          />
          <KpiCard
            label={t("stats.totalUsers")}
            value={users.length}
            Icon={Users}
            accent="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          />
        </div>
      </div>
    </main>
  );
}
