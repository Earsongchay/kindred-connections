import { Link, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n";

export function SiteFooter() {
  const { t } = useTranslation();
  const params = useParams({ strict: false }) as { locale?: string };
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const cols = [
    {
      title: t("footer.product"),
      items: t("footer.productItems", { returnObjects: true }) as string[],
    },
    {
      title: t("footer.resources"),
      items: t("footer.resourceItems", { returnObjects: true }) as string[],
    },
    {
      title: t("footer.legal"),
      items: t("footer.legalItems", { returnObjects: true }) as string[],
    },
  ];

  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] font-bold text-primary-foreground">
                F
              </div>
              <span className="text-lg font-bold">{t("common.brand")}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.items.map((i) => (
                  <li key={i}>
                    {/* TODO Sprint 5 — Wire real legal/resource pages */}
                    <Link
                      to="/$locale"
                      params={{ locale }}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {i}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">{t("footer.legalNote")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.compliance")}</p>
        </div>
        {/* Draft / provisional banner — TODO remove once content is finalised (Sprint 4-5) */}
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("footer.draft")}
        </p>
      </div>
    </footer>
  );
}
