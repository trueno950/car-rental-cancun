import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { OAuthButtons, RegisterForm } from "@features/auth";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RegisterPage" });

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
              "url(https://picsum.photos/seed/cancun-resort-sunset/900/1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.25) saturate(0.5)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 70% 20%, oklch(0.70 0.14 182 / 0.25) 0%, transparent 70%)",
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
            Creá tu cuenta,
            <br />
            manejá sin límites.
          </p>
          <ul className="space-y-3">
            {[
              "Reservas en minutos",
              "Precio todo incluido, sin sorpresas",
              "Entrega en aeropuerto o hotel",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
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

          <div className="space-y-5">
            <OAuthButtons locale={locale} />
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <RegisterForm locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
