// TODO Sprint 3-4 — Wire to backend storage & sharing. Pure UI prototype (cf. §4.4).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

type PatientDoc = {
  id: string;
  name: string;
  type: DocType;
  note: string;
  date: string; // ISO yyyy-mm-dd (stable for SSR)
  sizeMb: number;
  shared: boolean;
  source: "me" | "practitioner";
};

const STORAGE_TOTAL_MB = 5120; // 5 GB

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
    className: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
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

const INITIAL_DOCS: PatientDoc[] = [
  {
    id: "d1",
    name: "Ordonnance Dr. Sow",
    type: "prescription",
    note: "Traitement tension — 3 mois",
    date: "2026-05-10",
    sizeMb: 0.4,
    shared: true,
    source: "practitioner",
  },
  {
    id: "d2",
    name: "Analyse de sang complète",
    type: "lab",
    note: "Bilan lipidique + glycémie",
    date: "2026-05-05",
    sizeMb: 1.2,
    shared: false,
    source: "me",
  },
  {
    id: "d3",
    name: "Radiographie thorax",
    type: "imaging",
    note: "",
    date: "2026-04-28",
    sizeMb: 8.6,
    shared: true,
    source: "practitioner",
  },
  {
    id: "d4",
    name: "Compte-rendu consultation",
    type: "report",
    note: "Suivi cardiologie",
    date: "2026-04-20",
    sizeMb: 0.3,
    shared: true,
    source: "practitioner",
  },
  {
    id: "d5",
    name: "Carnet de vaccination",
    type: "vaccination",
    note: "Rappel DTP à jour",
    date: "2026-03-15",
    sizeMb: 2.1,
    shared: false,
    source: "me",
  },
];

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
  const [uploadOpen, setUploadOpen] = useState(false);

  const usedMb = useMemo(() => docs.reduce((sum, d) => sum + d.sizeMb, 0), [docs]);
  const usedPct = Math.min(100, Math.round((usedMb / STORAGE_TOTAL_MB) * 100));
  const almostFull = usedPct >= 85;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      const matchesType = typeFilter === "all" || d.type === typeFilter;
      const matchesQuery =
        q === "" ||
        d.name.toLowerCase().includes(q) ||
        d.note.toLowerCase().includes(q) ||
        t(`patientDocs.types.${d.type}`).toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [docs, query, typeFilter, t]);

  const toggleShare = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, shared: !d.shared } : d)));

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const addDoc = (doc: PatientDoc) => {
    setDocs((prev) => [doc, ...prev]);
    setUploadOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("patientDocs.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("patientDocs.subtitle")}</p>
        </div>
        <Button className="rounded-full" onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> {t("patientDocs.upload.cta")}
        </Button>
      </header>

      {/* Storage card */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">{t("patientDocs.storage.title")}</h2>
              <span className="text-xs font-semibold text-muted-foreground">
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

      {/* Toolbar: search + filter */}
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
          <SelectTrigger className="w-full rounded-full sm:w-56">
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
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {t("patientDocs.count", { n: filtered.length })}
      </p>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-semibold">{t("patientDocs.empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("patientDocs.emptyHint")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((doc) => {
            const meta = TYPE_META[doc.type];
            return (
              <li
                key={doc.id}
                className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 transition hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-center"
              >
                <div className={cn("grid h-11 w-11 flex-none place-items-center rounded-xl", meta.className)}>
                  <meta.Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold">{doc.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t(`patientDocs.types.${doc.type}`)}
                    </span>
                    {doc.shared ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <ShieldCheck className="h-3 w-3" /> {t("patientDocs.shared")}
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
                  {doc.note && (
                    <p className="mt-1 truncate text-xs italic text-muted-foreground/80">
                      “{doc.note}”
                    </p>
                  )}
                </div>

                <div className="flex flex-none items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleShare(doc.id)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full transition-colors",
                      doc.shared
                        ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-label={doc.shared ? t("patientDocs.actions.unshare") : t("patientDocs.actions.share")}
                    title={doc.shared ? t("patientDocs.actions.unshare") : t("patientDocs.actions.share")}
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
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onAdd={addDoc} />
    </div>
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
  const [shared, setShared] = useState(true);
  const [fileName, setFileName] = useState("");
  const [sizeMb, setSizeMb] = useState(0);

  const reset = () => {
    setName("");
    setType("lab");
    setNote("");
    setShared(true);
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
      shared,
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

        <div className="space-y-4 py-2">
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

          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <Activity className="mt-0.5 h-4 w-4 flex-none text-primary" />
              <div>
                <div className="text-sm font-medium">{t("patientDocs.upload.share")}</div>
                <p className="text-xs text-muted-foreground">{t("patientDocs.upload.shareHint")}</p>
              </div>
            </div>
            <Switch checked={shared} onCheckedChange={setShared} />
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
