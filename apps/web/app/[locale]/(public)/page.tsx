import { CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { auth } from "@core/auth";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const session = await auth();

  const features = [
    {
      icon: ShieldCheck,
      title: t("feature1Title"),
      description: t("feature1Description"),
    },
    {
      icon: MapPin,
      title: t("feature2Title"),
      description: t("feature2Description"),
    },
    {
      icon: CalendarCheck,
      title: t("feature3Title"),
      description: t("feature3Description"),
    },
  ];

  return (
    <main>
      <section className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-8 px-4 py-20 text-center sm:px-6">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Cancun
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t("headline")}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground text-balance">
            {t("subheadline")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/vehicles`}
            className="rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {t("ctaBrowse")}
          </Link>
          {!session && (
            <Link
              href={`/${locale}/login`}
              className="rounded-2xl border border-border px-7 py-3 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              {t("ctaSignIn")}
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
