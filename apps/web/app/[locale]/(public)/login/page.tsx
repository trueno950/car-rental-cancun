import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";

import { signIn } from "@core/auth";
import { Button } from "@shared/components/ui";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LoginPage" });

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ShieldCheckIcon className="size-5" aria-hidden="true" />
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

        <form
          action={async () => {
            "use server";

            await signIn("github", { redirectTo: `/${locale}/vehicles` });
          }}
          className="space-y-4"
        >
          <Button className="w-full justify-between" size="lg" type="submit">
            {t("cta")}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Acceso seguro con GitHub. La autenticación sigue delegada al backend
            y al provider configurado.
          </p>
        </form>
      </section>
    </main>
  );
}
