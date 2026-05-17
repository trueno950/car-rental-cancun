"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import {
  CreateVehicleSchema,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  VEHICLE_CATEGORIES,
} from "@rental/validations";
import type { CreateVehicleDto, UpdateVehicleDto } from "@rental/validations";
import type { VehicleView } from "../view-model";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  Switch,
} from "@shared/components/ui";
import { VehicleImageUpload } from "./VehicleImageUpload";

type FormValues = CreateVehicleDto;

type VehicleFormProps =
  | {
      mode: "create";
      locale: string;
      initialValues?: never;
      onSubmit: (values: CreateVehicleDto) => Promise<VehicleView>;
    }
  | {
      mode: "edit";
      locale: string;
      initialValues: Partial<VehicleView>;
      onSubmit: (values: UpdateVehicleDto) => Promise<VehicleView>;
    };

export function VehicleForm({
  mode,
  locale,
  initialValues,
  onSubmit,
}: VehicleFormProps) {
  const t = useTranslations("VehicleAdminPage");
  const tSpecs = useTranslations("VehicleSpecs");
  const router = useRouter();
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
      seats: initialValues?.seats ?? 5,
      doors: initialValues?.doors ?? 4,
      trunkLiters: initialValues?.trunkLiters ?? null,
      maxPayloadKg: initialValues?.maxPayloadKg ?? null,
      transmissionType: initialValues?.transmissionType ?? "automatic",
      fuelType: initialValues?.fuelType ?? "gasoline",
      category: initialValues?.category ?? "compact",
      airConditioned: initialValues?.airConditioned ?? true,
      airbags: initialValues?.airbags ?? null,
      licensePlate: initialValues?.licensePlate ?? null,
      color: initialValues?.color ?? null,
      imageUrl: initialValues?.imageUrl ?? null,
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
            onSubmit as (values: UpdateVehicleDto) => Promise<VehicleView>
          )(values);
        }
        router.push(`/${locale}/admin/vehicles`);
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
          {/* ── Image ── */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fields.imageUrl")}</FormLabel>
                <FormControl>
                  <VehicleImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    labels={{
                      upload: t("form.image.upload"),
                      change: t("form.image.change"),
                      remove: t("form.image.remove"),
                      uploading: t("form.image.uploading"),
                      error: t("form.image.error"),
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Basic info ── */}
          <div className="grid sm:grid-cols-2 gap-5">
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
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
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
          </div>

          {/* ── License plate & color ── */}
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.licensePlate")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.value,
                        )
                      }
                      className="rounded-2xl uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.color")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.value,
                        )
                      }
                      className="rounded-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Category & transmission ── */}
          <div className="grid sm:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.category")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {Object.values(VEHICLE_CATEGORIES).map((c) => (
                        <option key={c} value={c}>
                          {tSpecs(`category.${c}`)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.transmissionType")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {Object.values(TRANSMISSION_TYPES).map((tx) => (
                        <option key={tx} value={tx}>
                          {tSpecs(`transmission.${tx}`)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.fuelType")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {Object.values(FUEL_TYPES).map((f) => (
                        <option key={f} value={f}>
                          {tSpecs(`fuel.${f}`)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Capacity ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.seats")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={20}
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
              name="doors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.doors")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={2}
                      max={8}
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
              name="trunkLiters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.trunkLiters")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="rounded-2xl"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxPayloadKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.maxPayloadKg")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="rounded-2xl"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="airbags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.airbags")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="rounded-2xl"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 justify-end pb-1">
              <FormField
                control={form.control}
                name="airConditioned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch
                        id="vehicle-air-conditioned"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="vehicle-air-conditioned">
                      {t("form.fields.airConditioned")}
                    </FormLabel>
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
                      <Switch
                        id="vehicle-available"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="vehicle-available">
                      {t("form.fields.available")}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
