// TODO Sprint 3-4 — Wire actual data. Pure UI prototype (pro dashboard).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, FileText, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/espace-pro/")({
  head: () => ({ meta: [{ title: "Tableau de bord praticien — FUENI" }] }),
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
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const [phoneVerified, setPhoneVerified] = useState(false);

  return (
    <div className="space-y-5">
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
