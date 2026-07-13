// Super Admin — practitioner file verification (KYC). Prototype UI only.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/admin/verifications")({
  head: () => ({ meta: [{ title: "Vérification des dossiers — Administration FUENI" }] }),
  component: AdminVerifications,
});

type Status = "pending" | "validated" | "revision" | "rejected";

type Doctor = {
  id: string;
  initials: string;
  name: string;
  email: string;
  specialty: string;
  flag: string;
  country: string;
  wait: string;
  overdue?: boolean;
  order: string;
  status: Status;
};

const DOCTORS: Doctor[] = [
  { id: "d1", initials: "AD", name: "Dr Aminata Diop", email: "aminata.diop@exemple.sn", specialty: "Cardiologie", flag: "🇸🇳", country: "Sénégal", wait: "52h — dépassé", overdue: true, order: "ONMS-2024-00871", status: "pending" },
  { id: "d2", initials: "KM", name: "Dr Kwame Mensah", email: "k.mensah@exemple.ci", specialty: "Médecine générale", flag: "🇨🇮", country: "Côte d'Ivoire", wait: "28h", order: "CNOM-CI-2024-00214", status: "pending" },
  { id: "d3", initials: "IT", name: "Dr Ibrahim Touré", email: "i.toure@exemple.ml", specialty: "Pédiatrie", flag: "🇲🇱", country: "Mali", wait: "12h", order: "ONM-ML-2024-00102", status: "revision" },
  { id: "d4", initials: "FB", name: "Dr Fatou Bensouda", email: "f.bensouda@exemple.bj", specialty: "Dermatologie", flag: "🇧🇯", country: "Bénin", wait: "5h", order: "ONMB-2024-00077", status: "validated" },
  { id: "d5", initials: "MS", name: "Dr Mariama Sylla", email: "m.sylla@exemple.tg", specialty: "Gynéco-obstétrique", flag: "🇹🇬", country: "Togo", wait: "19h", order: "ONMT-2024-00188", status: "pending" },
  { id: "d6", initials: "OO", name: "Dr Ousmane Ouédraogo", email: "o.ouedraogo@exemple.bf", specialty: "Médecine générale", flag: "🇧🇫", country: "Burkina Faso", wait: "34h", order: "ONMBF-2024-00131", status: "validated" },
  { id: "d7", initials: "AK", name: "Dr Adama Kané", email: "a.kane@exemple.ne", specialty: "Pédiatrie", flag: "🇳🇪", country: "Niger", wait: "9h", order: "ONMN-2024-00059", status: "revision" },
  { id: "d8", initials: "JM", name: "Dr Jean Mukendi", email: "j.mukendi@exemple.cd", specialty: "Cardiologie", flag: "🇨🇩", country: "RD Congo", wait: "3h", order: "CNOM-CD-2024-00302", status: "pending" },
  { id: "d9", initials: "KN", name: "Dr Khadija Ndiaye", email: "k.ndiaye@exemple.sn", specialty: "Dermatologie", flag: "🇸🇳", country: "Sénégal", wait: "41h", order: "ONMS-2024-00912", status: "pending" },
  { id: "d10", initials: "SK", name: "Dr Samuel Koffi", email: "s.koffi@exemple.ci", specialty: "Cardiologie", flag: "🇨🇮", country: "Côte d'Ivoire", wait: "30h", order: "CNOM-CI-2024-00255", status: "pending" },
];

const DOCS = [
  { key: "id", labelFr: "Pièce d'identité", labelEn: "ID document", metaFr: "Délivrée 12/03/2021 · expire 12/03/2031" },
  { key: "diploma", labelFr: "Diplôme médical", labelEn: "Medical degree" },
  { key: "order", labelFr: "Attestation d'inscription à l'Ordre", labelEn: "Medical board registration", metaFr: "Délivrée 02/01/2026 · expire 31/12/2026" },
  { key: "rib", labelFr: "RIB / Mobile Money", labelEn: "Bank / Mobile Money" },
  { key: "address", labelFr: "Justificatif de domicile (< 3 mois)", labelEn: "Proof of address (< 3 months)" },
  { key: "rcpro", labelFr: "Attestation RC Pro (optionnel)", labelEn: "Professional liability (optional)", metaFr: "Délivrée 01/01/2026 · expire 31/12/2026" },
];

function AdminVerifications() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Doctor | null>(null);

  const statusLabel = (s: Status) =>
    s === "pending"
      ? isEn ? "Pending" : "En attente"
      : s === "validated"
        ? isEn ? "Validated" : "Validé"
        : s === "revision"
          ? isEn ? "To correct" : "À corriger"
          : isEn ? "Rejected" : "Rejeté";

  const statusChip = (s: Status) =>
    s === "pending"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
      : s === "validated"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : s === "revision"
          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
          : "bg-muted text-muted-foreground";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCTORS.filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.order.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const pendingCount = DOCTORS.filter((d) => d.status === "pending").length;

  const tabs: { key: "all" | Status; label: string; count?: number }[] = [
    { key: "all", label: isEn ? "All" : "Tous" },
    { key: "pending", label: isEn ? "Pending" : "En attente", count: pendingCount },
    { key: "validated", label: isEn ? "Validated" : "Validé" },
    { key: "revision", label: isEn ? "To correct" : "À corriger" },
    { key: "rejected", label: isEn ? "Rejected" : "Rejeté" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7c3aed] text-[11px] font-bold text-white">
            SA
          </span>
          <span className="font-semibold text-foreground">Super Admin</span>
          <span aria-hidden>›</span>
          <span>{isEn ? "File verification" : "Vérification des dossiers"}</span>
        </div>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <CalendarDays className="h-4 w-4" />
          {isEn ? "June 25, 2026" : "25 juin 2026"}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEn ? "Practitioner file verification" : "Vérification des dossiers médecins"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEn
            ? "Review KYC documents, validate the account or request corrections."
            : "Examinez les justificatifs KYC, validez le compte ou demandez des corrections."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="amber" value="9" label={isEn ? "Pending" : "En attente"} icon={<Clock className="h-4 w-4" />} />
        <StatCard tone="emerald" value="37" label={isEn ? "Validated this month" : "Validés ce mois"} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard tone="rose" value="3" label={isEn ? "To correct" : "À corriger"} icon={<RotateCcw className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === tab.key
                  ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count != null && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#7c3aed] px-1 text-[10px] font-bold text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-full pl-9"
            placeholder={isEn ? "Search by name, email, order no…" : "Rechercher par nom, e-mail, n° d'ordre…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {filtered.map((d) => (
          <li
            key={d.id}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center",
              d.overdue && "border-l-4 border-l-rose-500",
            )}
          >
            <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#7c3aed]/10 text-xs font-bold text-[#7c3aed]">
              {d.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold">{d.name}</span>
                <span className="rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
                  {isEn ? "Doctor" : "Médecin"}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {d.email} · {d.specialty} · {d.flag} {d.country}
              </div>
              <div className={cn("mt-1 flex items-center gap-1 text-xs", d.overdue ? "font-semibold text-rose-600" : "text-muted-foreground")}>
                <Clock className="h-3.5 w-3.5" />
                {d.wait} · N° {d.order}
              </div>
            </div>
            <div className="flex flex-none items-center justify-between gap-3 sm:flex-col sm:items-end">
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", statusChip(d.status))}>
                {statusLabel(d.status)}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-[#7c3aed]/40 text-[#7c3aed] hover:bg-[#7c3aed]/10"
                onClick={() => setSelected(d)}
              >
                <Eye className="mr-1.5 h-4 w-4" /> {isEn ? "Review" : "Examiner"}
              </Button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            {isEn ? "No files for these filters." : "Aucun dossier pour ces filtres."}
          </li>
        )}
      </ul>

      {selected && (
        <ReviewDrawer
          doctor={selected}
          isEn={isEn}
          statusLabel={statusLabel}
          statusChip={statusChip}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ReviewDrawer({
  doctor,
  isEn,
  statusLabel,
  statusChip,
  onClose,
}: {
  doctor: Doctor;
  isEn: boolean;
  statusLabel: (s: Status) => string;
  statusChip: (s: Status) => string;
  onClose: () => void;
}) {
  const [marks, setMarks] = useState<Record<string, "ok" | "fix" | undefined>>({});

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold">{isEn ? "File review" : "Examen du dossier"}</h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{isEn ? "Doctor" : "Médecin"}</span>
              <span className={cn("rounded-full px-2 py-0.5 font-semibold", statusChip(doctor.status))}>
                {statusLabel(doctor.status)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#7c3aed]/10 text-sm font-bold text-[#7c3aed]">
              {doctor.initials}
            </div>
            <div>
              <div className="text-base font-bold">{doctor.name}</div>
              <div className="text-xs text-muted-foreground">{doctor.email}</div>
            </div>
          </div>

          <Section title={isEn ? "Professional information" : "Informations professionnelles"}>
            <Field label={isEn ? "Specialty" : "Spécialité"} value={doctor.specialty} />
            <Field label={isEn ? "Order no." : "N° d'ordre"} value={doctor.order} />
            <Field label={isEn ? "Location" : "Localisation"} value={`${doctor.flag} ${doctor.country}`} />
          </Section>

          <div>
            <h3 className="mb-1 text-sm font-bold">
              {isEn ? "Documents" : "Justificatifs"}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {isEn ? "Mark each item Compliant or To correct." : "Marquez chaque pièce Conforme ou À corriger."}
            </p>
            <ul className="space-y-2">
              {DOCS.map((doc) => {
                const mark = marks[doc.key];
                return (
                  <li key={doc.key} className="rounded-xl border border-border/60 bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{isEn ? doc.labelEn : doc.labelFr}</div>
                        {doc.metaFr && !isEn && (
                          <div className="text-xs text-muted-foreground">{doc.metaFr}</div>
                        )}
                      </div>
                      <button className="inline-flex flex-none items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:underline">
                        <Eye className="h-3.5 w-3.5" /> {isEn ? "View" : "Voir"}
                      </button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMarks((m) => ({ ...m, [doc.key]: "ok" }))}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                          mark === "ok"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isEn ? "Compliant" : "Conforme"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarks((m) => ({ ...m, [doc.key]: "fix" }))}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                          mark === "fix"
                            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isEn ? "To correct" : "À corriger"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-[#7c3aed]/20 bg-[#7c3aed]/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[#7c3aed]" />
            <span>
              {isEn
                ? "Corrections keep the account PENDING_KYC (doctor re-submits). Rejection is terminal (REJECTED)."
                : "Corrections : reste PENDING_KYC, le médecin re-soumet. Rejet : refus définitif → REJECTED (terminal)."}
            </span>
          </div>
        </div>

        <div className="sticky bottom-0 space-y-2 border-t border-border/60 bg-background/95 p-5 backdrop-blur">
          <Button onClick={onClose} className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isEn ? "Validate file — activate account" : "Valider le dossier — activer le compte"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onClose} variant="outline" className="rounded-full">
              {isEn ? "Request corrections" : "Demander des corrections"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              {isEn ? "Reject (final)" : "Rejeter (définitif)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function StatCard({
  tone,
  value,
  label,
  icon,
}: {
  tone: "amber" | "emerald" | "rose";
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  const toneClasses = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  }[tone];
  const valueTone = {
    amber: "text-amber-600 dark:text-amber-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    rose: "text-rose-600 dark:text-rose-300",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className={`inline-grid h-9 w-9 place-items-center rounded-xl ${toneClasses}`}>{icon}</div>
      <div className={`mt-3 text-3xl font-bold tracking-tight ${valueTone}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
