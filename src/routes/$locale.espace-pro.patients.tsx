// TODO Sprint 3-4 — Wire real patient data. Prototype pro patients list.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  FolderOpen,
  Paperclip,
  Phone,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { PRO_PATIENTS, PRO_PATIENT_STATS, type ProPatient } from "@/lib/pro-patients";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro/patients")({
  head: () => ({ meta: [{ title: "Mes patients — FUENI" }] }),
  component: ProPatientsPage,
});

type Tab = "all" | "recent";
const PAGE_SIZES = [10, 25, 50] as const;

function ProPatientsPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ProPatient | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRO_PATIENTS;
    if (tab === "recent") list = list.filter((p) => p.lastVisit);
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
      );
    }
    return list;
  }, [tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEn ? "My patients" : "Mes patients"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEn
              ? "Patients you have already seen in consultation via FUENI."
              : "Les patients que vous avez déjà reçus en consultation via FUENI."}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <UserPlus className="h-4 w-4" /> {isEn ? "New patient" : "Nouveau patient"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          tone="teal"
          value={PRO_PATIENT_STATS.total}
          label={isEn ? "Total patients" : "Patients au total"}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          tone="emerald"
          value={PRO_PATIENT_STATS.newThisMonth}
          label={isEn ? "New this month" : "Nouveaux ce mois"}
          icon={<UserPlus className="h-5 w-5" />}
        />
        <StatCard
          tone="amber"
          value={PRO_PATIENT_STATS.upcoming}
          label={isEn ? "Upcoming appointments" : "RDV à venir"}
          icon={<CalendarPlus className="h-5 w-5" />}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full bg-muted p-1">
          <TabButton active={tab === "all"} onClick={() => { setTab("all"); resetPage(); }}>
            {isEn ? "All" : "Tous"}
          </TabButton>
          <TabButton active={tab === "recent"} onClick={() => { setTab("recent"); resetPage(); }}>
            {isEn ? "Recently seen" : "Vus récemment"}
          </TabButton>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder={isEn ? "Search a patient (name, phone)…" : "Rechercher un patient (nom, tél.)…"}
            className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-xl lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-5 py-3">{isEn ? "Patient" : "Patient"}</th>
              <th className="px-5 py-3">{isEn ? "Age / Sex" : "Âge / Sexe"}</th>
              <th className="px-5 py-3">{isEn ? "Last consultation" : "Dernière consultation"}</th>
              <th className="px-5 py-3">{isEn ? "Next appointment" : "Prochain RDV"}</th>
              <th className="px-5 py-3">{isEn ? "Contact" : "Contact"}</th>
              <th className="px-5 py-3">{isEn ? "Documents" : "Documents"}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => (
              <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={p.initials} />
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{p.age} {isEn ? "yrs" : "ans"}</span>
                    <SexBadge sex={p.sex} isEn={isEn} />
                  </div>
                </td>
                <td className="px-5 py-3">
                  {p.lastVisit ? (
                    <div>
                      <div className="font-medium">{p.lastVisit.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {isEn ? p.lastVisit.reasonEn : p.lastVisit.reasonFr}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {p.nextAppt ? (
                    <div>
                      <div className="font-semibold text-primary">{p.nextAppt.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {isEn ? p.nextAppt.reasonEn : p.nextAppt.reasonFr}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-5 py-3">
                  {p.documents > 0 ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Paperclip className="h-3.5 w-3.5" /> {p.documents}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5" /> {isEn ? "View" : "Voir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageItems.length === 0 && <EmptyState isEn={isEn} />}
      </div>

      {/* Cards (mobile) */}
      <div className="space-y-3 lg:hidden">
        {pageItems.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 text-left shadow-sm backdrop-blur-xl"
          >
            <Avatar initials={p.initials} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{p.name}</span>
                <SexBadge sex={p.sex} isEn={isEn} />
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {p.age} {isEn ? "yrs" : "ans"} · {p.lastVisit ? p.lastVisit.date : "—"}
              </div>
            </div>
            <Eye className="h-4 w-4 flex-none text-muted-foreground" />
          </button>
        ))}
        {pageItems.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6">
            <EmptyState isEn={isEn} />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{isEn ? "Per page:" : "Par page :"}</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="ml-2">
            {filtered.length} {isEn ? "results" : "résultats"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PagerButton disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </PagerButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold transition",
                n === currentPage ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted",
              )}
            >
              {n}
            </button>
          ))}
          <PagerButton disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight className="h-4 w-4" />
          </PagerButton>
        </div>
      </div>

      {selected && (
        <PatientDrawer patient={selected} isEn={isEn} locale={locale} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StatCard({
  tone,
  value,
  label,
  icon,
}: {
  tone: "teal" | "emerald" | "amber";
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  const toneClasses =
    tone === "teal"
      ? "bg-primary/10 text-primary"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
      <div className={`grid h-11 w-11 flex-none place-items-center rounded-xl ${toneClasses}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold transition",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PagerButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
      {initials}
    </div>
  );
}

function SexBadge({ sex, isEn }: { sex: "F" | "M"; isEn: boolean }) {
  const label = sex === "F" ? "F" : isEn ? "M" : "H";
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
        sex === "F" ? "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300" : "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
      )}
    >
      {label}
    </span>
  );
}

function EmptyState({ isEn }: { isEn: boolean }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
      {isEn ? "No patient for this search." : "Aucun patient pour cette recherche."}
    </div>
  );
}

function PatientDrawer({
  patient,
  isEn,
  locale,
  onClose,
}: {
  patient: ProPatient;
  isEn: boolean;
  locale: Locale;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-background shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar initials={patient.initials} />
            <div>
              <div className="font-bold">{patient.name}</div>
              <div className="text-xs text-muted-foreground">
                {patient.age} {isEn ? "yrs" : "ans"} · {patient.sex === "F" ? "F" : isEn ? "M" : "H"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-5">
          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {isEn ? "Contact" : "Coordonnées"}
            </h3>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm">
              <Phone className="h-4 w-4 text-primary" /> {patient.phone}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {isEn ? "Recent consultations" : "Dernières consultations"}
            </h3>
            <ul className="space-y-2">
              {patient.history.map((c, i) => (
                <li key={i} className="rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{c.date}</span>
                    <span className="text-xs text-primary">{isEn ? c.reasonEn : c.reasonFr}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {isEn ? c.diagnosisEn : c.diagnosisFr}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {isEn ? "Shared documents" : "Documents partagés"}
            </h3>
            {patient.documents > 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                {patient.documents} {isEn ? "document(s)" : "document(s)"}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
                {isEn ? "No shared document." : "Aucun document partagé."}
              </div>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border/60 bg-background/95 p-5 backdrop-blur sm:flex-row">
          <Link
            to="/$locale/espace-pro/dossiers"
            params={{ locale }}
            search={{ patient: patient.id }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            <FolderOpen className="h-4 w-4" /> {isEn ? "Open medical record" : "Ouvrir le dossier médical"}
          </Link>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <CalendarPlus className="h-4 w-4" /> {isEn ? "New appointment" : "Nouveau RDV"}
          </button>
        </div>
      </div>
    </div>
  );
}
