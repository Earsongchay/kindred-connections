// Super Admin layout — distinct dark purple shell. Prototype only (no real auth yet).
// TODO Sprint 3-4 — Gate behind admin role + audited session.
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  FileClock,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  Tags,
  UserCheck,
  X,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/admin")({
  head: () => ({
    meta: [
      { title: "Administration — FUENI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

type AdminRoute = "/$locale/admin" | "/$locale/admin/verifications" | "/$locale/admin/audit";

type NavItem = {
  to: AdminRoute;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  soon?: boolean;
};

function AdminLayout() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashItems: NavItem[] = [
    { to: "/$locale/admin", label: isEn ? "Overview" : "Vue d'ensemble", Icon: LayoutDashboard, exact: true },
  ];
  const manageItems: NavItem[] = [
    { to: "/$locale/admin/verifications", label: isEn ? "File verification" : "Vérification des dossiers", Icon: UserCheck, badge: "9" },
    { to: "/$locale/admin", label: isEn ? "Subscriptions" : "Abonnements", Icon: CalendarDays, soon: true },
    { to: "/$locale/admin/audit", label: isEn ? "Audit log" : "Journal d'audit", Icon: FileClock },
  ];
  const configItems: NavItem[] = [
    { to: "/$locale/admin", label: isEn ? "Plans" : "Plans", Icon: ListChecks, soon: true },
    { to: "/$locale/admin", label: isEn ? "Pricing" : "Tarification", Icon: Tags, soon: true },
  ];

  const isActive = (item: NavItem) => {
    const target = `/${locale}${item.to.replace("/$locale", "")}`;
    if (item.exact) return pathname === `/${locale}/admin`;
    return pathname === target;
  };

  const Group = ({ label, items }: { label: string; items: NavItem[] }) => (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <ul className="space-y-1">
        {items.map((item, i) => {
          const active = isActive(item) && !item.soon;
          const content = (
            <>
              <item.Icon className="h-4 w-4 flex-none" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#7c3aed] px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              {item.soon && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/50">
                  {isEn ? "Soon" : "Bientôt"}
                </span>
              )}
            </>
          );
          const base =
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
          if (item.soon) {
            return (
              <li key={`${label}-${i}`}>
                <div className={cn(base, "cursor-not-allowed text-white/40")}>{content}</div>
              </li>
            );
          }
          return (
            <li key={`${label}-${i}`}>
              <Link
                to={item.to}
                params={{ locale }}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  base,
                  active
                    ? "bg-[#7c3aed] text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const SidebarBody = () => (
    <div className="flex h-full flex-col bg-[#1e1b3a] text-white">
      <div className="px-5 pb-4 pt-6">
        <Link to="/$locale" params={{ locale }} className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
            F
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">FUENI</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              {isEn ? "ADMIN" : "ADMIN"}
            </div>
          </div>
        </Link>
      </div>

      <div className="mx-3 mb-5 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#7c3aed] text-sm font-bold text-white">
          SA
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Super Admin</div>
          <div className="flex items-center gap-1 text-[11px] text-white/70">
            <ShieldCheck className="h-3 w-3" />
            <span className="truncate">admin@fueni.com</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Group label={isEn ? "DASHBOARD" : "TABLEAU DE BORD"} items={dashItems} />
        <Group label={isEn ? "MANAGEMENT" : "GESTION"} items={manageItems} />
        <Group label={isEn ? "CONFIGURATION" : "CONFIGURATION"} items={configItems} />
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/$locale/login-admin"
          params={{ locale }}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> {isEn ? "Sign out" : "Déconnexion"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f8] dark:bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg text-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1e1b3a] text-sm font-bold text-white">
            F
          </div>
          <span className="text-base font-bold">Admin</span>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-[260px] flex-none lg:block">
          <SidebarBody />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarBody />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
