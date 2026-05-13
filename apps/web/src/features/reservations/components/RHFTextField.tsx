"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from "@shared/components/ui";

interface RHFTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  description?: string;
  label: string;
  name: FieldPath<TFieldValues>;
  placeholder?: string;
  readOnly?: boolean;
}

export function RHFTextField<TFieldValues extends FieldValues>({
  control,
  description,
  label,
  name,
  placeholder,
  readOnly,
}: RHFTextFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              readOnly={readOnly}
              placeholder={placeholder}
              className="h-12 rounded-2xl"
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
