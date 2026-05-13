"use client";

import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import {
  Button,
  Calendar,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui";
import { cn } from "@shared/lib";

import { formatReservationDateRange, isBlockedDate } from "../lib/date-range";

interface ReservationDraftRange {
  from?: Date | undefined;
  to?: Date | undefined;
}

interface ReservationDateRangeFieldProps<TFieldValues extends FieldValues> {
  blockedDates: readonly Date[];
  control: Control<TFieldValues>;
  description?: string | undefined;
  label: string;
  minDate?: Date;
  name: FieldPath<TFieldValues>;
}

export function ReservationDateRangeField<TFieldValues extends FieldValues>({
  blockedDates,
  control,
  description,
  label,
  minDate = new Date(),
  name,
}: ReservationDateRangeFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <ReservationDateRangeFieldControl
          blockedDates={blockedDates}
          description={description}
          field={field}
          label={label}
          minDate={minDate}
        />
      )}
    />
  );
}

interface ReservationDateRangeFieldControlProps<TFieldValues extends FieldValues> {
  blockedDates: readonly Date[];
  description?: string | undefined;
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  label: string;
  minDate: Date;
}

function ReservationDateRangeFieldControl<TFieldValues extends FieldValues>({
  blockedDates,
  description,
  field,
  label,
  minDate,
}: ReservationDateRangeFieldControlProps<TFieldValues>) {
  const fieldValue = field.value as ReservationDraftRange | undefined;
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    fieldValue?.from && fieldValue.to
      ? {
          from: fieldValue.from,
          to: fieldValue.to,
        }
      : undefined,
  );

  useEffect(() => {
    if (fieldValue?.from && fieldValue.to) {
      setDraftRange({
        from: fieldValue.from,
        to: fieldValue.to,
      });
      return;
    }

    setDraftRange(undefined);
  }, [fieldValue?.from, fieldValue?.to]);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Popover>
        <FormControl>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-between rounded-2xl px-4 py-6 text-left font-normal",
                  !draftRange?.from && "text-muted-foreground",
                )}
              >
                <span>{formatReservationDateRange(draftRange as ReservationDraftRange | undefined)}</span>
                <CalendarIcon className="size-4" aria-hidden="true" />
              </Button>
            }
          />
        </FormControl>
        <PopoverContent className="w-auto rounded-3xl p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draftRange}
            onSelect={(range) => {
              setDraftRange(range);

              if (range?.from && range.to) {
                field.onChange({
                  from: startOfDay(range.from),
                  to: startOfDay(range.to),
                });
                return;
              }

              field.onChange(undefined);
            }}
            disabled={(date) => {
              const normalizedDate = startOfDay(date);
              return normalizedDate < startOfDay(minDate) || isBlockedDate(normalizedDate, blockedDates);
            }}
          />
        </PopoverContent>
      </Popover>
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage />
    </FormItem>
  );
}
