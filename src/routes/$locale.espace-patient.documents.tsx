// TODO Sprint 3-4 — Wire to backend storage & sharing. Pure UI prototype (cf. §4.4).
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Download,
  FileText,
  FlaskConical,
  HardDrive,
  Image as ImageIcon,
  Pill,
  Search,
  Share2,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Trash2,
  Upload,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-patient/documents")({
  head: () => ({ meta: [{ title: "Mes documents — FUENI" }] }),
  component: DocumentsPage,
});

type DocType = "lab" | "prescription" | "imaging" | "report" | "vaccination" | "other";
type SortKey = "recent" | "oldest" | "name" | "size";

type Doctor = { id: string; name: string; specialty: string };

type PatientDoc = {
  id: string;
  name: string;
  type: DocType;
  note: string;
  date: string; // ISO yyyy-mm-dd (stable for SSR)
  sizeMb: number;
  sharedWith: string[]; // doctor ids
  source: "me" | "practitioner";
};

const STORAGE_TOTAL_MB = 5120; // 5 GB
const PAGE_SIZE = 8; // documents shown per "page" before Load more
const MAX_CHIPS = 3; // shared-doctor chips shown before "+N"

const DOCTORS: Doctor[] = [
  { id: "dr-sow", name: "Dr. Aminata Sow", specialty: "Cardiologie" },
  { id: "dr-diallo", name: "Dr. Mamadou Diallo", specialty: "Médecine générale" },
  { id: "dr-kone", name: "Dr. Fatou Koné", specialty: "Dermatologie" },
  { id: "dr-traore", name: "Dr. Ibrahim Traoré", specialty: "Radiologie" },
  { id: "dr-ba", name: "Dr. Awa Ba", specialty: "Gynécologie" },
  { id: "dr-cisse", name: "Dr. Ousmane Cissé", specialty: "Pédiatrie" },
  { id: "dr-ndiaye", name: "Dr. Khady Ndiaye", specialty: "Endocrinologie" },
  { id: "dr-fall", name: "Dr. Cheikh Fall", specialty: "Neurologie" },
  { id: "dr-camara", name: "Dr. Mariam Camara", specialty: "Ophtalmologie" },
  { id: "dr-toure", name: "Dr. Seydou Touré", specialty: "Gastro-entérologie" },
  { id: "dr-bah", name: "Dr. Aïssatou Bah", specialty: "Pneumologie" },
  { id: "dr-sy", name: "Dr. Moussa Sy", specialty: "Rhumatologie" },
];

function initials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

const TYPE_META: Record<
  DocType,
  { Icon: typeof FileText; className: string }
> = {
  lab: { Icon: FlaskConical, className: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" },
  prescription: {
    Icon: Pill,
    className: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
  imaging: {
    Icon: ImageIcon,
    className: "bg-violet-100  text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  report: {
    Icon: Stethoscope,
    className: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  vaccination: {
    Icon: Syringe,
    className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  other: { Icon: FileText, className: "bg-muted text-muted-foreground" },
};

const TYPE_ORDER: DocType[] = ["lab", "prescription", "imaging", "report", "vaccination", "other"];

const BASE_DOCS: PatientDoc[] = [
  {
    id: "d1",
    name: "Ordonnance Dr. Sow",
    type: "prescription",
    note: "Traitement tension — 3 mois",
    date: "2026-05-10",
    sizeMb: 0.4,
    sharedWith: ["dr-sow"],
    source: "practitioner",
  },
  {
    id: "d2",
    name: "Analyse de sang complète",
    type: "lab",
    note: "Bilan lipidique + glycémie",
    date: "2026-05-05",
    sizeMb: 1.2,
    sharedWith: [],
    source: "me",
  },
  {
    id: "d3",
    name: "Radiographie thorax",
    type: "imaging",
    note: "",
    date: "2026-04-28",
    sizeMb: 8.6,
    sharedWith: ["dr-sow", "dr-traore", "dr-diallo", "dr-fall"],
    source: "practitioner",
  },
  {
    id: "d4",
    name: "Compte-rendu consultation",
    type: "report",
    note: "Suivi cardiologie",
    date: "2026-04-20",
    sizeMb: 0.3,
    sharedWith: ["dr-diallo"],
    source: "practitioner",
  },
  {
    id: "d5",
    name: "Carnet de vaccination",
    type: "vaccination",
    note: "Rappel DTP à jour",
    date: "2026-03-15",
    sizeMb: 2.1,
    sharedWith: [],
    source: "me",
  },
];

// Generate a larger, stable dataset so the list scales realistically (demo).
const SAMPLE_NAMES: Record<DocType, string[]> = {
  lab: ["Bilan sanguin", "Test glycémie", "Analyse d'urine", "Bilan thyroïdien"],
  prescription: ["Ordonnance renouvellement", "Ordonnance antibiotiques", "Ordonnance vitamines"],
  imaging: ["Échographie abdominale", "IRM genou", "Scanner cérébral", "Mammographie"],
  report: ["Compte-rendu opératoire", "Compte-rendu suivi", "Lettre de sortie"],
  vaccination: ["Certificat COVID-19", "Rappel vaccinal", "Vaccin grippe"],
  other: ["Justificatif mutuelle", "Feuille de soins", "Certificat médical"],
};

function buildDocs(): PatientDoc[] {
  const generated: PatientDoc[] = [];
  let n = 0;
  for (let i = 0; i < 60; i++) {
    const type = TYPE_ORDER[i % TYPE_ORDER.length];
    const names = SAMPLE_NAMES[type];
    const name = `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`;
    const day = String((i % 27) + 1).padStart(2, "0");
    const month = String((i % 12) + 1).padStart(2, "0");
    const shareCount = i % 4; // 0..3 doctors
    const sharedWith = DOCTORS.slice((i * 3) % DOCTORS.length)
      .slice(0, shareCount)
      .map((d) => d.id);
    generated.push({
      id: `g${n++}`,
      name,
      type,
      note: i % 3 === 0 ? "Document importé automatiquement" : "",
      date: `2026-${month}-${day}`,
      sizeMb: Math.round(((i % 10) + 0.3) * 10) / 10,
      sharedWith,
      source: i % 2 === 0 ? "me" : "practitioner",
    });
  }
  return [...BASE_DOCS, ...generated];
}

const INITIAL_DOCS: PatientDoc[] = buildDocs();

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(mb * 1024)} KB`;
}

function formatDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-");
  return locale === "en" ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

function DocumentsPage() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const [docs, setDocs] = useState<PatientDoc[]>(INITIAL_DOCS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareDocId, setShareDocId] = useState<string | null>(null);

  const usedMb = useMemo(() => docs.reduce((sum, d) => sum + d.sizeMb, 0), [docs]);
  const usedPct = Math.min(100, Math.round((usedMb / STORAGE_TOTAL_MB) * 100));
  const almostFull = usedPct >= 85;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = docs.filter((d) => {
      const matchesType = typeFilter === "all" || d.type === typeFilter;
      const matchesQuery =
        q === "" ||
        d.name.toLowerCase().includes(q) ||
        d.note.toLowerCase().includes(q) ||
        t(`patientDocs.types.${d.type}`).toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.date.localeCompare(b.date);
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.sizeMb - a.sizeMb;
        case "recent":
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [docs, query, typeFilter, sort, t]);

  // Reset pagination whenever the result set changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, typeFilter, sort]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const setSharedWith = (id: string, sharedWith: string[]) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, sharedWith } : d)));

  const addDoc = (doc: PatientDoc) => {
    setDocs((prev) => [doc, ...prev]);
    setUploadOpen(false);
  };

  const shareDoc = docs.find((d) => d.id === shareDocId) ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {t("patientDocs.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("patientDocs.subtitle")}</p>
        </div>
        <Button className="shrink-0 rounded-full" onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> {t("patientDocs.upload.cta")}
        </Button>
      </header>

      {/* Storage card */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold">{t("patientDocs.storage.title")}</h2>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                {t("patientDocs.storage.used", {
                  used: formatSize(usedMb),
                  total: formatSize(STORAGE_TOTAL_MB),
                })}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  almostFull ? "bg-amber-500" : "bg-[image:var(--gradient-brand)]",
                )}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            {almostFull && (
              <p className="mt-2 text-xs font-medium text-amber-600">
                {t("patientDocs.storage.almostFull")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Toolbar: search + filter + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("patientDocs.search")}
            className="rounded-full pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocType | "all")}>
          <SelectTrigger className="w-full rounded-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("patientDocs.filterAll")}</SelectItem>
            {TYPE_ORDER.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`patientDocs.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full rounded-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t("patientDocs.sort.recent")}</SelectItem>
            <SelectItem value="oldest">{t("patientDocs.sort.oldest")}</SelectItem>
            <SelectItem value="name">{t("patientDocs.sort.name")}</SelectItem>
            <SelectItem value="size">{t("patientDocs.sort.size")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {t("patientDocs.showing", { shown: shown.length, total: filtered.length })}
      </p>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-semibold">{t("patientDocs.empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("patientDocs.emptyHint")}</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {shown.map((doc) => {
              const meta = TYPE_META[doc.type];
              const sharedDoctors = DOCTORS.filter((dr) => doc.sharedWith.includes(dr.id));
              const isShared = sharedDoctors.length > 0;
              const chips = sharedDoctors.slice(0, MAX_CHIPS);
              const extra = sharedDoctors.length - chips.length;
              return (
                <li
                  key={doc.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 transition hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-center"
                >
                  <div
                    className={cn(
                      "grid h-11 w-11 flex-none place-items-center rounded-xl",
                      meta.className,
                    )}
                  >
                    <meta.Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold">{doc.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(`patientDocs.types.${doc.type}`)}
                      </span>
                      {isShared ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />{" "}
                          {t("patientDocs.share.withCount", { n: sharedDoctors.length })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {t("patientDocs.private")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {t(`patientDocs.addedBy.${doc.source}`)} · {formatDate(doc.date, locale)} ·{" "}
                      {formatSize(doc.sizeMb)}
                    </div>
                    {isShared && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {chips.map((dr) => (
                          <span
                            key={dr.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-0.5 pl-0.5 pr-2 text-[11px] font-medium"
                            title={`${dr.name} · ${dr.specialty}`}
                          >
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                              {initials(dr.name)}
                            </span>
                            {dr.name}
                          </span>
                        ))}
                        {extra > 0 && (
                          <button
                            type="button"
                            onClick={() => setShareDocId(doc.id)}
                            className="grid h-6 min-w-6 place-items-center rounded-full border border-border/60 bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
                            title={sharedDoctors
                              .slice(MAX_CHIPS)
                              .map((dr) => dr.name)
                              .join(", ")}
                          >
                            {t("patientDocs.moreDoctors", { n: extra })}
                          </button>
                        )}
                      </div>
                    )}
                    {doc.note && (
                      <p className="mt-1 truncate text-xs italic text-muted-foreground/80">
                        “{doc.note}”
                      </p>
                    )}
                  </div>

                  <div className="flex flex-none items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShareDocId(doc.id)}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full transition-colors",
                        isShared
                          ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      aria-label={t("patientDocs.share.manage")}
                      title={t("patientDocs.share.manage")}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={t("patientDocs.actions.download")}
                      title={t("patientDocs.actions.download")}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      aria-label={t("patientDocs.actions.delete")}
                      title={t("patientDocs.actions.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                {t("patientDocs.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onAdd={addDoc} />
      <ShareDialog
        doc={shareDoc}
        onOpenChange={(v) => !v && setShareDocId(null)}
        onChange={setSharedWith}
      />
    </div>
  );
}

function DoctorPicker({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return DOCTORS;
    return DOCTORS.filter(
      (dr) =>
        dr.name.toLowerCase().includes(needle) ||
        dr.specialty.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {t("patientDocs.share.selectedCount", { n: selected.length })}
        </span>
        {onClear && selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t("patientDocs.share.clear")}
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("patientDocs.share.search")}
          className="rounded-full pl-9"
        />
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {results.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {t("patientDocs.share.noResults")}
          </p>
        ) : (
          results.map((dr) => {
            const checked = selected.includes(dr.id);
            return (
              <button
                key={dr.id}
                type="button"
                onClick={() => onToggle(dr.id)}
                aria-pressed={checked}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                  checked
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-muted/40",
                )}
              >
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials(dr.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{dr.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {dr.specialty}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid h-5 w-5 flex-none place-items-center rounded-full border transition",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  )}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t("patientDocs.share.hint")}</p>
    </div>
  );
}

function ShareDialog({
  doc,
  onOpenChange,
  onChange,
}: {
  doc: PatientDoc | null;
  onOpenChange: (v: boolean) => void;
  onChange: (id: string, sharedWith: string[]) => void;
}) {
  const { t } = useTranslation();
  if (!doc) return null;

  const toggle = (drId: string) => {
    const next = doc.sharedWith.includes(drId)
      ? doc.sharedWith.filter((x) => x !== drId)
      : [...doc.sharedWith, drId];
    onChange(doc.id, next);
  };

  return (
    <Dialog open={!!doc} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> {t("patientDocs.share.title")}
          </DialogTitle>
          <DialogDescription>
            {t("patientDocs.share.description", { name: doc.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <DoctorPicker
            selected={doc.sharedWith}
            onToggle={toggle}
            onClear={() => onChange(doc.id, [])}
          />
        </div>

        <DialogFooter>
          <Button className="rounded-full" onClick={() => onOpenChange(false)}>
            {t("patientDocs.share.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (doc: PatientDoc) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<DocType>("lab");
  const [note, setNote] = useState("");
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [sizeMb, setSizeMb] = useState(0);

  const reset = () => {
    setName("");
    setType("lab");
    setNote("");
    setSharedWith([]);
    setFileName("");
    setSizeMb(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSizeMb(Math.max(0.1, file.size / (1024 * 1024)));
    if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
  };

  const toggleDoctor = (id: string) =>
    setSharedWith((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    onAdd({
      id: `d${Date.now()}`,
      name: name.trim(),
      type,
      note: note.trim(),
      date: iso,
      sizeMb: sizeMb || 0.3,
      sharedWith,
      source: "me",
    });
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("patientDocs.upload.title")}</DialogTitle>
          <DialogDescription>{t("patientDocs.upload.description")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto py-2 pr-1">
          {/* File dropzone */}
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-muted/30 px-4 py-6 text-center transition hover:border-primary/50 hover:bg-muted/50"
            >
              <UploadCloud className="h-7 w-7 text-primary" />
              {fileName ? (
                <span className="text-sm font-semibold text-foreground">{fileName}</span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-foreground">
                    {t("patientDocs.upload.choose")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("patientDocs.upload.fileHint")}
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-name">{t("patientDocs.upload.name")}</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("patientDocs.upload.namePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("patientDocs.upload.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as DocType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_ORDER.map((tp) => (
                  <SelectItem key={tp} value={tp}>
                    {t(`patientDocs.types.${tp}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-note">{t("patientDocs.upload.note")}</Label>
            <Textarea
              id="doc-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("patientDocs.upload.notePlaceholder")}
              rows={3}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-none text-primary" />
              <div>
                <div className="text-sm font-medium">{t("patientDocs.upload.share")}</div>
                <p className="text-xs text-muted-foreground">{t("patientDocs.upload.shareHint")}</p>
              </div>
            </div>
            <DoctorPicker
              selected={sharedWith}
              onToggle={toggleDoctor}
              onClear={() => setSharedWith([])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            <X className="mr-1.5 h-4 w-4" /> {t("patientDocs.upload.cancel")}
          </Button>
          <Button className="rounded-full" disabled={!canSubmit} onClick={submit}>
            <Upload className="mr-1.5 h-4 w-4" /> {t("patientDocs.upload.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
