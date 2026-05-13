import { hasLocale, type AbstractIntlMessages } from "next-intl";

import { defaultLocale, routing, type AppLocale } from "./routing";

type NestedMessages = Record<string, AbstractIntlMessages | string>;

export function resolveLocale(locale: string | undefined): AppLocale {
  return hasLocale(routing.locales, locale) ? locale : defaultLocale;
}

async function importMessages(locale: AppLocale) {
  return (await import(`../../../messages/${locale}.json`)).default as NestedMessages;
}

function mergeMessages(base: NestedMessages, override: NestedMessages): NestedMessages {
  const mergedEntries = Object.entries(base).map(([key, value]) => {
    const overrideValue = override[key];

    if (typeof value === "string" || typeof overrideValue === "string" || !overrideValue) {
      return [key, overrideValue ?? value];
    }

    return [key, mergeMessages(value as NestedMessages, overrideValue as NestedMessages)];
  });

  const extraEntries = Object.entries(override).filter(([key]) => !(key in base));

  return Object.fromEntries([...mergedEntries, ...extraEntries]);
}

export async function loadMessages(locale: string | undefined) {
  const resolvedLocale = resolveLocale(locale);
  const baseMessages = await importMessages(defaultLocale);

  if (resolvedLocale === defaultLocale) {
    return {
      locale: resolvedLocale,
      messages: baseMessages,
    };
  }

  const localeMessages = await importMessages(resolvedLocale);

  return {
    locale: resolvedLocale,
    messages: mergeMessages(baseMessages, localeMessages),
  };
}
