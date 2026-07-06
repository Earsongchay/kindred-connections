// TODO Sprint 3-4 — Wire to Keycloak. Pure UI prototype layout (cf. §4.4).
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BadgeCheck,
  CalendarDays,
  FolderOpen,
  HelpCircle,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-patient")({
  head: () => ({
    meta: [{ title: "Mon espace patient — FUENI" }],
  }),
  component: PatientLayout,
});

type NavRoute =
  | "/$locale/espace-patient"
  | "/$locale/espace-patient/profil"
  | "/$locale/espace-patient/documents"
  | "/$locale/espace-patient/securite";

type NavItem = {
  to: NavRoute;
  label: string;
  Icon: typeof Home;
  exact?: boolean;
};

function PatientLayout() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const spaceItems: NavItem[] = [
    {
      to: "/$locale/espace-patient",
      label: t("patientLayout.nav.dashboard"),
      Icon: Home,
      exact: true,
    },
    {
      to: "/$locale/espace-patient",
      label: t("patientLayout.nav.appointments"),
      Icon: CalendarDays,
    },
    { to: "/$locale/espace-patient", label: t("patientLayout.nav.book"), Icon: PlusCircle },
    {
      to: "/$locale/espace-patient/documents",
      label: t("patientLayout.nav.documents"),
      Icon: FolderOpen,
    },
  ];

  const accountItems: NavItem[] = [
    { to: "/$locale/espace-patient/profil", label: t("patientLayout.nav.profile"), Icon: User },
    {
      to: "/$locale/espace-patient/securite",
      label: t("patientLayout.nav.security"),
      Icon: ShieldCheck,
    },
  ];

  const helpItems: NavItem[] = [
    { to: "/$locale/espace-patient", label: t("patientLayout.nav.faq"), Icon: HelpCircle },
    { to: "/$locale/espace-patient", label: t("patientLayout.nav.support"), Icon: LifeBuoy },
  ];

  const isActive = (item: NavItem, idx: number, group: NavItem[]) => {
    // Only the first dashboard entry should light up for the index route.
    if (item.exact) return pathname === `/${locale}/espace-patient`;
    // Skip placeholder routes pointing back to dashboard so they don't all glow.
    if (item.to === "/$locale/espace-patient") return false;
    return pathname.startsWith(`/${locale}${item.to.replace("/$locale", "")}`);
  };

  const Group = ({ label, items }: { label: string; items: NavItem[] }) => (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/60">
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => {
          const active = isActive(item, i, items);
          return (
            <li key={`${label}-${item.label}-${i}`}>
              <Link
                to={item.to}
                params={{ locale }}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-teal shadow-sm"
                    : "text-primary-foreground/85 hover:bg-white/10 hover:text-primary-foreground",
                )}
              >
                <item.Icon className="h-4 w-4 flex-none" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const SidebarBody = () => (
    <div className="flex h-full flex-col bg-[image:var(--gradient-teal)] text-teal-foreground">
      {/* Brand */}
      <div className="px-5 pb-4 pt-6">
        <Link to="/$locale" params={{ locale }} className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
            F
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">{t("patientLayout.brand")}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              {t("patientLayout.subtitle")}
            </div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-3 mb-5 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white/20 text-sm font-bold text-primary-foreground">
          AD
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{t("patientLayout.userName")}</div>
          <div className="flex items-center gap-1 text-[11px] text-primary-foreground/80">
            <BadgeCheck className="h-3 w-3" />
            <span className="truncate">{t("patientLayout.userStatus")}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Group label={t("patientLayout.groups.space")} items={spaceItems} />
        <Group label={t("patientLayout.groups.account")} items={accountItems} />
        <Group label={t("patientLayout.groups.help")} items={helpItems} />
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <Link
          to="/$locale/login"
          params={{ locale }}
          search={{ audience: "patient" }}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-white/10 hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> {t("patientLayout.nav.logout")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg text-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-sm font-bold text-teal-foreground">
            F
          </div>
          <span className="text-base font-bold">FUENI</span>
        </Link>
        <button
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[260px] flex-none lg:block">
          <SidebarBody />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-primary-foreground hover:bg-white/25"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarBody />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Desktop top bar */}
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-end gap-3 border-b border-border/40 bg-background/70 px-6 backdrop-blur-xl lg:flex">
            <button
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
