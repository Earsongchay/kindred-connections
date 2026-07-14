// TODO Sprint 3-4 — Wire real records. Prototype pro medical records.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Pill,
  Search,
  Stethoscope,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { PRO_PATIENTS, type ProPatient } from "@/lib/pro-patients";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro/dossiers")({
  head: () => ({ meta: [{ title: "Dossiers médicaux — FUENI" }] }),
  validateSearch: (search: Record<string, unknown>): { patient?: string } => {
    const p = search.patient;
    return typeof p === "string" ? { patient: p } : {};
  },
  component: ProRecordsPage,
});

type Tab = "history" | "medical" | "documents";

function ProRecordsPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(search.patient ?? PRO_PATIENTS[0].id);
  const [tab, setTab] = useState<Tab>("history");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRO_PATIENTS;
    return PRO_PATIENTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const selected = PRO_PATIENTS.find((p) => p.id === selectedId) ?? PRO_PATIENTS[0];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight lg:hidden">
        {isEn ? "Medical records" : "Dossiers médicaux"}
      </h1>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Patient list */}
        <aside className="flex max-h-[calc(100vh-8rem)] flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-xl">
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isEn ? "Search a patient…" : "Rechercher un patient…"}
                className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {filtered.length} {isEn ? "patients" : "patients"}
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(p.id); setTab("history"); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    p.id === selected.id ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.age} {isEn ? "yrs" : "ans"} · {p.sex === "F" ? "F" : isEn ? "M" : "H"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                {isEn ? "No patient found." : "Aucun patient trouvé."}
              </li>
            )}
          </ul>
        </aside>

        {/* Detail */}
        <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <RecordDetail patient={selected} isEn={isEn} tab={tab} setTab={setTab} />
        </section>
      </div>
    </div>
  );
}

function RecordDetail({
  patient,
  isEn,
  tab,
  setTab,
}: {
  patient: ProPatient;
  isEn: boolean;
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const allergy = isEn ? patient.allergyEn : patient.allergyFr;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-bold text-primary-foreground">
            {patient.initials}
          </div>
          <div>
            <div className="text-lg font-bold">{patient.name}</div>
            <div className="text-xs text-muted-foreground">
              {patient.age} {isEn ? "yrs" : "ans"} · {patient.sex === "F" ? "F" : isEn ? "M" : "H"} · {patient.phone}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Stethoscope className="h-4 w-4" /> {isEn ? "Document a consultation" : "Documenter une consultation"}
        </button>
      </div>

      {/* Allergy banner */}
      {allergy && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-300/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 flex-none text-rose-500" />
          <span>
            <span className="font-semibold">{isEn ? "Severe allergy:" : "Allergie sévère :"}</span> {allergy}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        <RecordTab active={tab === "history"} onClick={() => setTab("history")} count={patient.history.length}>
          {isEn ? "Consultation history" : "Historique des consultations"}
        </RecordTab>
        <RecordTab active={tab === "medical"} onClick={() => setTab("medical")}>
          {isEn ? "Medical information" : "Informations médicales"}
        </RecordTab>
        <RecordTab active={tab === "documents"} onClick={() => setTab("documents")} count={patient.documents}>
          {isEn ? "Documents" : "Documents"}
        </RecordTab>
      </div>

      {/* Tab content */}
      {tab === "history" && (
        <ul className="space-y-3">
          {patient.history.map((c, i) => (
            <li key={i} className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold">{c.date}</span>
                <span className="text-sm font-semibold text-primary">{isEn ? c.reasonEn : c.reasonFr}</span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">{isEn ? "Diagnosis:" : "Diagnostic :"}</span>{" "}
                {isEn ? c.diagnosisEn : c.diagnosisFr}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{isEn ? c.notesEn : c.notesFr}</p>
              {c.prescriptions.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  {c.prescriptions.map((rx, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {rx}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {patient.history.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              {isEn ? "No consultation recorded." : "Aucune consultation enregistrée."}
            </li>
          )}
        </ul>
      )}

      {tab === "medical" && (
        <div className="space-y-3">
          <InfoRow label={isEn ? "Severe allergies" : "Allergies sévères"} value={allergy ?? (isEn ? "None reported" : "Aucune signalée")} />
          <InfoRow label={isEn ? "Age" : "Âge"} value={`${patient.age} ${isEn ? "yrs" : "ans"}`} />
          <InfoRow label={isEn ? "Sex" : "Sexe"} value={patient.sex === "F" ? (isEn ? "Female" : "Femme") : isEn ? "Male" : "Homme"} />
          <InfoRow
            label={isEn ? "Last consultation" : "Dernière consultation"}
            value={patient.lastVisit ? `${patient.lastVisit.date} — ${isEn ? patient.lastVisit.reasonEn : patient.lastVisit.reasonFr}` : "—"}
          />
        </div>
      )}

      {tab === "documents" && (
        <div>
          {patient.documents > 0 ? (
            <ul className="space-y-2">
              {Array.from({ length: patient.documents }, (_, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
                  <FileText className="h-4 w-4 flex-none text-primary" />
                  <span className="flex-1 font-medium">
                    {isEn ? "Document" : "Document"} {i + 1}
                  </span>
                  <button type="button" className="text-xs font-semibold text-primary hover:underline">
                    {isEn ? "View" : "Voir"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              {isEn ? "No shared document." : "Aucun document partagé."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecordTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {count != null && (
        <span
          className={cn(
            "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold",
            active ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
