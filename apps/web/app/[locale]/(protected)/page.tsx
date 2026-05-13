import { getTranslations } from "next-intl/server";

import { auth } from "../../../auth";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: session?.user?.name ?? "Cliente" })}</p>
      <p>{t("apiReady", { token: session?.apiAccessToken ? "ready" : "missing" })}</p>
    </main>
  );
}
