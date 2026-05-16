import { getTranslations } from "next-intl/server";
import { UserPlusIcon } from "lucide-react";

import { OAuthButtons, RegisterForm } from "@features/auth";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RegisterPage" });

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <UserPlusIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Rental Car Cancun
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {t("title")}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <OAuthButtons locale={locale} />
          <RegisterForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
