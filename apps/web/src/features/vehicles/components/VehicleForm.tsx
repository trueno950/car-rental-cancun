"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { CreateVehicleSchema } from "@rental/validations";
import type { CreateVehicleDto, UpdateVehicleDto, Vehicle } from "@rental/validations";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@shared/components/ui";

// Both create and edit use the same fields.
// For create, all fields are required (CreateVehicleSchema).
// For edit, we use the same resolver but the action accepts partial.
type FormValues = CreateVehicleDto;

type VehicleFormProps =
  | {
      mode: "create";
      initialValues?: never;
      onSubmit: (values: CreateVehicleDto) => Promise<Vehicle>;
    }
  | {
      mode: "edit";
      initialValues: Partial<Vehicle>;
      onSubmit: (values: UpdateVehicleDto) => Promise<Vehicle>;
    };

export function VehicleForm({
  mode,
  initialValues,
  onSubmit,
}: VehicleFormProps) {
  const t = useTranslations("VehicleAdminPage");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateVehicleSchema),
    mode: "onChange",
    defaultValues: {
      make: initialValues?.make ?? "",
      model: initialValues?.model ?? "",
      year: initialValues?.year ?? new Date().getFullYear(),
      dailyRate: initialValues?.dailyRate ?? 0,
      available: initialValues?.available ?? true,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "create") {
          await onSubmit(values);
        } else {
          await (
            onSubmit as (values: UpdateVehicleDto) => Promise<Vehicle>
          )(values);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.generic"));
      }
    });
  });

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === "create" ? t("form.title.create") : t("form.title.edit")}
        </h1>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fields.make")}</FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-2xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fields.model")}</FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-2xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fields.year")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={2000}
                    className="rounded-2xl"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dailyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fields.dailyRate")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="0.01"
                    className="rounded-2xl"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="vehicle-available"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                </FormControl>
                <FormLabel htmlFor="vehicle-available">
                  {t("form.fields.available")}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {error ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {mode === "create"
              ? t("form.submit.create")
              : t("form.submit.update")}
          </Button>
        </form>
      </Form>
    </section>
  );
}
