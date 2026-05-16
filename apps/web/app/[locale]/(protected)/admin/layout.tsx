import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { resolveLocale, routing } from "@core/i18n";
import { auth } from "@core/auth";

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

  return children;
}
