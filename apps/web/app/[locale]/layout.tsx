import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { resolveLocale, routing } from "@core/i18n";
import { getWebEnv } from "@core/env";
import { auth, signOut } from "@core/auth";
import { NavBar } from "@shared/components/ui/NavBar";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const env = getWebEnv();

  if (resolveLocale(locale) !== locale) {
    notFound();
  }

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (resolveLocale(locale) !== locale) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });
  const session = await auth();

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: `/${locale}/login` });
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NavBar
        locale={locale}
        session={session}
        navLabels={{
          vehicles: t("vehicles"),
          myBookings: t("myBookings"),
          adminVehicles: t("adminVehicles"),
          signIn: t("signIn"),
          signOut: t("signOut"),
        }}
        signOutAction={signOutAction}
      />
      {children}
    </NextIntlClientProvider>
  );
}
