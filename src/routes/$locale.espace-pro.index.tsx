// TODO Sprint 3-4 — Wire actual data. Pure UI prototype (pro dashboard).
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  FileText,
  LifeBuoy,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

type KycState = "pending" | "incomplete" | "revision" | "validated" | "ok";

export const Route = createFileRoute("/$locale/espace-pro/")({
  head: () => ({ meta: [{ title: "Tableau de bord praticien — FUENI" }] }),
  validateSearch: (search: Record<string, unknown>): { state?: KycState } => {
    const s = search.state;
    if (s === "pending" || s === "incomplete" || s === "revision" || s === "validated" || s === "ok") {
      return { state: s };
    }
    return {};
  },
  component: ProDashboard,
});

type ApptStatus = "confirmed" | "pending";
type Appt = {
  time: string;
  initials: string;
  name: string;
  kindFr: string;
  kindEn: string;
  status: ApptStatus;
};

const APPTS: Appt[] = [
  { time: "09:00", initials: "MS", name: "Mariama Sow", kindFr: "Consultation", kindEn: "Consultation", status: "confirmed" },
  { time: "09:45", initials: "OB", name: "Ousmane Bâ", kindFr: "Suivi", kindEn: "Follow-up", status: "confirmed" },
  { time: "10:30", initials: "FN", name: "Fatou Ndiaye", kindFr: "Téléconsultation", kindEn: "Telehealth", status: "pending" },
  { time: "11:15", initials: "AK", name: "Aminata Koné", kindFr: "Contrôle", kindEn: "Check-up", status: "confirmed" },
  { time: "15:00", initials: "IT", name: "Ibrahim Traoré", kindFr: "Consultation", kindEn: "Consultation", status: "pending" },
];

const RECENT_PATIENTS = [
  { initials: "MS", name: "Mariama Sow", date: "18/05/2026" },
  { initials: "CD", name: "Cheikh Diop", date: "17/05/2026" },
  { initials: "AK", name: "Aminata Koné", date: "16/05/2026" },
  { initials: "OB", name: "Ousmane Bâ", date: "15/05/2026" },
];

function ProDashboard() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [kyc, setKyc] = useState<KycState>(search.state ?? "pending");

  const showKycGate = kyc !== "ok";

  return (
    <div className="relative space-y-5">
      {showKycGate && (
        <KycGate state={kyc} isEn={isEn} locale={locale} onChange={setKyc} />
      )}
      {!phoneVerified && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
            <p>
              <span className="font-semibold">
                {isEn ? "Phone not verified." : "Téléphone non vérifié."}
              </span>{" "}
              {isEn
                ? "Verify it to sign in by SMS and receive urgent alerts."
                : "Vérifiez-le pour pouvoir vous connecter par SMS et recevoir les alertes urgentes."}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setPhoneVerified(true)}
            className="rounded-full bg-amber-500 text-white hover:bg-amber-600"
          >
            {isEn ? "Verify now" : "Vérifier maintenant"}
          </Button>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[image:var(--gradient-brand)] p-6 text-primary-foreground shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">
            {isEn ? "Hello Dr Diallo" : "Bonjour Dr Diallo"}{" "}
            <span className="ml-1" aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm opacity-90">
            {isEn ? "Here is today's activity." : "Voici votre activité du jour."}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white/90"
        >
          <CalendarPlus className="h-4 w-4" /> {isEn ? "New appointment" : "Nouveau rendez-vous"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          tone="teal"
          value="128"
          label={isEn ? "Patients" : "Patients"}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          tone="emerald"
          value="6"
          label={isEn ? "Today's appointments" : "Rendez-vous du jour"}
          icon={<CalendarPlus className="h-4 w-4" />}
        />
        <StatCard
          tone="rose"
          value="2"
          label={isEn ? "Pending documents" : "Documents en attente"}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <CalendarPlus className="h-4 w-4 text-primary" />
              {isEn ? "Today's schedule" : "Agenda du jour"}
            </h2>
            <button className="text-xs font-semibold text-primary hover:underline">
              {isEn ? "View all →" : "Tout voir →"}
            </button>
          </header>
          <ul className="space-y-2">
            {APPTS.map((a) => (
              <li
                key={a.time + a.name}
                className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
              >
                <div className="grid h-12 w-14 flex-none place-items-center rounded-xl bg-muted font-mono text-xs font-bold">
                  {a.time}
                </div>
                <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{a.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {isEn ? a.kindEn : a.kindFr}
                  </div>
                </div>
                <span
                  className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    a.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                  }`}
                >
                  {a.status === "confirmed"
                    ? isEn ? "Confirmed" : "Confirmé"
                    : isEn ? "Pending" : "En attente"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4 text-primary" />
              {isEn ? "Recent patients" : "Derniers patients"}
            </h2>
          </header>
          <ul className="space-y-2">
            {RECENT_PATIENTS.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
              >
                <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  tone,
  value,
  label,
  icon,
}: {
  tone: "teal" | "emerald" | "rose";
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  const toneClasses =
    tone === "teal"
      ? "bg-primary/10 text-primary"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300";
  const valueTone =
    tone === "teal"
      ? "text-primary"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-300"
        : "text-rose-600 dark:text-rose-300";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
      <div className={`inline-grid h-9 w-9 place-items-center rounded-xl ${toneClasses}`}>
        {icon}
      </div>
      <div className={`mt-3 text-3xl font-bold tracking-tight ${valueTone}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function KycGate({
  state,
  isEn,
  locale,
  onChange,
}: {
  state: KycState;
  isEn: boolean;
  locale: Locale;
  onChange: (s: KycState) => void;
}) {
  const isIncomplete = state === "incomplete";
  const isRevision = state === "revision";
  const isValidated = state === "validated";
  const isPending = state === "pending";

  const title = isIncomplete
    ? isEn ? "Finish your verification" : "Finalisez votre vérification"
    : isRevision
      ? isEn ? "Your file needs updates" : "Votre dossier doit être complété"
      : isValidated
        ? isEn ? "File validated — activate your Solo plan" : "Dossier validé — activez votre plan Solo"
        : isEn ? "Verification in progress" : "Vérification en cours";

  const description = isIncomplete
    ? isEn
      ? "Your account is created. Complete your KYC file to activate your practitioner space."
      : "Votre compte est créé. Complétez votre dossier de vérification (justificatifs KYC) pour activer votre espace médecin."
    : isRevision
      ? isEn
        ? "One or more documents were flagged « To correct ». Fix them to restart the review."
        : "Une ou plusieurs pièces ont été signalées « À corriger ». Corrigez-les pour relancer la vérification."
      : isValidated
        ? isEn
          ? "Congratulations, your profile is verified. Pay your first term to activate Solo and unlock all features. Meanwhile you can use the Free plan."
          : "Félicitations, votre profil est vérifié. Réglez votre premier terme pour activer le plan Solo et débloquer toutes les fonctionnalités. En attendant, vous pouvez utiliser le plan Free."
        : isEn
          ? "Your account is created, but medical features stay disabled while we verify your health professional profile."
          : "Votre compte est créé, mais les fonctionnalités médicales restent désactivées le temps de vérifier votre profil de professionnel de santé.";

  const iconTone = isRevision
    ? "bg-rose-100 text-rose-600"
    : isValidated
      ? "bg-emerald-100 text-emerald-600"
      : isIncomplete
        ? "bg-amber-100 text-amber-600"
        : "bg-amber-100 text-amber-600";

  const Icon = isRevision ? AlertTriangle : isValidated ? ShieldCheck : isIncomplete ? FileText : ShieldCheck;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-background p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl ${iconTone}`}>
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        {isPending && (
          <ol className="mt-6 space-y-3">
            <StepRow
              status="done"
              title={isEn ? "Account created" : "Compte créé"}
              caption={isEn ? "Signup confirmed" : "Inscription confirmée"}
            />
            <StepRow
              status="done"
              title={isEn ? "Plan subscribed" : "Plan souscrit"}
              caption={isEn ? "Solo plan — active" : "Plan Solo — actif"}
            />
            <StepRow
              status="pending"
              title={isEn ? "Practitioner profile review" : "Vérification du profil médecin"}
              caption={
                isEn
                  ? "Checking your license number and documents"
                  : "Contrôle du numéro d'Ordre et des justificatifs"
              }
              badge={isEn ? "Max delay: 48h" : "Délai max : 48 h"}
            />
          </ol>
        )}

        {isPending && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/50 p-3 text-xs text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4 flex-none" />
            <span>
              {isEn
                ? "You'll receive an email as soon as your profile is validated."
                : "Vous recevrez un e-mail dès que votre profil est validé."}
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {isIncomplete && (
            <Button className="w-full rounded-full">
              {isEn ? "Complete my file" : "Compléter mon dossier de vérification"}
            </Button>
          )}
          {isRevision && (
            <Button className="w-full rounded-full">
              {isEn ? "Fix my file" : "Corriger mon dossier"}
            </Button>
          )}
          {isValidated && (
            <>
              <Button className="w-full rounded-full">
                {isEn ? "Pay and activate Solo" : "Payer et activer Solo"}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => onChange("ok")}
              >
                {isEn ? "Stay on Free for now" : "Rester sur Free pour l'instant"}
              </Button>
            </>
          )}
          {!isValidated && (
            <a
              href="mailto:support@fueni.com"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              <LifeBuoy className="h-4 w-4" /> {isEn ? "Contact support" : "Contacter le support"}
            </a>
          )}
        </div>

        <div className="mt-6 border-t border-border/60 pt-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {isEn ? "Demo — preview states" : "Démo — aperçu des états"}
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <DemoChip active={state === "pending"} onClick={() => onChange("pending")}>
              {isEn ? "In review" : "En attente"}
            </DemoChip>
            <DemoChip active={state === "incomplete"} onClick={() => onChange("incomplete")}>
              {isEn ? "To complete" : "À compléter"}
            </DemoChip>
            <DemoChip active={state === "revision"} onClick={() => onChange("revision")}>
              {isEn ? "To correct" : "À corriger"}
            </DemoChip>
            <DemoChip active={state === "validated"} onClick={() => onChange("validated")}>
              {isEn ? "Validated" : "Validé"}
            </DemoChip>
            <DemoChip active={false} onClick={() => onChange("ok")}>
              {isEn ? "Skip (demo)" : "Ignorer (démo)"}
            </DemoChip>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            <Link
              to="/$locale/espace-pro"
              params={{ locale }}
              search={{ state: "ok" }}
              className="underline hover:text-foreground"
            >
              {isEn ? "Open full dashboard" : "Voir le tableau de bord complet"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRow({
  status,
  title,
  caption,
  badge,
}: {
  status: "done" | "pending";
  title: string;
  caption: string;
  badge?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full ${
          status === "done"
            ? "bg-emerald-100 text-emerald-600"
            : "bg-amber-100 text-amber-600"
        }`}
      >
        {status === "done" ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{caption}</div>
        {badge && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <AlertTriangle className="h-3 w-3" /> {badge}
          </div>
        )}
      </div>
    </li>
  );
}

function DemoChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

