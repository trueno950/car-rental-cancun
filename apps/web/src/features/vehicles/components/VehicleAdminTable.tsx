"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import type { Vehicle } from "@rental/validations";

import { cn } from "@shared/lib";
import { ConfirmDialog } from "@shared/components/ui";

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
  deleteTitle: string;
  deleteConfirm: string;
  cancelLabel: string;
  availableLabel: string;
  unavailableLabel: string;
};

function VehicleRow({
  vehicle,
  locale,
  editLabel,
  deleteLabel,
  deleteTitle,
  deleteConfirm,
  cancelLabel,
  availableLabel,
  unavailableLabel,
}: VehicleRowProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDeleteConfirm() {
    startTransition(async () => {
      await deleteVehicleAction(vehicle.id);
    });
  }

  return (
    <>
      <tr className="hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3 font-medium">{vehicle.make}</td>
        <td className="px-4 py-3">{vehicle.model}</td>
        <td className="px-4 py-3">{vehicle.year}</td>
        <td className="px-4 py-3 font-medium">
          {formatCurrency(vehicle.dailyRate, locale)}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              vehicle.available
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            {vehicle.available ? availableLabel : unavailableLabel}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/admin/vehicles/${vehicle.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Pencil className="size-3" />
              {editLabel}
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="size-3" />
              {deleteLabel}
            </button>
          </div>
        </td>
      </tr>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={deleteTitle}
        description={deleteConfirm}
        confirmLabel={deleteLabel}
        cancelLabel={cancelLabel}
        onConfirm={handleDeleteConfirm}
        isPending={isPending}
      />
    </>
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
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
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
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
              deleteTitle={t("table.actions.deleteTitle")}
              deleteConfirm={t("table.actions.deleteConfirm")}
              cancelLabel={t("form.cancel")}
              availableLabel={t("availability.available")}
              unavailableLabel={t("availability.unavailable")}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
