import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en"] as const;
export const defaultLocale = "es";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export type AppLocale = (typeof locales)[number];
