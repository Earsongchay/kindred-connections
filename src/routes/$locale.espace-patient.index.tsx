// TODO Sprint 3-4 — Wire actual data. Pure UI per §4.4.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  FileImage,
  FileText,
  FolderOpen,
  Info,
  MailCheck,
  Plus,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { sessionForm } from "@/lib/session-form";
import { OtpVerificationModal } from "@/components/site/OtpVerificationModal";

export const Route = createFileRoute("/$locale/espace-patient/")({
  head: () => ({ meta: [{ title: "Tableau de bord — FUENI" }] }),
  component: Dashboard,
});

const EMAIL_VALID_CODE = "654321";

const PROFILE_OPTIONAL_FIELDS = [
  "address",
  "postalCode",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
] as const;

function computeCompletion(profile: Record<string, string> | null): number {
  if (!profile) return 0;
  const filled = PROFILE_OPTIONAL_FIELDS.filter((f) => !!profile[f]).length;
  return Math.round((filled / PROFILE_OPTIONAL_FIELDS.length) * 100);
}

type Appt = {
  day: string;
  monthFr: string;
  monthEn: string;
  doctor: string;
  metaFr: string;
  metaEn: string;
};

const APPTS: Appt[] = [
  {
    day: "18",
    monthFr: "Mai",
    monthEn: "May",
    doctor: "Dr. Mamadou Sow",
    metaFr: "Cardiologie · 14:30 · Cabinet Médical Plateau, Dakar",
    metaEn: "Cardiology · 2:30 PM · Plateau Medical Office, Dakar",
  },
  {
    day: "02",
    monthFr: "Juin",
    monthEn: "Jun",
    doctor: "Dr. Fatou Ndiaye",
    metaFr: "Médecine générale · 10:00 · Clinique Pasteur",
    metaEn: "General medicine · 10:00 AM · Clinique Pasteur",
  },
];

type DocTone = "rose" | "blue" | "amber";
type Doc = {
  tone: DocTone;
  icon: React.ReactNode;
  title: string;
  metaFr: string;
  metaEn: string;
  status: "new" | "pending" | "seen";
};

const DOCS: Doc[] = [
  {
    tone: "rose",
    icon: <FileText className="h-4 w-4" />,
    title: "Ordonnance Dr. Sow",
    metaFr: "Partagé par praticien · 10/05/2026",
    metaEn: "Shared by practitioner · 10/05/2026",
    status: "new",
  },
  {
    tone: "blue",
    icon: <FileImage className="h-4 w-4" />,
    title: "Résultat analyse sang",
    metaFr: "Mon upload · 05/05/2026 · En attente validation",
    metaEn: "My upload · 05/05/2026 · Pending validation",
    status: "pending",
  },
  {
    tone: "amber",
    icon: <Stethoscope className="h-4 w-4" />,
    title: "Compte-rendu Dr. Diallo",
    metaFr: "Partagé par praticien · 28/04/2026",
    metaEn: "Shared by practitioner · 28/04/2026",
    status: "seen",
  },
];

function Dashboard() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";

  const [emailVerified, setEmailVerified] = useState(() => sessionForm.getEmailVerified());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [softGateContext, setSoftGateContext] = useState<"email" | "booking" | null>(null);
  const [firstName, setFirstName] = useState("Aïssatou");
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const name = sessionForm.getFirstName();
    if (name) setFirstName(name);
    const profile = sessionForm.getProfile();
    setCompletion(computeCompletion(profile));
  }, []);

  const handleEmailVerified = () => {
    sessionForm.setEmailVerified(true);
    setEmailVerified(true);
    setShowEmailModal(false);
    setSoftGateContext(null);
  };

  const handleBookClick = () => {
    if (!emailVerified) {
      setSoftGateContext("booking");
      setShowEmailModal(true);
    } else {
      window.alert(isEn ? "Coming soon!" : "Bientôt disponible !");
    }
  };

  return (
    <div className="space-y-5">
      {/* Email verification banner — §4.2.2 */}
      {!emailVerified && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
            <p>
              <span className="font-semibold">{t("dashboard.emailBanner.title")}</span>{" "}
              {t("dashboard.emailBanner.description")}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSoftGateContext("email");
              setShowEmailModal(true);
            }}
            className="rounded-full bg-amber-500 text-white hover:bg-amber-600"
          >
            {t("dashboard.emailBanner.cta")}
          </Button>
        </div>
      )}

      {/* Welcome hero — uses brand gradient */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[image:var(--gradient-brand)] p-6 text-primary-foreground shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">
            {isEn ? `Hello ${firstName}` : `Bonjour ${firstName}`}{" "}
            <span className="ml-1" aria-hidden>
              👋
            </span>
          </h1>
          <p className="mt-1 text-sm opacity-90">{t("dashboard.welcomeSub")}</p>
        </div>
        <button
          type="button"
          onClick={handleBookClick}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" /> {t("dashboard.bookCta")}
        </button>
      </div>

      {/* Two-column lists */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Upcoming appointments */}
        <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Calendar className="h-4 w-4 text-primary" />
              {t("dashboard.appointments.title")}
            </h2>
            <button
              type="button"
              onClick={handleBookClick}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("dashboard.viewAll")}
            </button>
          </header>

          <ul className="space-y-2">
            {APPTS.map((a) => (
              <li
                key={a.day + a.doctor}
                className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
              >
                <div className="grid h-14 w-14 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
                  <div className="text-center leading-tight">
                    <div className="text-lg font-bold">{a.day}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide">
                      {isEn ? a.monthEn : a.monthFr}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{a.doctor}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {isEn ? a.metaEn : a.metaFr}
                  </div>
                </div>
                <span className="flex-none rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {t("dashboard.appointments.statusConfirmed")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent documents */}
        <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <FolderOpen className="h-4 w-4 text-primary" />
              {t("dashboard.documents.title")}
            </h2>
            <button
              type="button"
              onClick={handleBookClick}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("dashboard.viewAll")}
            </button>
          </header>

          <ul className="space-y-2">
            {DOCS.map((d) => (
              <li
                key={d.title}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-background"
              >
                <div
                  className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${
                    d.tone === "rose"
                      ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                      : d.tone === "blue"
                        ? "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                  }`}
                >
                  {d.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{d.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {isEn ? d.metaEn : d.metaFr}
                  </div>
                </div>
                <span
                  className={`flex-none rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    d.status === "new"
                      ? "bg-muted text-foreground"
                      : d.status === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d.status === "new"
                    ? t("dashboard.documents.statusNew")
                    : d.status === "pending"
                      ? t("dashboard.documents.statusPending")
                      : t("dashboard.documents.statusSeen")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Discreet profile completion cue */}
      <Link
        to="/$locale/espace-patient/profil"
        params={{ locale }}
        className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm transition hover:border-primary/40 hover:bg-card sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>
            {t("dashboard.completionCue.lead")}{" "}
            <strong className="font-semibold text-foreground">
              {t("dashboard.completionCue.strong")}
            </strong>{" "}
            {t("dashboard.completionCue.tail")}{" "}
            <span className="text-muted-foreground/70">
              {t("dashboard.completionCue.optional")}
              {completion > 0 ? ` · ${completion}%` : ""}
            </span>
          </span>
        </div>
        <span className="font-semibold text-primary group-hover:underline">
          {t("dashboard.completionCue.link")}
        </span>
      </Link>

      {/* OTP modal */}
      {showEmailModal && (
        <OtpVerificationModal
          title={
            softGateContext === "booking"
              ? t("dashboard.emailOtp.softGateTitle")
              : t("dashboard.emailOtp.title")
          }
          description={
            softGateContext === "booking"
              ? t("dashboard.emailOtp.softGateDesc")
              : `${t("dashboard.emailOtp.description")} ${t("dashboard.emailOtp.maskedEmail")}.`
          }
          validCode={EMAIL_VALID_CODE}
          resendCooldownSeconds={120}
          expirySeconds={600}
          showSpamHint
          onVerified={handleEmailVerified}
          onClose={() => {
            setShowEmailModal(false);
            setSoftGateContext(null);
          }}
          showDevHint
        />
      )}
    </div>
  );
}
