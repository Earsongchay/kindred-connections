// TODO Sprint 3-4 — Wire real records. Prototype pro medical records.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Loader2,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { PRO_PATIENTS_ALL, type Consultation, type ProPatient } from "@/lib/pro-patients";
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

const PAGE_SIZE = 15;

function ProRecordsPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [patients, setPatients] = useState<ProPatient[]>(PRO_PATIENTS_ALL);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string>(search.patient ?? PRO_PATIENTS_ALL[0].id);
  const [tab, setTab] = useState<Tab>("history");
  const [mobileDetail, setMobileDetail] = useState(Boolean(search.patient));
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, query]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => v + PAGE_SIZE);
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, shown.length]);

  const selected = patients.find((p) => p.id === selectedId) ?? filtered[0] ?? patients[0];

  const handleCreatePatient = (p: ProPatient) => {
    setPatients((prev) => [p, ...prev]);
    setSelectedId(p.id);
    setTab("history");
    setQuery("");
    setMobileDetail(true);
    setNewPatientOpen(false);
  };

  const handleAddConsultation = (c: Consultation) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              history: [c, ...p.history],
              lastVisit: { date: c.date, reasonFr: c.reasonFr, reasonEn: c.reasonEn },
            }
          : p,
      ),
    );
    setTab("history");
    setConsultOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-bold tracking-tight sm:text-2xl lg:hidden">
          {isEn ? "Medical records" : "Dossiers médicaux"}
        </h1>
        <button
          type="button"
          onClick={() => setNewPatientOpen(true)}
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-muted"
        >
          <UserPlus className="h-4 w-4" /> <span className="hidden min-[420px]:inline">{isEn ? "New patient" : "Nouveau patient"}</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Patient list */}
        <aside
          className={cn(
            "flex max-h-[60vh] flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-xl lg:max-h-[calc(100vh-8rem)]",
            mobileDetail && "hidden lg:flex",
          )}
        >
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
            {shown.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(p.id); setTab("history"); setMobileDetail(true); }}
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
            {hasMore && (
              <li ref={sentinelRef} className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEn ? "Loading more…" : "Chargement…"}
              </li>
            )}
          </ul>
        </aside>

        {/* Detail */}
        <section
          className={cn(
            "rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl sm:p-6",
            !mobileDetail && "hidden lg:block",
          )}
        >
          <RecordDetail
            patient={selected}
            isEn={isEn}
            tab={tab}
            setTab={setTab}
            onDocument={() => setConsultOpen(true)}
            onBack={() => setMobileDetail(false)}
          />
        </section>
      </div>

      <NewPatientDialog
        open={newPatientOpen}
        onOpenChange={setNewPatientOpen}
        isEn={isEn}
        onCreate={handleCreatePatient}
      />
      <ConsultationDialog
        open={consultOpen}
        onOpenChange={setConsultOpen}
        isEn={isEn}
        patient={selected}
        onSave={handleAddConsultation}
      />
    </div>
  );
}

function RecordDetail({
  patient,
  isEn,
  tab,
  setTab,
  onDocument,
  onBack,
}: {
  patient: ProPatient;
  isEn: boolean;
  tab: Tab;
  setTab: (t: Tab) => void;
  onDocument: () => void;
  onBack: () => void;
}) {
  const allergy = isEn ? patient.allergyEn : patient.allergyFr;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={isEn ? "Back to patient list" : "Retour à la liste des patients"}
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-bold text-primary-foreground">
            {patient.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold">{patient.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {patient.age} {isEn ? "yrs" : "ans"} · {patient.sex === "F" ? "F" : isEn ? "M" : "H"} · {patient.phone}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDocument}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 sm:w-auto"
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

function fieldClass() {
  return "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function NewPatientDialog({
  open,
  onOpenChange,
  isEn,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isEn: boolean;
  onCreate: (p: ProPatient) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"F" | "M">("F");
  const [phone, setPhone] = useState("");
  const [allergy, setAllergy] = useState("");

  const reset = () => {
    setName(""); setAge(""); setSex("F"); setPhone(""); setAllergy("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/);
    const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
    onCreate({
      id: `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      initials: initials || trimmed.slice(0, 2).toUpperCase(),
      name: trimmed,
      age: Number(age) || 0,
      sex,
      phone: phone.trim() || "—",
      lastVisit: null,
      nextAppt: null,
      documents: 0,
      newThisMonth: true,
      allergyFr: allergy.trim() || undefined,
      allergyEn: allergy.trim() || undefined,
      history: [],
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEn ? "New patient" : "Nouveau patient"}</DialogTitle>
          <DialogDescription>
            {isEn
              ? "Create a record for a patient seen in your practice."
              : "Créez un dossier pour un patient suivi dans votre cabinet."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={isEn ? "Full name" : "Nom complet"}>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} placeholder="Mariam Diallo" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={isEn ? "Age" : "Âge"}>
              <input type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className={fieldClass()} placeholder="34" />
            </Field>
            <Field label={isEn ? "Sex" : "Sexe"}>
              <select value={sex} onChange={(e) => setSex(e.target.value as "F" | "M")} className={fieldClass()}>
                <option value="F">{isEn ? "Female" : "Femme"}</option>
                <option value="M">{isEn ? "Male" : "Homme"}</option>
              </select>
            </Field>
          </div>
          <Field label={isEn ? "Phone" : "Téléphone"}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass()} placeholder="+221 77 123 45 67" />
          </Field>
          <Field label={isEn ? "Severe allergies (optional)" : "Allergies sévères (optionnel)"}>
            <input value={allergy} onChange={(e) => setAllergy(e.target.value)} className={fieldClass()} placeholder={isEn ? "Penicillin" : "Pénicilline"} />
          </Field>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              {isEn ? "Cancel" : "Annuler"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              <UserPlus className="h-4 w-4" /> {isEn ? "Create record" : "Créer le dossier"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function todayLabel(isEn: boolean) {
  const d = new Date();
  return d.toLocaleDateString(isEn ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function ConsultationDialog({
  open,
  onOpenChange,
  isEn,
  patient,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isEn: boolean;
  patient: ProPatient;
  onSave: (c: Consultation) => void;
}) {
  const [reason, setReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<string[]>([""]);

  const reset = () => {
    setReason(""); setDiagnosis(""); setNotes(""); setPrescriptions([""]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSave({
      date: todayLabel(isEn),
      reasonFr: reason.trim(),
      reasonEn: reason.trim(),
      diagnosisFr: diagnosis.trim() || "—",
      diagnosisEn: diagnosis.trim() || "—",
      notesFr: notes.trim(),
      notesEn: notes.trim(),
      prescriptions: prescriptions.map((p) => p.trim()).filter(Boolean),
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEn ? "Document a consultation" : "Documenter une consultation"}</DialogTitle>
          <DialogDescription>
            {patient.name} · {todayLabel(isEn)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={isEn ? "Reason for visit" : "Motif de consultation"}>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={fieldClass()}
              placeholder={isEn ? "General consultation" : "Consultation générale"}
            />
          </Field>
          <Field label={isEn ? "Diagnosis" : "Diagnostic"}>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className={fieldClass()}
              placeholder={isEn ? "Acute nasopharyngitis" : "Rhinopharyngite aiguë"}
            />
          </Field>
          <Field label={isEn ? "Clinical note" : "Note clinique"}>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(fieldClass(), "resize-y")}
              placeholder={
                isEn
                  ? "Observations, vitals, clinical exam, follow-up plan…"
                  : "Observations, constantes, examen clinique, plan de suivi…"
              }
            />
          </Field>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {isEn ? "Prescription" : "Ordonnance"}
            </div>
            {prescriptions.map((rx, i) => (
              <div key={i} className="flex items-center gap-2">
                <Pill className="h-4 w-4 flex-none text-primary" />
                <input
                  value={rx}
                  onChange={(e) =>
                    setPrescriptions((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                  }
                  className={fieldClass()}
                  placeholder={isEn ? "Paracetamol 1 g × 3/day — 5 days" : "Paracétamol 1 g × 3/j — 5 j"}
                />
                <button
                  type="button"
                  onClick={() => setPrescriptions((prev) => (prev.length === 1 ? [""] : prev.filter((_, j) => j !== i)))}
                  className="grid h-9 w-9 flex-none place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={isEn ? "Remove line" : "Supprimer la ligne"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPrescriptions((prev) => [...prev, ""])}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> {isEn ? "Add a medication" : "Ajouter un médicament"}
            </button>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              {isEn ? "Cancel" : "Annuler"}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              <Stethoscope className="h-4 w-4" /> {isEn ? "Save consultation" : "Enregistrer la consultation"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
