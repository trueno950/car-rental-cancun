import { beforeEach, describe, expect, it } from "vitest";

import { generateMetadata } from "../../app/[locale]/layout";

describe("locale metadata", () => {
  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/rental_car_cancun",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "super-secret-value",
      NEXT_PUBLIC_SITE_URL: "https://rental-car-cancun.test",
    };
  });

  it("emits hreflang alternates for both supported locales", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "es" }) });

    expect(metadata.alternates?.languages?.es).toBe("/es");
    expect(metadata.alternates?.languages?.en).toBe("/en");
  });
});
