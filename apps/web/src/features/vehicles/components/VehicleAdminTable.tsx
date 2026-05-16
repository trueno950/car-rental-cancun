"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import type { Vehicle } from "@rental/validations";

import { Button } from "@shared/components/ui";

import { deleteVehicleAction } from "../actions/vehicle-actions";

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

type VehicleRowProps = {
  vehicle: Vehicle;
  locale: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirm: string;
  availableLabel: string;
  unavailableLabel: string;
};

function VehicleRow({
  vehicle,
  locale,
  editLabel,
  deleteLabel,
  deleteConfirm,
  availableLabel,
  unavailableLabel,
}: VehicleRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(deleteConfirm)) return;
    startTransition(async () => {
      await deleteVehicleAction(vehicle.id);
    });
  }

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 font-medium">{vehicle.make}</td>
      <td className="px-4 py-3">{vehicle.model}</td>
      <td className="px-4 py-3">{vehicle.year}</td>
      <td className="px-4 py-3 font-medium">
        {formatCurrency(vehicle.dailyRate, locale)}
      </td>
      <td className="px-4 py-3">
        <span
          className={
            vehicle.available
              ? "inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700"
              : "inline-flex w-fit items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {vehicle.available ? availableLabel : unavailableLabel}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <Pencil className="h-3 w-3" />
            {editLabel}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
            {deleteLabel}
          </Button>
        </div>
      </td>
    </tr>
  );
}

type VehicleAdminTableProps = {
  vehicles: Vehicle[];
  locale: string;
};

export function VehicleAdminTable({ vehicles, locale }: VehicleAdminTableProps) {
  const t = useTranslations("VehicleAdminPage");

  if (vehicles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {[
              t("table.columns.make"),
              t("table.columns.model"),
              t("table.columns.year"),
              t("table.columns.dailyRate"),
              t("table.columns.available"),
              t("table.columns.actions"),
            ].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vehicles.map((vehicle) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              locale={locale}
              editLabel={t("table.actions.edit")}
              deleteLabel={t("table.actions.delete")}
              deleteConfirm={t("table.actions.deleteConfirm")}
              availableLabel={t("availability.available")}
              unavailableLabel={t("availability.unavailable")}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
