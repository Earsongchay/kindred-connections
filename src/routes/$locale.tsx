import { createFileRoute, Outlet, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import i18n, { isLocale, type Locale, DEFAULT_LOCALE } from "@/i18n";
import { sessionForm } from "@/lib/session-form";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) throw notFound();
    // Sync i18next on both client and server before render.
    if (i18n.language !== params.locale) {
      void i18n.changeLanguage(params.locale);
    }
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useParams() as { locale: Locale };
  const navigate = useNavigate();

  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // T12 — browser language detection (client-side, first visit only)
  useEffect(() => {
    if (sessionForm.isLangDetected()) return;
    sessionForm.setLangDetected();
    const browserLang = navigator.language ?? "";
    if (browserLang.startsWith("en") && locale === DEFAULT_LOCALE) {
      void navigate({ to: "/$locale", params: { locale: "en" } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Outlet />;
}
