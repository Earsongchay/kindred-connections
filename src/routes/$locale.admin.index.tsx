// Admin — Vue d'ensemble (dashboard).
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  History,
  Hourglass,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/admin/")({
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Admin FUENI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminOverview,
});

const KPIS = [
  { label: "Médecins actifs", value: 214, icon: Stethoscope, tone: "violet" as const },
  { label: "Patients inscrits", value: 4_812, icon: Users, tone: "teal" as const },
  { label: "Dossiers KYC en attente", value: 8, icon: Hourglass, tone: "amber" as const },
  { label: "Validés ce mois", value: 37, icon: BadgeCheck, tone: "emerald" as const },
];

const QUEUE = [
  { name: "Dr Aminata Diop", specialty: "Cardiologie", hours: 52, overdue: true },
  { name: "Dr Kwame Mensah", specialty: "Médecine générale", hours: 28 },
  { name: "Dr Mariama Sylla", specialty: "Gynéco-obstétrique", hours: 19 },
  { name: "Dr Khadija Ndiaye", specialty: "Dermatologie", hours: 41 },
];

const RECENT_AUDIT = [
  { at: "25 juin · 09:12", actor: "Moussa T.", action: "Dossier validé — Dr F. Bensouda" },
  { at: "24 juin · 17:44", actor: "Awa N.", action: "Corrections demandées — Dr I. Touré" },
  { at: "24 juin · 08:03", actor: "Système", action: "SLA 48h dépassé — Dr A. Diop" },
];

function AdminOverview() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return (
    <AdminShell locale={locale} section="overview" breadcrumb="Vue d'ensemble" pendingCount={8}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-slate-600">
          Suivi de l'activité de la plateforme et de la file de vérification KYC.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-600" />
              <h2 className="font-semibold text-slate-900">File de vérification</h2>
            </div>
            <Link
              to="/$locale/admin/verifications"
              params={{ locale }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-800"
            >
              Ouvrir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {QUEUE.map((d) => (
              <li key={d.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.specialty}</div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    d.overdue ? "font-semibold text-rose-600" : "text-slate-500",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {d.hours}h{d.overdue ? " — dépassé" : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-teal-600" />
              <h2 className="font-semibold text-slate-900">Activité récente</h2>
            </div>
            <Link
              to="/$locale/admin/audit"
              params={{ locale }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-800"
            >
              Journal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-3">
            {RECENT_AUDIT.map((e, i) => (
              <li key={i} className="text-sm">
                <div className="text-slate-900">{e.action}</div>
                <div className="text-xs text-slate-500">
                  {e.at} · {e.actor}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        <RotateCcw className="mx-auto mb-2 h-5 w-5 text-slate-400" />
        Rapports détaillés (abonnements, revenus, engagements) bientôt disponibles.
      </div>
    </AdminShell>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof BadgeCheck;
  tone: "violet" | "teal" | "amber" | "emerald";
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  } as const;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none text-slate-900">
          {value.toLocaleString("fr-FR")}
        </div>
        <div className="mt-1 text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
