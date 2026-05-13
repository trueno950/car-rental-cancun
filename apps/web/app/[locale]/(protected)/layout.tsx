import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { resolveLocale, routing } from "@core/i18n";
import { auth } from "../../../auth";

type ProtectedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;

  if (resolveLocale(locale) !== locale) {
    redirect(`/${routing.defaultLocale}/login`);
  }

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return children;
}
