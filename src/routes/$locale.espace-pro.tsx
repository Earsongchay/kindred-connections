// TODO Sprint 3-4 — Wire to Keycloak. Prototype pro layout (cf. §4.9 pro dashboard).
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro")({
  head: () => ({ meta: [{ title: "Espace praticien — FUENI" }] }),
  component: ProLayout,
});

type ProRoute = "/$locale/espace-pro" | "/$locale/espace-pro/abonnement";

type NavItem = {
  to: ProRoute;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
};

function ProLayout() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const spaceItems: NavItem[] = [
    { to: "/$locale/espace-pro", label: isEn ? "Dashboard" : "Tableau de bord", Icon: LayoutDashboard, exact: true },
    { to: "/$locale/espace-pro", label: isEn ? "Patients" : "Patients", Icon: Users },
    { to: "/$locale/espace-pro", label: isEn ? "Appointments" : "Rendez-vous", Icon: CalendarDays },
    { to: "/$locale/espace-pro", label: isEn ? "Medical records" : "Dossiers médicaux", Icon: FileText },
  ];

  const accountItems: NavItem[] = [
    { to: "/$locale/espace-pro/abonnement", label: isEn ? "My subscription" : "Mon abonnement", Icon: Star },
    { to: "/$locale/espace-pro", label: isEn ? "Settings" : "Paramètres", Icon: Settings },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === `/${locale}/espace-pro`;
    return pathname === `/${locale}${item.to.replace("/$locale", "")}`;
  };

  const Group = ({ label, items }: { label: string; items: NavItem[] }) => (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/60">
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => {
          const active = isActive(item);
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
      <div className="px-5 pb-4 pt-6">
        <Link to="/$locale" params={{ locale }} className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
            F
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">FUENI</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              {isEn ? "PRACTITIONER SPACE" : "ESPACE PRATICIEN"}
            </div>
          </div>
        </Link>
      </div>

      <div className="mx-3 mb-5 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white/20 text-sm font-bold text-primary-foreground">
          AD
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Dr Aboubacar Diallo</div>
          <div className="flex items-center gap-1 text-[11px] text-primary-foreground/80">
            <BadgeCheck className="h-3 w-3" />
            <span className="truncate">{isEn ? "Verified profile" : "Profil validé"}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Group label={isEn ? "MY SPACE" : "MON ESPACE"} items={spaceItems} />
        <Group label={isEn ? "MY ACCOUNT" : "MON COMPTE"} items={accountItems} />
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/$locale/login-pro"
          params={{ locale }}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-white/10 hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> {isEn ? "Sign out" : "Se déconnecter"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
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
        <div className="w-9" />
      </header>

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-[260px] flex-none lg:block">
          <SidebarBody />
        </aside>

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

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-border/40 bg-background/70 px-6 backdrop-blur-xl lg:flex">
            <h1 className="text-lg font-bold">{isEn ? "Dashboard" : "Tableau de bord"}</h1>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
