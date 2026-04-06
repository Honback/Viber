"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { type Locale, DEFAULT_LOCALE, LOCALE_COOKIE, t } from "./translations";

type LocaleContextValue = {
  locale: Locale;
  toggleLocale: () => void;
  t: ReturnType<typeof t>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const toggleLocale = useCallback(() => {
    const next = locale === "ko" ? "en" : "ko";
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    setLocale(next);
    window.location.reload();
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t: t(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return { locale: DEFAULT_LOCALE, toggleLocale: () => {}, t: t(DEFAULT_LOCALE) };
  }
  return ctx;
}
