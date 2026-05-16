import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { resolveLocale, routing } from "@core/i18n";
import { getWebEnv } from "@core/env";
import { auth, signOut } from "@core/auth";

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
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Link
          href={`/${locale}/vehicles`}
          className="text-sm font-semibold tracking-tight"
        >
          Rental Car
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/vehicles`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("vehicles")}
          </Link>
          {session ? (
            <>
              <Link
                href={`/${locale}/bookings`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("myBookings")}
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </nav>
      {children}
    </NextIntlClientProvider>
  );
}
