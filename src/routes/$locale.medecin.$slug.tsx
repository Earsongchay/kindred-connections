// TODO Sprint 4 — Replace mock practitioner data with directory API + real cabinet photos/map.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accessibility,
  Award,
  BadgeCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  MapPin,
  ParkingSquare,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

const DOCTOR = {
  initials: "AD",
  name: "Dr Aboubacar Diallo",
  specialtyFr: "Cardiologie",
  specialtyEn: "Cardiology",
  cityFr: "Dakar, Cameroun",
  cityEn: "Dakar, Cameroon",
  boardNumber: "ONMS-2024-00871",
  boardFr: "Ordre des Médecins du Sénégal",
  boardEn: "Medical Board of Senegal",
  timezone: "WAT (UTC+1)",
};

const SITES: { fr: string; en: string; address: string }[] = [
  { fr: "Cabinet Plateau", en: "Plateau practice", address: "12, rue Carnot, Dakar" },
  { fr: "Hôpital Principal de Dakar", en: "Dakar Main Hospital", address: "Avenue Nelson Mandela, Dakar" },
  { fr: "Cabinet privé · Nouna", en: "Private practice · Nouna", address: "Rue de l'Hôpital, Nouna" },
];

const EXPERTISE_FR = [
  "Cardiologie",
  "Suivi des maladies chroniques",
  "Médecine préventive et dépistage",
  "Vaccination",
];
const EXPERTISE_EN = [
  "Cardiology",
  "Chronic disease follow-up",
  "Preventive medicine & screening",
  "Vaccination",
];

const HOURS: { fr: string; en: string; value: string }[] = [
  { fr: "Lundi", en: "Monday", value: "09:00–13:00, 15:00–18:00" },
  { fr: "Mardi", en: "Tuesday", value: "09:00–13:00, 15:00–18:00" },
  { fr: "Mercredi", en: "Wednesday", value: "09:00–13:00" },
  { fr: "Jeudi", en: "Thursday", value: "09:00–13:00, 15:00–18:00" },
  { fr: "Vendredi", en: "Friday", value: "09:00–13:00" },
  { fr: "Samedi", en: "Saturday", value: "" },
  { fr: "Dimanche", en: "Sunday", value: "" },
];

const REASONS: { fr: string; en: string; duration: string; price: string }[] = [
  { fr: "Consultation générale", en: "General consultation", duration: "30 min", price: "8 000 XOF" },
  { fr: "Suivi / renouvellement", en: "Follow-up / renewal", duration: "20 min", price: "6 000 XOF" },
];

const EDUCATION: { year: string; fr: string; en: string }[] = [
  { year: "2015", fr: "Doctorat en médecine — UCAD, Dakar", en: "MD — UCAD, Dakar" },
  { year: "2018", fr: "Assistant — CHU de Fann, service de cardiologie", en: "Assistant — Fann Hospital, cardiology" },
  { year: "2020", fr: "Cabinet privé — Dakar Plateau", en: "Private practice — Dakar Plateau" },
];

export const Route = createFileRoute("/$locale/medecin/$slug")({
  head: ({ params }) => {
    const isEn = params.locale === "en";
    const title = isEn
      ? `${DOCTOR.name} — ${DOCTOR.specialtyEn} in Dakar | FUENI`
      : `${DOCTOR.name} — ${DOCTOR.specialtyFr} à Dakar | FUENI`;
    const description = isEn
      ? `Book an appointment with ${DOCTOR.name}, verified cardiologist in Dakar. Hours, fees, languages and practice locations on FUENI.`
      : `Prenez rendez-vous avec ${DOCTOR.name}, cardiologue vérifié à Dakar. Horaires, tarifs, langues et cabinets sur FUENI.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PublicDoctorPage,
});

function PublicDoctorPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const [siteIndex, setSiteIndex] = useState(0);

  const expertise = isEn ? EXPERTISE_EN : EXPERTISE_FR;
  const languages = isEn ? ["French", "English", "Wolof"] : ["Français", "Anglais", "Wolof"];
  const site = SITES[siteIndex];

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Hero */}
        <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 flex-none place-items-center rounded-full bg-[image:var(--gradient-brand)] text-2xl font-bold text-primary-foreground">
              {DOCTOR.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{DOCTOR.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" /> {isEn ? "FUENI verified" : "Vérifié FUENI"}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {isEn ? DOCTOR.specialtyEn : DOCTOR.specialtyFr}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {isEn ? DOCTOR.cityEn : DOCTOR.cityFr}
              </div>
            </div>
            <Link
              to="/$locale/inscription"
              params={{ locale }}
              className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              <CalendarDays className="h-4 w-4" /> {isEn ? "Book an appointment" : "Prendre rendez-vous"}
            </Link>
          </div>
        </section>

        <div className="mt-5 space-y-5">
          {/* About */}
          <Section title={isEn ? "About" : "À propos"} icon={<Stethoscope className="h-4 w-4" />}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isEn
                ? "Board-certified physician, I support my patients in routine health monitoring, prevention and chronic conditions. Consultations by appointment, in French, English and Wolof."
                : "Médecin généraliste diplômé, j'accompagne mes patients dans le suivi de santé courant, la prévention et les pathologies chroniques. Consultations sur rendez-vous, en français, anglais et wolof."}
            </p>
          </Section>

          {/* Expertise */}
          <Section title={isEn ? "Areas of expertise" : "Domaines d'expertise"} icon={<Award className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {expertise.map((e, i) => (
                <Chip key={e} highlighted={i === 0}>
                  {e}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Languages */}
          <Section title={isEn ? "Languages spoken" : "Langues parlées"} icon={<Languages className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <Chip key={l}>{l}</Chip>
              ))}
            </div>
          </Section>

          {/* Location */}
          <Section title={isEn ? "Location" : "Localisation"} icon={<MapPin className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {SITES.map((s, i) => (
                <button
                  key={s.fr}
                  type="button"
                  onClick={() => setSiteIndex(i)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    i === siteIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {isEn ? s.en : s.fr}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
              <span>
                {site.address}, {isEn ? DOCTOR.cityEn : DOCTOR.cityFr}
              </span>
            </div>

            <div className="mt-3 grid h-44 place-items-center rounded-xl border border-dashed border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground">
              {isEn ? "Practice map" : "Carte du cabinet"}
            </div>

            <div className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {isEn ? "Accessibility" : "Accessibilité"}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip>
                <Accessibility className="mr-1 inline h-3.5 w-3.5" />
                {isEn ? "Wheelchair access" : "Accès fauteuil roulant"}
              </Chip>
              <Chip>
                <ParkingSquare className="mr-1 inline h-3.5 w-3.5" />
                {isEn ? "Parking nearby" : "Parking à proximité"}
              </Chip>
            </div>

            <div className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {isEn ? "Practice photos" : "Photos du cabinet"}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-border/70 bg-muted/40 text-muted-foreground"
                >
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
            </div>
          </Section>

          {/* Hours */}
          <Section title={isEn ? "Consultation hours" : "Horaires de consultation"} icon={<Clock className="h-4 w-4" />}>
            <ul className="divide-y divide-border/60">
              {HOURS.map((h) => (
                <li key={h.fr} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{isEn ? h.en : h.fr}</span>
                  {h.value ? (
                    <span className="text-muted-foreground">{h.value}</span>
                  ) : (
                    <span className="text-xs font-semibold uppercase text-muted-foreground/70">
                      {isEn ? "Closed" : "Fermé"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {isEn ? "Local time at the practice" : "Heure locale du lieu"} · {DOCTOR.timezone}
            </p>
          </Section>

          {/* Pricing */}
          <Section title={isEn ? "Consultation fees" : "Tarifs des consultations"} icon={<Wallet className="h-4 w-4" />}>
            <ul className="space-y-2">
              {REASONS.map((r) => (
                <li
                  key={r.fr}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold">{isEn ? r.en : r.fr}</div>
                    <div className="text-xs text-muted-foreground">{r.duration}</div>
                  </div>
                  <span className="text-sm font-bold text-primary">{r.price}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Education */}
          <Section
            title={isEn ? "Training & experience" : "Formation & expériences"}
            icon={<GraduationCap className="h-4 w-4" />}
          >
            <ul className="space-y-3">
              {EDUCATION.map((e) => (
                <li key={e.year} className="flex gap-4">
                  <span className="w-12 flex-none text-sm font-bold text-primary">{e.year}</span>
                  <span className="text-sm text-muted-foreground">{isEn ? e.en : e.fr}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Legal */}
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold">{isEn ? "Legal information" : "Informations légales"}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <BadgeCheck className="h-3 w-3" /> {isEn ? "FUENI verified" : "Vérifié FUENI"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                label={isEn ? "Medical board number" : "N° d'ordre médical"}
                value={DOCTOR.boardNumber}
              />
              <InfoRow
                label={isEn ? "Registration board" : "Ordre d'inscription"}
                value={isEn ? DOCTOR.boardEn : DOCTOR.boardFr}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chip({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
        highlighted ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
      )}
    >
      {highlighted && <BadgeCheck className="mr-1 h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
