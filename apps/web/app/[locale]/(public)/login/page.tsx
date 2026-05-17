import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { OAuthButtons, LoginForm } from "@features/auth";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { registered } = await searchParams;
  const t = await getTranslations({ locale, namespace: "LoginPage" });

  return (
    <main className="flex min-h-screen">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "oklch(0.10 0.015 200)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url(https://picsum.photos/seed/cancun-coastal-road/900/1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.25) saturate(0.5)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 80%, oklch(0.70 0.14 182 / 0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <Link
            href={`/${locale}`}
            className="text-white font-bold text-lg tracking-tight"
          >
            CancunRent
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <p
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
          >
            Tu aventura en Cancún
            <br />
            empieza con un clic.
          </p>
          <div className="flex gap-8 pt-6 border-t border-white/10">
            {[
              { value: "100+", label: "Vehículos" },
              { value: "4.9", label: "Calificación" },
              { value: "24h", label: "Soporte" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link
              href={`/${locale}`}
              className="lg:hidden text-sm font-bold text-foreground mb-6 inline-block"
            >
              CancunRent
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {registered && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-700">
              {t("registeredSuccess")}
            </div>
          )}

          <div className="space-y-5">
            <OAuthButtons locale={locale} />
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <LoginForm locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
