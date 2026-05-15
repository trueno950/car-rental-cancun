"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import { createBookingAction } from "../actions/booking-actions";
import type { BookingFormProps } from "../types";
import { DateRangePicker } from "./DateRangePicker";

const BookingFormSchema = z.object({
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((r) => r.to > r.from, {
      message: "Return date must be after pickup date",
    }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

export function BookingForm({
  vehicleId,
  vehicleLabel,
  copy,
}: BookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        const booking = await createBookingAction({
          vehicleId,
          startDate: values.dateRange.from.toISOString(),
          endDate: values.dateRange.to.toISOString(),
          notes: values.notes,
        });
        router.push(`/bookings/${booking.id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : copy.submitError;
        setError(
          message.includes("409") ? copy.conflictError : copy.submitError,
        );
      }
    });
  });

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {copy.heading}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.helper}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">{copy.vehicleLabel}: </span>
        <span className="font-medium">{vehicleLabel}</span>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={onSubmit}>
          <DateRangePicker
            control={form.control}
            name="dateRange"
            label={copy.dateRangeLabel}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{copy.notesLabel}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={copy.notesPlaceholder}
                    className="rounded-2xl"
                  />
                </FormControl>
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
            {isPending ? copy.submitting : copy.submit}
          </Button>
        </form>
      </Form>
    </section>
  );
}
