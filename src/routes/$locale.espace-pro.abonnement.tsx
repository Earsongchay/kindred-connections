// TODO Sprint 3-4 — Wire billing data. Pure UI prototype (pro subscription).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertCircle,
  Ban,
  CalendarSync,
  CreditCard,
  Download,
  Info,
  RefreshCw,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/espace-pro/abonnement")({
  head: () => ({ meta: [{ title: "Mon abonnement — FUENI" }] }),
  component: ProSubscription,
});

type Invoice = {
  id: string;
  date: string;
  period: string;
  amount: string;
  method: string;
  status: "paid";
  firstPayment?: boolean;
};

const INVOICES: Invoice[] = [
  { id: "FUENI-2026-000142", date: "15/06/2026", period: "15/06 → 14/07/2026", amount: "5 000 XOF", method: "Orange Money", status: "paid" },
  { id: "FUENI-2026-000098", date: "15/05/2026", period: "15/05 → 14/06/2026", amount: "5 000 XOF", method: "Orange Money", status: "paid" },
  { id: "FUENI-2026-000061", date: "15/04/2026", period: "15/04 → 14/05/2026", amount: "5 000 XOF", method: "Orange Money", status: "paid" },
  { id: "FUENI-2026-000024", date: "15/03/2026", period: "15/03 → 14/04/2026", amount: "5 000 XOF", method: "Orange Money", status: "paid", firstPayment: true },
];

function ProSubscription() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[image:var(--gradient-brand)] p-6 text-primary-foreground shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">
            {isEn ? "My subscription" : "Mon abonnement"}
          </h1>
          <p className="mt-1 text-sm opacity-90">
            {isEn
              ? "Manage your plan, payment method and invoices."
              : "Gérez votre formule, votre moyen de paiement et vos factures."}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
          <Sparkles className="h-4 w-4" />
          {isEn ? "Solo plan · Active" : "Formule Solo · Actif"}
        </div>
      </div>

      {/* Current plan card */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {isEn ? "Current plan" : "Formule actuelle"}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="text-3xl font-bold text-primary">Solo</div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {isEn ? "Active" : "Actif"}
          </span>
          <span className="text-sm text-muted-foreground">
            {annual
              ? isEn ? "Annual billing" : "Facturation annuelle"
              : isEn ? "Monthly billing" : "Facturation mensuelle"}
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <MetaItem
            label={isEn ? "Next renewal" : "Prochain renouvellement"}
            value="15/07/2026"
          />
          <MetaItem
            label={isEn ? "Amount" : "Montant"}
            value={annual ? "50 000 XOF / an" : "5 000 XOF / mois"}
          />
          <MetaItem
            label={isEn ? "Payment method" : "Moyen de paiement"}
            value={
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-primary" />
                Orange Money •• 45 67
              </span>
            }
          />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50/80 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          <p>
            {isEn
              ? "Mobile Money payments are not auto-debited: renew manually before the due date to avoid any interruption."
              : "Le paiement Mobile Money n'est pas prélevé automatiquement : renouvelez manuellement avant l'échéance pour éviter toute interruption."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <ActionButton primary icon={<RefreshCw className="h-4 w-4" />}>
            {isEn ? "Renew now" : "Renouveler maintenant"}
          </ActionButton>
          <ActionButton
            icon={<CalendarSync className="h-4 w-4" />}
            onClick={() => setAnnual((v) => !v)}
          >
            {annual
              ? isEn ? "Switch to monthly" : "Passer au mensuel"
              : isEn ? "Switch to annual (−17 %)" : "Passer à l'annuel (−17 %)"}
          </ActionButton>
          <ActionButton icon={<CreditCard className="h-4 w-4" />}>
            {isEn ? "Update payment method" : "Mettre à jour le paiement"}
          </ActionButton>
          <ActionButton danger icon={<Ban className="h-4 w-4" />}>
            {isEn ? "Cancel subscription" : "Annuler l'abonnement"}
          </ActionButton>
        </div>
      </section>

      {/* Billing history */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {isEn ? "Billing history" : "Historique de facturation"}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="py-2 pr-4 text-left">{isEn ? "Invoice #" : "N° facture"}</th>
                <th className="py-2 pr-4 text-left">Date</th>
                <th className="py-2 pr-4 text-left">{isEn ? "Period" : "Période"}</th>
                <th className="py-2 pr-4 text-left">{isEn ? "Amount" : "Montant"}</th>
                <th className="py-2 pr-4 text-left">{isEn ? "Method" : "Mode"}</th>
                <th className="py-2 pr-4 text-left">{isEn ? "Status" : "Statut"}</th>
                <th className="py-2 pr-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-border/50 align-middle transition hover:bg-background/60"
                >
                  <td className="py-3 pr-4 font-mono text-xs font-semibold">{inv.id}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{inv.date}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {inv.period}
                    {inv.firstPayment && (
                      <span className="ml-1 text-xs italic text-muted-foreground/80">
                        ({isEn ? "1st payment" : "1er paiement"})
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-semibold">{inv.amount}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{inv.method}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {isEn ? "Paid" : "Payé"}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          {isEn
            ? "Every payment generates an invoice, sent by email and available here."
            : "Chaque paiement génère une facture, envoyée par e-mail et disponible ici."}
        </p>
      </section>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  primary,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";
  const variant = primary
    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
    : danger
      ? "border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
      : "border border-border/60 bg-background text-foreground hover:border-primary/50 hover:text-primary";
  return (
    <button type="button" onClick={onClick} className={`${base} ${variant}`}>
      {icon}
      {children}
    </button>
  );
}
