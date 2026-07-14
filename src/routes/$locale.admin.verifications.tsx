// Admin — Vérification des dossiers médecins (KYC review)
// Mirrors reference at /21-admin-verifications.html, now including "Historique du dossier".
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  History,
  Hourglass,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/admin/verifications")({
  head: () => ({ meta: [{ title: "Vérification des dossiers — Admin FUENI" }] }),
  component: AdminVerifications,
});

type KycStatus = "pending" | "validated" | "revision" | "rejected";

type Doctor = {
  id: string;
  initials: string;
  name: string;
  email: string;
  specialty: string;
  country: string;
  flag: string;
  hours: number;
  overdue?: boolean;
  order: string;
  status: KycStatus;
};

const DOCTORS: Doctor[] = [
  { id: "d1", initials: "AD", name: "Dr Aminata Diop", email: "aminata.diop@exemple.sn", specialty: "Cardiologie", country: "Sénégal", flag: "🇸🇳", hours: 52, overdue: true, order: "ONMS-2024-00871", status: "pending" },
  { id: "d2", initials: "KM", name: "Dr Kwame Mensah", email: "k.mensah@exemple.ci", specialty: "Médecine générale", country: "Côte d'Ivoire", flag: "🇨🇮", hours: 28, order: "CNOM-CI-2024-00214", status: "pending" },
  { id: "d3", initials: "IT", name: "Dr Ibrahim Touré", email: "i.toure@exemple.ml", specialty: "Pédiatrie", country: "Mali", flag: "🇲🇱", hours: 12, order: "ONM-ML-2024-00102", status: "revision" },
  { id: "d4", initials: "FB", name: "Dr Fatou Bensouda", email: "f.bensouda@exemple.bj", specialty: "Dermatologie", country: "Bénin", flag: "🇧🇯", hours: 5, order: "ONMB-2024-00077", status: "validated" },
  { id: "d5", initials: "MS", name: "Dr Mariama Sylla", email: "m.sylla@exemple.tg", specialty: "Gynéco-obstétrique", country: "Togo", flag: "🇹🇬", hours: 19, order: "ONMT-2024-00188", status: "pending" },
  { id: "d6", initials: "OO", name: "Dr Ousmane Ouédraogo", email: "o.ouedraogo@exemple.bf", specialty: "Médecine générale", country: "Burkina Faso", flag: "🇧🇫", hours: 34, order: "ONMBF-2024-00131", status: "validated" },
  { id: "d7", initials: "AK", name: "Dr Adama Kané", email: "a.kane@exemple.ne", specialty: "Pédiatrie", country: "Niger", flag: "🇳🇪", hours: 9, order: "ONMN-2024-00059", status: "revision" },
  { id: "d8", initials: "JM", name: "Dr Jean Mukendi", email: "j.mukendi@exemple.cd", specialty: "Cardiologie", country: "RD Congo", flag: "🇨🇩", hours: 3, order: "CNOM-CD-2024-00302", status: "pending" },
  { id: "d9", initials: "KN", name: "Dr Khadija Ndiaye", email: "k.ndiaye@exemple.sn", specialty: "Dermatologie", country: "Sénégal", flag: "🇸🇳", hours: 41, order: "ONMS-2024-00912", status: "pending" },
  { id: "d10", initials: "SK", name: "Dr Samuel Koffi", email: "s.koffi@exemple.ci", specialty: "Cardiologie", country: "Côte d'Ivoire", flag: "🇨🇮", hours: 30, order: "CNOM-CI-2024-00255", status: "pending" },
];

const STATUS_META: Record<KycStatus, { label: string; badge: string; bar: string }> = {
  pending: { label: "En attente", badge: "bg-amber-100 text-amber-800", bar: "bg-amber-400" },
  validated: { label: "Validé", badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-400" },
  revision: { label: "À corriger", badge: "bg-orange-100 text-orange-800", bar: "bg-orange-400" },
  rejected: { label: "Rejeté", badge: "bg-rose-100 text-rose-800", bar: "bg-rose-400" },
};

type Filter = "all" | KycStatus;

function AdminVerifications() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Doctor | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return DOCTORS.filter((d) => (filter === "all" ? true : d.status === filter)).filter((d) =>
      needle
        ? d.name.toLowerCase().includes(needle) ||
          d.email.toLowerCase().includes(needle) ||
          d.order.toLowerCase().includes(needle)
        : true,
    );
  }, [filter, q]);

  const counts = useMemo(
    () => ({
      pending: DOCTORS.filter((d) => d.status === "pending").length,
      validated: 37,
      revision: DOCTORS.filter((d) => d.status === "revision").length,
    }),
    [],
  );

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
          <SideItem icon={LayoutDashboard} label="Vue d'ensemble" soon />
        </SideGroup>

        <SideGroup label="Gestion">
          <SideItem icon={ShieldCheck} label="Vérification des dossiers" active badge={counts.pending} />
          <SideItem icon={BadgeCheck} label="Abonnements" soon />
          <SideItem icon={History} label="Journal d'audit" />
        </SideGroup>

        <SideGroup label="Configuration">
          <SideItem icon={FileText} label="Plans" soon />
          <SideItem icon={CreditCard} label="Tarification" soon />
        </SideGroup>

        <div className="mt-auto pt-6">
          <SideItem icon={LogOut} label="Déconnexion" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">SA</span>
            <span className="font-semibold text-slate-900">Super Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span>Vérification des dossiers</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden items-center gap-1.5 md:flex">
              <CalendarClock className="h-4 w-4 text-slate-400" /> 25 juin 2026
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">admin@fueni.com</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Vérification des dossiers médecins
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Examinez les justificatifs KYC, validez le compte ou demandez des corrections.
            </p>
          </div>

          {/* KPI cards */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Kpi icon={Hourglass} tone="amber" value={counts.pending} label="En attente" />
            <Kpi icon={BadgeCheck} tone="emerald" value={counts.validated} label="Validés ce mois" />
            <Kpi icon={RotateCcw} tone="orange" value={counts.revision} label="À corriger" />
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Tous</FilterChip>
            <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")}>
              En attente <span className="ml-1 rounded-full bg-amber-200/70 px-1.5 text-[10px] font-bold text-amber-900">{counts.pending}</span>
            </FilterChip>
            <FilterChip active={filter === "validated"} onClick={() => setFilter("validated")}>Validé</FilterChip>
            <FilterChip active={filter === "revision"} onClick={() => setFilter("revision")}>À corriger</FilterChip>
            <FilterChip active={filter === "rejected"} onClick={() => setFilter("rejected")}>Rejeté</FilterChip>
            <div className="relative ml-auto w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par nom, e-mail, n° d'ordre…"
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} onOpen={() => setSelected(d)} />
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Aucun dossier ne correspond à ces filtres.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review drawer */}
      {selected && <ReviewDrawer doctor={selected} onClose={() => setSelected(null)} locale={locale} />}
    </div>
  );
}

/* ------------------------------ Sidebar bits ------------------------------ */

function SideGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SideItem({
  icon: Icon,
  label,
  active,
  soon,
  badge,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  soon?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        active ? "bg-white/15 text-white font-semibold" : "text-white/75 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {typeof badge === "number" && (
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">{badge}</span>
      )}
      {soon && (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
          Bientôt
        </span>
      )}
    </button>
  );
}

/* ------------------------------ KPI + Chips ------------------------------ */

function Kpi({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Hourglass;
  tone: "amber" | "emerald" | "orange";
  value: number;
  label: string;
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  } as const;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none text-slate-900">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Doctor card ------------------------------ */

function DoctorCard({ doctor, onOpen }: { doctor: Doctor; onOpen: () => void }) {
  const meta = STATUS_META[doctor.status];
  return (
    <div className={cn("relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center")}>
      <span className={cn("absolute inset-y-0 left-0 w-1 rounded-l-2xl", meta.bar)} aria-hidden />
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 ml-1">
        {doctor.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-semibold text-slate-900">{doctor.name}</div>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Médecin</span>
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", meta.badge)}>{meta.label}</span>
        </div>
        <div className="mt-0.5 text-sm text-slate-600">
          {doctor.email} · {doctor.specialty} · <span className="align-middle">{doctor.flag}</span> {doctor.country}
        </div>
        <div className={cn("mt-1 flex items-center gap-1.5 text-xs", doctor.overdue ? "font-semibold text-rose-600" : "text-slate-500")}>
          <Clock className="h-3.5 w-3.5" />
          {doctor.hours}h{doctor.overdue ? " — dépassé" : ""} · N° {doctor.order}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 self-start rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 sm:self-center"
      >
        Examiner
      </button>
    </div>
  );
}

/* ------------------------------ Review drawer ---------------------------- */

type PieceState = "pending" | "ok" | "fix";
type Piece = { id: string; label: string; sub?: string; state: PieceState };

const INITIAL_PIECES: Piece[] = [
  { id: "id", label: "Pièce d'identité", sub: "Délivrée 12/03/2021 · expire 12/03/2031", state: "pending" },
  { id: "diploma", label: "Diplôme médical", state: "pending" },
  { id: "order", label: "Attestation d'inscription à l'Ordre (ou équiv.)", sub: "Délivrée 02/01/2026 · expire 31/12/2026", state: "pending" },
  { id: "rib", label: "RIB / Mobile Money", state: "pending" },
  { id: "address", label: "Justificatif de domicile (< 3 mois)", state: "pending" },
  { id: "rc", label: "Attestation RC Pro (optionnel)", sub: "Délivrée 01/01/2026 · expire 31/12/2026", state: "pending" },
];

type HistoryEvent = {
  at: string;
  actor: string;
  title: string;
  detail?: string;
  tone: "neutral" | "positive" | "warning" | "danger";
};

function historyFor(d: Doctor): HistoryEvent[] {
  const base: HistoryEvent[] = [
    { at: "20 juin 2026 · 09:14", actor: d.name, title: "Compte créé", detail: `Inscription via le portail praticien (${d.email}).`, tone: "neutral" },
    { at: "20 juin 2026 · 09:41", actor: d.name, title: "Justificatifs déposés", detail: "6 pièces soumises (identité, diplôme, ordre, RIB, domicile, RC Pro).", tone: "neutral" },
    { at: "20 juin 2026 · 10:02", actor: "Système", title: "Vérification automatique", detail: "Contrôles OCR & anti-fraude — aucun signal bloquant.", tone: "positive" },
  ];
  if (d.status === "revision") {
    base.push({
      at: "22 juin 2026 · 15:20",
      actor: "Awa N. (Admin)",
      title: "Corrections demandées",
      detail: "Justificatif de domicile illisible + RIB expiré. Reste PENDING_KYC, en attente du dépôt corrigé.",
      tone: "warning",
    });
  }
  if (d.status === "validated") {
    base.push({
      at: "23 juin 2026 · 11:08",
      actor: "Moussa T. (Admin)",
      title: "Dossier validé",
      detail: "Toutes les pièces conformes. Compte activé, notification e-mail envoyée.",
      tone: "positive",
    });
  }
  if (d.overdue) {
    base.push({
      at: "24 juin 2026 · 08:00",
      actor: "Système",
      title: "SLA 48h dépassé",
      detail: "Le dossier est en attente au-delà du délai de traitement standard.",
      tone: "danger",
    });
  }
  return base.reverse();
}

function ReviewDrawer({ doctor, onClose, locale }: { doctor: Doctor; onClose: () => void; locale: Locale }) {
  const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const meta = STATUS_META[doctor.status];
  const events = historyFor(doctor);

  const setPiece = (id: string, state: PieceState) =>
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, state } : p)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Examen du dossier</div>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Médecin</span>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", meta.badge)}>{meta.label}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <Section title="Identité" icon={Mail}>
            <Field label="E-mail" value={doctor.email} />
            <Field label="Pays" value={`${doctor.flag} ${doctor.country}`} />
          </Section>

          <Section title="Informations professionnelles" icon={Stethoscope}>
            <Field label="Spécialité" value={doctor.specialty} />
            <Field label="N° d'ordre" value={doctor.order} />
            <Field label="Localisation" value={doctor.country} icon={MapPin} />
          </Section>

          {/* Historique du dossier — CASE HISTORY */}
          <Section title="Historique du dossier" icon={History}>
            <ol className="relative space-y-4 border-l border-slate-200 pl-5">
              {events.map((e, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full ring-4 ring-white",
                      e.tone === "positive" && "bg-emerald-500",
                      e.tone === "warning" && "bg-amber-500",
                      e.tone === "danger" && "bg-rose-500",
                      e.tone === "neutral" && "bg-slate-400",
                    )}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <div className="text-sm font-semibold text-slate-900">{e.title}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{e.at}</div>
                  </div>
                  <div className="text-xs text-slate-500">Par {e.actor}</div>
                  {e.detail && <p className="mt-1 text-sm text-slate-600">{e.detail}</p>}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span>Journal d'audit complet disponible dans l'onglet dédié.</span>
              <button type="button" className="font-semibold text-violet-700 hover:underline">Voir tout</button>
            </div>
          </Section>

          <Section
            title="Justificatifs — marquez chaque pièce Conforme ou À corriger"
            icon={FileText}
          >
            <div className="space-y-2">
              {pieces.map((p) => (
                <PieceRow key={p.id} piece={p} onSet={(s) => setPiece(p.id, s)} />
              ))}
            </div>
          </Section>

          <Section title="Déclarations" icon={Shield}>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Authenticité des documents</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Vérification Ordre autorisée</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Code de conduite accepté</li>
            </ul>
          </Section>

          {rejectOpen && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <div className="mb-2 text-sm font-semibold text-rose-800">
                Motif du rejet définitif (texte libre · 200 car. max)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full rounded-lg border border-rose-200 bg-white p-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                placeholder="Ex : diplôme non authentifiable après contre-vérification…"
              />
              <div className="mt-1 text-right text-[11px] text-rose-500">{rejectReason.length}/200</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                  Confirmer le rejet définitif
                </button>
                <button type="button" onClick={() => setRejectOpen(false)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Annuler
                </button>
              </div>
              <p className="mt-2 text-[11px] text-rose-700">
                Action <strong>terminale</strong> — le compte passe en <strong>REJECTED</strong>. Le médecin est notifié et ne re-soumet pas librement (recours via support).
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <p className="mb-3 text-[11px] text-slate-500">
            <strong>Corrections</strong> : cochez les pièces + motif → reste <strong>PENDING_KYC</strong>, le médecin re-soumet.
            <strong> Rejet</strong> : refus définitif → <strong>REJECTED</strong> (terminal).
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              <BadgeCheck className="h-4 w-4" /> Valider le dossier — activer le compte
            </button>
            <button type="button" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
              Demander des corrections
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen((v) => !v)}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Rejeter le dossier (refus définitif)
            </button>
          </div>
          <Link
            to="/$locale/espace-pro"
            params={{ locale }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
          >
            Voir le dossier côté médecin (démo) →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h3>
      <div className="rounded-xl border border-slate-200 bg-white p-4">{children}</div>
    </section>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Mail }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-none">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {value}
      </div>
    </div>
  );
}

function PieceRow({ piece, onSet }: { piece: Piece; onSet: (s: PieceState) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-900">{piece.label}</div>
        {piece.sub && <div className="text-[11px] text-slate-500">{piece.sub}</div>}
      </div>
      <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        Voir
      </button>
      <div className="inline-flex overflow-hidden rounded-full border border-slate-200">
        <button
          type="button"
          onClick={() => onSet("ok")}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition",
            piece.state === "ok" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Conforme
        </button>
        <button
          type="button"
          onClick={() => onSet("fix")}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition",
            piece.state === "fix" ? "bg-orange-500 text-white" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          À corriger
        </button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _iconRefs = [Building2];
