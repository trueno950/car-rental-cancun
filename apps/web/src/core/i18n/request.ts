import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const { locale, messages } = await loadMessages(await requestLocale);

  return {
    locale,
    messages,
  };
});
