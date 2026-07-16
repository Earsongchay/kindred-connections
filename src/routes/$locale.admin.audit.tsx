// Admin — Journal d'audit (read-only, append-only).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/admin/audit")({
  head: () => ({
    meta: [
      { title: "Journal d'audit — Admin FUENI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAudit,
});

type Category = "kyc" | "account" | "billing" | "security" | "system";

type Entry = {
  id: string;
  at: string;
  actor: string;
  category: Category;
  action: string;
  target: string;
  ip?: string;
};

const CATEGORY_META: Record<Category, { label: string; badge: string }> = {
  kyc: { label: "KYC", badge: "bg-violet-100 text-violet-800" },
  account: { label: "Compte", badge: "bg-blue-100 text-blue-800" },
  billing: { label: "Facturation", badge: "bg-emerald-100 text-emerald-800" },
  security: { label: "Sécurité", badge: "bg-rose-100 text-rose-800" },
  system: { label: "Système", badge: "bg-slate-100 text-slate-700" },
};

const ENTRIES: Entry[] = [
  { id: "e1", at: "25 juin 2026 · 09:12", actor: "Moussa T.", category: "kyc", action: "Dossier validé", target: "Dr F. Bensouda (ONMB-2024-00077)", ip: "10.24.1.14" },
  { id: "e2", at: "24 juin 2026 · 17:44", actor: "Awa N.", category: "kyc", action: "Corrections demandées", target: "Dr I. Touré (ONM-ML-2024-00102)", ip: "10.24.1.09" },
  { id: "e3", at: "24 juin 2026 · 08:03", actor: "Système", category: "system", action: "SLA 48h dépassé", target: "Dr A. Diop (ONMS-2024-00871)" },
  { id: "e4", at: "23 juin 2026 · 15:41", actor: "Moussa T.", category: "account", action: "Compte suspendu", target: "patient #48211", ip: "10.24.1.14" },
  { id: "e5", at: "23 juin 2026 · 11:08", actor: "Moussa T.", category: "kyc", action: "Dossier validé", target: "Dr O. Ouédraogo", ip: "10.24.1.14" },
  { id: "e6", at: "22 juin 2026 · 15:20", actor: "Awa N.", category: "kyc", action: "Corrections demandées", target: "Dr I. Touré", ip: "10.24.1.09" },
  { id: "e7", at: "22 juin 2026 · 10:02", actor: "Système", category: "security", action: "Tentative de connexion échouée (x3)", target: "admin@fueni.com", ip: "196.202.14.88" },
  { id: "e8", at: "21 juin 2026 · 18:00", actor: "Awa N.", category: "billing", action: "Remboursement traité", target: "abonnement #A-2214 (12 000 XOF)", ip: "10.24.1.09" },
  { id: "e9", at: "21 juin 2026 · 09:34", actor: "Moussa T.", category: "account", action: "Rôle modifié", target: "user #1024 (Support → Admin)", ip: "10.24.1.14" },
  { id: "e10", at: "20 juin 2026 · 21:11", actor: "Système", category: "system", action: "Sauvegarde quotidienne OK", target: "base primaire" },
  { id: "e11", at: "20 juin 2026 · 14:22", actor: "Awa N.", category: "kyc", action: "Dossier validé", target: "Dr S. Koffi", ip: "10.24.1.09" },
  { id: "e12", at: "20 juin 2026 · 09:41", actor: "Système", category: "kyc", action: "Justificatifs déposés", target: "Dr A. Diop (6 pièces)" },
];

const PAGE_SIZE = 8;

function AdminAudit() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [actor, setActor] = useState<string>("all");
  const [page, setPage] = useState(1);

  const actors = useMemo(() => {
    const set = new Set(ENTRIES.map((e) => e.actor));
    return ["all", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ENTRIES.filter((e) => category === "all" || e.category === category)
      .filter((e) => actor === "all" || e.actor === actor)
      .filter((e) =>
        needle
          ? e.action.toLowerCase().includes(needle) ||
            e.target.toLowerCase().includes(needle) ||
            e.actor.toLowerCase().includes(needle)
          : true,
      );
  }, [q, category, actor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminShell locale={locale} section="audit" breadcrumb="Journal d'audit" pendingCount={8}>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Journal d'audit</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Registre en lecture seule (append-only) des actions administratives et évènements système.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category | "all");
            setPage(1);
          }}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORY_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          value={actor}
          onChange={(e) => {
            setActor(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
        >
          {actors.map((a) => (
            <option key={a} value={a}>
              {a === "all" ? "Tous les acteurs" : a}
            </option>
          ))}
        </select>
        <div className="relative ml-auto w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher une action, une cible…"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Horodatage</th>
              <th className="px-4 py-3 font-semibold">Acteur</th>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Cible</th>
              <th className="px-4 py-3 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageEntries.map((e) => {
              const cat = CATEGORY_META[e.category];
              return (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500">{e.at}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{e.actor}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", cat.badge)}>
                      {cat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-900">{e.action}</td>
                  <td className="px-4 py-3 text-slate-600">{e.target}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.ip ?? "—"}</td>
                </tr>
              );
            })}
            {pageEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Aucun évènement ne correspond à ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {pageEntries.map((e) => {
          const cat = CATEGORY_META[e.category];
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", cat.badge)}>
                  {cat.label}
                </span>
                <span className="text-xs text-slate-500">{e.at}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{e.action}</div>
              <div className="text-xs text-slate-600">{e.target}</div>
              <div className="mt-1 text-xs text-slate-500">
                {e.actor}
                {e.ip ? ` · ${e.ip}` : ""}
              </div>
            </div>
          );
        })}
        {pageEntries.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aucun évènement ne correspond à ces filtres.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <div>
          {filtered.length} évènement{filtered.length > 1 ? "s" : ""} · page {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Précédent
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
