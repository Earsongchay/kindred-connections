// Redirect bare "/" to the default locale.
// TODO Sprint 2 — Detect browser language (Accept-Language) on server side.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE } from "@/i18n";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$locale", params: { locale: DEFAULT_LOCALE } });
  },
});
