// Super Admin overview dashboard. Prototype UI only.
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FileClock,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/admin/")({
  head: () => ({ meta: [{ title: "Vue d'ensemble — Administration FUENI" }] }),
  component: AdminOverview,
});

const PENDING = [
  { initials: "AD", name: "Dr Aminata Diop", meta: "Cardiologie · 🇸🇳 Sénégal", wait: "52h — dépassé", overdue: true },
  { initials: "KM", name: "Dr Kwame Mensah", meta: "Médecine générale · 🇨🇮 Côte d'Ivoire", wait: "28h", overdue: false },
  { initials: "MS", name: "Dr Mariama Sylla", meta: "Gynéco-obstétrique · 🇹🇬 Togo", wait: "19h", overdue: false },
];

const RECENT_AUDIT = [
  { admin: "N. Veng", action: "Corrections demandées", target: "Dr Ibrahim Touré", cat: "KYC", time: "11:20" },
  { admin: "C. Thor", action: "Connexion réussie", target: "—", cat: "Auth", time: "08:55" },
  { admin: "N. Veng", action: "Compte réactivé", target: "Dr Zoubir Amrani", cat: "Compte", time: "07:40" },
  { admin: "C. Thor", action: "Dossier consulté", target: "Dr Ibrahim Touré", cat: "KYC", time: "07:38" },
];

function AdminOverview() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7c3aed] text-[11px] font-bold text-white">
            SA
          </span>
          <span className="font-semibold text-foreground">Super Admin</span>
          <span aria-hidden>›</span>
          <span>{isEn ? "Overview" : "Vue d'ensemble"}</span>
        </div>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <CalendarDays className="h-4 w-4" />
          {isEn ? "June 25, 2026" : "25 juin 2026"}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEn ? "Overview" : "Vue d'ensemble"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEn
            ? "Platform activity, verification queue and recent admin actions."
            : "Activité de la plateforme, file de vérification et actions récentes."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="amber" value="9" label={isEn ? "Pending files" : "Dossiers en attente"} icon={<Clock className="h-4 w-4" />} />
        <StatCard tone="emerald" value="37" label={isEn ? "Validated this month" : "Validés ce mois"} icon={<UserCheck className="h-4 w-4" />} />
        <StatCard tone="rose" value="3" label={isEn ? "To correct" : "À corriger"} icon={<RotateCcw className="h-4 w-4" />} />
        <StatCard tone="violet" value="142" label={isEn ? "Active practitioners" : "Praticiens actifs"} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <UserCheck className="h-4 w-4 text-[#7c3aed]" />
              {isEn ? "Verification queue" : "File de vérification"}
            </h2>
            <Link
              to="/$locale/admin/verifications"
              params={{ locale }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:underline"
            >
              {isEn ? "View all" : "Tout voir"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          <ul className="space-y-2">
            {PENDING.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3"
              >
                <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#7c3aed]/10 text-[11px] font-bold text-[#7c3aed]">
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.meta}</div>
                </div>
                <span
                  className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    p.overdue
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                  }`}
                >
                  {p.wait}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <FileClock className="h-4 w-4 text-[#7c3aed]" />
              {isEn ? "Recent activity" : "Activité récente"}
            </h2>
            <Link
              to="/$locale/admin/audit"
              params={{ locale }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:underline"
            >
              {isEn ? "Audit log" : "Journal"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          <ul className="space-y-2">
            {RECENT_AUDIT.map((a, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{a.action}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.admin} · {a.target}
                  </div>
                </div>
                <span className="flex-none font-mono text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#7c3aed]/20 bg-[#7c3aed]/5 p-4 text-sm text-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-[#7c3aed]" />
        <p className="text-muted-foreground">
          {isEn
            ? "All admin actions are logged in an append-only audit register (20-year retention · GDPR · HDS · ISO 27001)."
            : "Toutes les actions admin sont journalisées dans un registre inaltérable (conservation 20 ans · RGPD · HDS · ISO 27001)."}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  tone,
  value,
  label,
  icon,
}: {
  tone: "amber" | "emerald" | "rose" | "violet";
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  const toneClasses = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    violet: "bg-[#7c3aed]/10 text-[#7c3aed]",
  }[tone];
  const valueTone = {
    amber: "text-amber-600 dark:text-amber-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    rose: "text-rose-600 dark:text-rose-300",
    violet: "text-[#7c3aed]",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className={`inline-grid h-9 w-9 place-items-center rounded-xl ${toneClasses}`}>{icon}</div>
      <div className={`mt-3 text-3xl font-bold tracking-tight ${valueTone}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
