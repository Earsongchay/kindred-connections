// Super Admin — append-only audit log. Prototype UI only.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/admin/audit")({
  head: () => ({ meta: [{ title: "Journal d'audit — Administration FUENI" }] }),
  component: AdminAudit,
});

type Category = "auth" | "kyc" | "account";
type Tone = "ok" | "warn" | "bad" | "muted";

type Entry = {
  ts: string;
  admin: string;
  category: Category;
  actionFr: string;
  actionEn: string;
  target: string;
  detailFr: string;
  detailEn: string;
  tone: Tone;
  flagged?: boolean;
};

const ENTRIES: Entry[] = [
  { ts: "2026-06-13 11:20", admin: "N. Veng", category: "kyc", actionFr: "Corrections demandées", actionEn: "Corrections requested", target: "Dr Ibrahim Touré", detailFr: "Attestation d'Ordre expirée", detailEn: "Board attestation expired", tone: "warn", flagged: true },
  { ts: "2026-06-13 08:55", admin: "C. Thor", category: "auth", actionFr: "Connexion réussie", actionEn: "Successful sign-in", target: "—", detailFr: "MFA e-mail validée", detailEn: "Email MFA validated", tone: "ok" },
  { ts: "2026-06-13 07:40", admin: "N. Veng", category: "auth", actionFr: "Connexion réussie", actionEn: "Successful sign-in", target: "—", detailFr: "MFA SMS validée", detailEn: "SMS MFA validated", tone: "ok" },
  { ts: "2026-06-13 07:38", admin: "N. Veng", category: "auth", actionFr: "Échec de connexion", actionEn: "Failed sign-in", target: "—", detailFr: "Mot de passe incorrect", detailEn: "Incorrect password", tone: "bad" },
  { ts: "2026-06-12 18:20", admin: "C. Thor", category: "auth", actionFr: "Déconnexion", actionEn: "Sign-out", target: "—", detailFr: "—", detailEn: "—", tone: "muted" },
  { ts: "2026-06-12 15:40", admin: "C. Thor", category: "kyc", actionFr: "Corrections demandées", actionEn: "Corrections requested", target: "Dr Ibrahim Touré", detailFr: "Pièce d'identité illisible", detailEn: "ID document unreadable", tone: "warn", flagged: true },
  { ts: "2026-06-12 15:30", admin: "C. Thor", category: "kyc", actionFr: "Dossier consulté", actionEn: "File viewed", target: "Dr Ibrahim Touré", detailFr: "—", detailEn: "—", tone: "muted" },
  { ts: "2026-06-12 14:00", admin: "N. Veng", category: "account", actionFr: "Compte réactivé", actionEn: "Account reactivated", target: "Dr Zoubir Amrani", detailFr: "Attestation renouvelée", detailEn: "Attestation renewed", tone: "ok" },
  { ts: "2026-06-11 16:45", admin: "N. Veng", category: "kyc", actionFr: "Dossier rejeté (définitif)", actionEn: "File rejected (final)", target: "« Dr » K. Faux", detailFr: "Documents falsifiés / fraude", detailEn: "Falsified documents / fraud", tone: "bad", flagged: true },
  { ts: "2026-06-11 10:00", admin: "C. Thor", category: "account", actionFr: "Compte suspendu", actionEn: "Account suspended", target: "Dr Zoubir Amrani", detailFr: "Licence médicale expirée", detailEn: "Medical license expired", tone: "warn", flagged: true },
  { ts: "2026-06-10 09:15", admin: "C. Thor", category: "kyc", actionFr: "Dossier validé", actionEn: "File validated", target: "Dr Fatou Bensouda", detailFr: "Tous justificatifs conformes", detailEn: "All documents compliant", tone: "ok" },
  { ts: "2026-06-10 08:02", admin: "N. Veng", category: "auth", actionFr: "Connexion réussie", actionEn: "Successful sign-in", target: "—", detailFr: "MFA TOTP validée", detailEn: "TOTP MFA validated", tone: "ok" },
  { ts: "2026-06-09 17:30", admin: "N. Veng", category: "account", actionFr: "Rôle modifié", actionEn: "Role updated", target: "C. Thor", detailFr: "Lecture seule → Vérificateur", detailEn: "Read-only → Reviewer", tone: "muted" },
  { ts: "2026-06-09 11:11", admin: "C. Thor", category: "kyc", actionFr: "Dossier consulté", actionEn: "File viewed", target: "Dr Aminata Diop", detailFr: "—", detailEn: "—", tone: "muted" },
];

const PAGE_SIZE = 10;

function AdminAudit() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [admin, setAdmin] = useState<"all" | string>("all");
  const [page, setPage] = useState(1);

  const catLabel = (c: Category) =>
    c === "auth"
      ? isEn ? "Authentication" : "Authentification"
      : c === "kyc"
        ? "KYC"
        : isEn ? "Account" : "Compte";

  const catChip = (c: Category) =>
    c === "auth"
      ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
      : c === "kyc"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : "bg-[#7c3aed]/10 text-[#7c3aed]";

  const toneDot = (t: Tone) =>
    t === "ok" ? "bg-emerald-500" : t === "warn" ? "bg-amber-500" : t === "bad" ? "bg-rose-500" : "bg-muted-foreground/40";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (admin !== "all" && e.admin !== admin) return false;
      if (!q) return true;
      const action = (isEn ? e.actionEn : e.actionFr).toLowerCase();
      const detail = (isEn ? e.detailEn : e.detailFr).toLowerCase();
      return action.includes(q) || detail.includes(q) || e.target.toLowerCase().includes(q);
    });
  }, [query, category, admin, isEn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7c3aed] text-[11px] font-bold text-white">
            SA
          </span>
          <span className="font-semibold text-foreground">Super Admin</span>
          <span aria-hidden>›</span>
          <span>{isEn ? "Audit log" : "Journal d'audit"}</span>
        </div>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <CalendarDays className="h-4 w-4" />
          {isEn ? "July 3, 2026" : "3 juillet 2026"}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isEn ? "Audit log" : "Journal d'audit"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEn
              ? "All admin actions, traced and attributed. Read-only."
              : "Toutes les actions des administrateurs, tracées et attribuées. Consultation seule."}
          </p>
        </div>
        <Button variant="outline" className="rounded-full">
          <Download className="mr-2 h-4 w-4" /> {isEn ? "Export (CSV)" : "Exporter (CSV)"}
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/30 dark:text-sky-200">
        <Lock className="mt-0.5 h-4 w-4 flex-none" />
        <span>
          <strong>{isEn ? "Immutable register" : "Registre inaltérable"}</strong> —{" "}
          {isEn
            ? "append-only, non-editable and non-deletable. Named individual accounts · retention to confirm (DPO)."
            : "ajout uniquement (append-only), non modifiable et non supprimable. Comptes nommés individuels · conservation à confirmer (DPO)."}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl pl-9"
            placeholder={isEn ? "Search an action, a reason…" : "Rechercher une action, un motif…"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as "all" | Category);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="all">{isEn ? "All categories" : "Toutes catégories"}</option>
          <option value="auth">{isEn ? "Authentication" : "Authentification"}</option>
          <option value="kyc">KYC</option>
          <option value="account">{isEn ? "Account" : "Compte"}</option>
        </select>
        <select
          value={admin}
          onChange={(e) => {
            setAdmin(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="all">{isEn ? "All admins" : "Tous les admins"}</option>
          <option value="C. Thor">C. Thor</option>
          <option value="N. Veng">N. Veng</option>
        </select>
        <div className="flex items-center rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground">
          {filtered.length} {isEn ? "events" : "événements"}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">{isEn ? "Timestamp" : "Horodatage"}</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">{isEn ? "Category" : "Catégorie"}</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">{isEn ? "Target" : "Cible"}</th>
              <th className="px-4 py-3 font-semibold">{isEn ? "Detail" : "Détail"}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((e, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{e.ts}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{e.admin}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", catChip(e.category))}>
                    {catLabel(e.category)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 flex-none rounded-full", toneDot(e.tone))} />
                    {isEn ? e.actionEn : e.actionFr}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.target}</td>
                <td className={cn("px-4 py-3", e.flagged ? "font-medium text-rose-600" : "text-muted-foreground")}>
                  {isEn ? e.detailEn : e.detailFr}
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {isEn ? "No events for these filters." : "Aucun événement pour ces filtres."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {pageItems.map((e, i) => (
          <li key={i} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", catChip(e.category))}>
                {catLabel(e.category)}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{e.ts}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <span className={cn("h-2 w-2 flex-none rounded-full", toneDot(e.tone))} />
              {isEn ? e.actionEn : e.actionFr}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {e.admin} · {e.target}
            </div>
            {e.detailFr !== "—" && (
              <div className={cn("mt-1 text-xs", e.flagged ? "font-medium text-rose-600" : "text-muted-foreground")}>
                {isEn ? e.detailEn : e.detailFr}
              </div>
            )}
          </li>
        ))}
        {pageItems.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            {isEn ? "No events for these filters." : "Aucun événement pour ces filtres."}
          </li>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {isEn ? "Page" : "Page"} {current} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground disabled:opacity-40 hover:enabled:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors",
                  n === current ? "bg-[#7c3aed] text-white" : "border border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground disabled:opacity-40 hover:enabled:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
