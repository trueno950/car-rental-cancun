import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { resolveLocale, routing } from "@core/i18n";
import { auth } from "@core/auth";

import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  if (resolveLocale(locale) !== locale) {
    redirect(`/${routing.defaultLocale}/bookings`);
  }

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = session.user.role;
  if (role !== "manager" && role !== "admin") {
    redirect(`/${locale}/bookings`);
  }

  const t = await getTranslations({ locale, namespace: "AdminLayout" });

  return (
    <div className="flex">
      <AdminSidebar
        locale={locale}
        labels={{ bookings: t("bookings"), fleet: t("fleet"), users: t("users") }}
      />
      <div className="flex-1 min-w-0 bg-muted/30">
        {children}
      </div>
    </div>
  );
}
