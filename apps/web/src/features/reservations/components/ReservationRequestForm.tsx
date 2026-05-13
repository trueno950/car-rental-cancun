"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { CalendarDaysIcon, Clock3Icon, PlaneTakeoffIcon } from "lucide-react";
import {
  ReservationRequestFormSchema,
  type ReservationAvailabilityResponse,
  type ReservationRequestFormValues,
} from "@rental/validations";
import { useForm } from "react-hook-form";

import { MotionSurface } from "@shared/components/motion";
import { Button, Form } from "@shared/components/ui";

import { submitReservationAvailabilityAction } from "../actions/reservation-actions";
import {
  createReservationAvailabilityPayload,
  getBrowserTimeZone,
  getReservationNights,
  mapBlockedDates,
} from "../lib/date-range";
import type { ReservationRequestFormProps } from "../types";
import { FormErrorSummary } from "./FormErrorSummary";
import { ReservationDateRangeField } from "./ReservationDateRangeField";
import { RHFTextField } from "./RHFTextField";

export function ReservationRequestForm({ blockedDates, copy }: ReservationRequestFormProps) {
  const form = useForm<ReservationRequestFormValues>({
    resolver: zodResolver(ReservationRequestFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      pickupLocation: "Hotel Zone",
      timezone: "UTC",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [response, setResponse] = useState<ReservationAvailabilityResponse | null>(null);

  useEffect(() => {
    form.setValue("timezone", getBrowserTimeZone(), {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [form]);

  const blockedCalendarDates = mapBlockedDates(blockedDates);
  const dateRange = form.watch("dateRange");
  const nights = getReservationNights(dateRange);

  const previewPayload = (() => {
    if (!form.formState.isValid) {
      return null;
    }

    try {
      return createReservationAvailabilityPayload(form.getValues());
    } catch {
      return null;
    }
  })();

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setResponse(null);

    startTransition(async () => {
      try {
        const result = await submitReservationAvailabilityAction(createReservationAvailabilityPayload(values));
        setResponse(result);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : copy.submitError);
      }
    });
  });

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
      <MotionSurface className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
          RHF + Zod + Shadcn Calendar
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{copy.heading}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{copy.helper}</p>
        </div>
      </MotionSurface>

      <Form {...form}>
        <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={onSubmit}>
          <MotionSurface className="space-y-5" layout>
            <RHFTextField
              control={form.control}
              name="pickupLocation"
              label={copy.locationLabel}
              description={copy.locationDescription}
              placeholder="Hotel Zone"
            />
            <RHFTextField
              control={form.control}
              name="timezone"
              label={copy.timezoneLabel}
              description={copy.timezoneDescription}
              readOnly
            />
            <ReservationDateRangeField
              blockedDates={blockedCalendarDates}
              control={form.control}
              name="dateRange"
              label={copy.blockedDatesLabel}
              description={copy.dateRangeDescription}
            />

            <FormErrorSummary message={serverError} />

            {response ? (
              <MotionSurface className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <p className="font-medium">{copy.success}</p>
                <p>
                  {response.available ? "Available" : "Unavailable"} · {response.nights} nights · {response.timezone}
                </p>
              </MotionSurface>
            ) : null}

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Checking..." : copy.submit}
            </Button>
          </MotionSurface>

          <MotionSurface className="space-y-4 rounded-[1.75rem] border border-border/60 bg-muted/30 p-5" delay={0.06} layout>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-background p-3 text-primary shadow-sm">
                <Clock3Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium">Duration preview</p>
                <p className="text-sm text-muted-foreground">{nights > 0 ? `${nights} nights selected` : "Select a full range"}</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PlaneTakeoffIcon className="size-4 text-primary" aria-hidden="true" />
                Boundary payload preview
              </div>
              <pre className="overflow-x-auto rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                {previewPayload
                  ? JSON.stringify(previewPayload, null, 2)
                  : "Complete the form to preview the shared API contract."}
              </pre>
            </div>
          </MotionSurface>
        </form>
      </Form>
    </section>
  );
}
