import { Link, useParams, useNavigate, useLocation } from "@tanstack/react-router";
import { Globe, Menu, ChevronDown, User, Stethoscope, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isLocale, type Locale } from "@/i18n";

export function SiteHeader() {
  const { t } = useTranslation();
  const params = useParams({ strict: false }) as { locale?: string };
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const navigate = useNavigate();
  const location = useLocation();

  // T19 — mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const switchLocale = (next: Locale) => {
    const path = location.pathname.replace(/^\/(fr|en)/, `/${next}`);
    navigate({ to: path || `/${next}` });
  };

  const navLinks = [
    { href: "#how", label: t("nav.how") },
    { href: "#audience", label: t("nav.audience") },
    { href: "#features", label: t("nav.features") },
    { href: "#security", label: t("nav.security") },
    { href: "#coverage", label: t("nav.coverage") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] text-primary-foreground font-bold shadow-[var(--shadow-card)]">
            F
          </div>
          <span className="text-lg font-bold tracking-tight">{t("common.brand")}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-0.5 rounded-full border border-border bg-card/70 p-0.5 text-xs font-semibold md:inline-flex">
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                aria-pressed={l === locale}
                className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
                  l === locale
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:inline-flex">
            <Globe className="h-4 w-4" />
            {t("common.currency")}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:inline-flex">
                {t("common.signIn")} <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/$locale/login" params={{ locale }} search={{ audience: "patient" }}>
                  <User className="mr-2 h-4 w-4" /> {t("header.signInPatient")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/$locale/login" params={{ locale }} search={{ audience: "pro" }}>
                  <Stethoscope className="mr-2 h-4 w-4" /> {t("header.signInPro")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hidden rounded-full bg-foreground text-background hover:bg-foreground/90 md:inline-flex">
                {t("common.signUp")} <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/$locale/inscription" params={{ locale }}>
                  <User className="mr-2 h-4 w-4" /> {t("header.signUpPatient")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/$locale/signup" params={{ locale }}>
                  <Stethoscope className="mr-2 h-4 w-4" /> {t("header.signUpPro")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* T19 — hamburger button */}
          <button
            className="grid h-10 w-10 place-items-center rounded-lg md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* T19 — Mobile overlay menu */}
      <div
        className={`fixed inset-0 top-16 z-40 flex flex-col bg-background/95 backdrop-blur-xl transition-all duration-200 md:hidden ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <nav className="mb-6 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="mb-6 h-px bg-border" />

          <div className="flex flex-col gap-3">
            <Link
              to="/$locale/login"
              params={{ locale }}
              search={{ audience: "patient" }}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              <User className="h-4 w-4" /> {t("header.signInPatient")}
            </Link>
            <Link
              to="/$locale/login"
              params={{ locale }}
              search={{ audience: "pro" }}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              <Stethoscope className="h-4 w-4" /> {t("header.signInPro")}
            </Link>
            <Link
              to="/$locale/inscription"
              params={{ locale }}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background"
            >
              <User className="h-4 w-4" /> {t("header.signUpPatient")}
            </Link>
            <Link
              to="/$locale/signup"
              params={{ locale }}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-foreground/80 px-4 py-3 text-sm font-medium text-background"
            >
              <Stethoscope className="h-4 w-4" /> {t("header.signUpPro")}
            </Link>
          </div>

          <div className="mt-6 h-px bg-border" />

          {/* Language switcher */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("common.language")} :</span>
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => {
                  switchLocale(l);
                  setMenuOpen(false);
                }}
                aria-pressed={l === locale}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  l === locale
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
