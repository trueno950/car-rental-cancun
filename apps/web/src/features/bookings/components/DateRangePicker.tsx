"use client";

import { useEffect, useState } from "react";
import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import {
  Button,
  Calendar,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui";
import { cn } from "@shared/lib";

function formatRange(range?: {
  from?: Date | undefined;
  to?: Date | undefined;
}) {
  if (!range?.from) return "Select pickup and return dates";
  if (!range.to) return format(range.from, "MMM d, yyyy");
  return `${format(range.from, "MMM d, yyyy")} → ${format(range.to, "MMM d, yyyy")}`;
}

interface DateRangePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  minDate?: Date;
}

export function DateRangePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  minDate = new Date(),
}: DateRangePickerProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <DateRangePickerControl field={field} label={label} minDate={minDate} />
      )}
    />
  );
}

interface DateRangePickerControlProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  label: string;
  minDate: Date;
}

function DateRangePickerControl<TFieldValues extends FieldValues>({
  field,
  label,
  minDate,
}: DateRangePickerControlProps<TFieldValues>) {
  const fieldValue = field.value as { from?: Date; to?: Date } | undefined;
  const [draft, setDraft] = useState<DateRange | undefined>(
    fieldValue?.from && fieldValue.to
      ? { from: fieldValue.from as Date, to: fieldValue.to as Date }
      : undefined,
  );

  useEffect(() => {
    if (fieldValue?.from && fieldValue.to) {
      setDraft({ from: fieldValue.from as Date, to: fieldValue.to as Date });
    } else {
      setDraft(undefined);
    }
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
                  !draft?.from && "text-muted-foreground",
                )}
              >
                <span>{formatRange(draft)}</span>
                <CalendarIcon className="size-4" aria-hidden="true" />
              </Button>
            }
          />
        </FormControl>
        <PopoverContent className="w-auto rounded-3xl p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={(range) => {
              setDraft(range);
              if (range?.from && range.to) {
                field.onChange({
                  from: startOfDay(range.from),
                  to: startOfDay(range.to),
                });
              } else {
                field.onChange(undefined);
              }
            }}
            disabled={(date) => startOfDay(date) < startOfDay(minDate)}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
