// Shared admin layout shell (sidebar + top bar) for Super Admin pages.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";

export type AdminSection = "overview" | "verifications" | "audit";

export function AdminShell({
  locale,
  section,
  breadcrumb,
  pendingCount = 0,
  children,
}: {
  locale: Locale;
  section: AdminSection;
  breadcrumb: string;
  pendingCount?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0d3b46] px-4 py-6 text-white/90 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-bold">F</div>
          <div>
            <div className="text-sm font-bold tracking-wide">FUENI</div>
            <div className="text-[11px] uppercase tracking-widest text-white/60">Admin</div>
          </div>
        </div>

        <SideGroup label="Tableau de bord">
          <SideLink
            to={`/${locale}/admin`}
            icon={LayoutDashboard}
            label="Vue d'ensemble"
            active={section === "overview"}
          />
        </SideGroup>

        <SideGroup label="Gestion">
          <SideLink
            to={`/${locale}/admin/verifications`}
            icon={ShieldCheck}
            label="Vérification des dossiers"
            active={section === "verifications"}
            badge={pendingCount || undefined}
          />
          <SideStatic icon={BadgeCheck} label="Abonnements" soon />
          <SideLink
            to={`/${locale}/admin/audit`}
            icon={History}
            label="Journal d'audit"
            active={section === "audit"}
          />
        </SideGroup>

        <SideGroup label="Configuration">
          <SideStatic icon={FileText} label="Plans" soon />
          <SideStatic icon={CreditCard} label="Tarification" soon />
        </SideGroup>

        <div className="mt-auto pt-6">
          <Link
            to="/$locale/login-admin"
            params={{ locale }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
              SA
            </span>
            <span className="font-semibold text-slate-900">Super Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span>{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden items-center gap-1.5 md:flex">
              <CalendarClock className="h-4 w-4 text-slate-400" /> 25 juin 2026
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
              admin@fueni.com
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

function SideGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

type IconType = typeof LayoutDashboard;

function SideLink({
  to,
  icon: Icon,
  label,
  active,
  badge,
}: {
  to: string;
  icon: IconType;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-white/15 font-semibold text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {typeof badge === "number" && (
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SideStatic({ icon: Icon, label, soon }: { icon: IconType; label: string; soon?: boolean }) {
  return (
    <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60">
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {soon && (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
          Bientôt
        </span>
      )}
    </div>
  );
}
