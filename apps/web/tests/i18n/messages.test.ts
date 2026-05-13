import { describe, expect, it } from "vitest";

import { loadMessages, resolveLocale } from "../../src/core/i18n";

describe("i18n messages", () => {
  it("redirects unknown locales to the default locale", () => {
    expect(resolveLocale("fr")).toBe("es");
  });

  it("falls back to the default locale when a translation key is missing", async () => {
    const { locale, messages } = await loadMessages("en");
    const nav = messages.nav as { home: string };

    expect(locale).toBe("en");
    expect(nav.home).toBe("Inicio");
  });
});
