// TODO Sprint 3-4 — Wire real profile data + edit forms. Prototype public profile.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accessibility,
  Award,
  BadgeCheck,
  Clock,
  Eye,
  GraduationCap,
  Languages,
  MapPin,
  Pencil,
  ParkingSquare,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro/profil-public")({
  head: () => ({ meta: [{ title: "Mon profil public — FUENI" }] }),
  component: PublicProfilePage,
});

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
  { fr: "Téléconsultation", en: "Telehealth", duration: "20 min", price: "6 000 XOF" },
];

const EDUCATION: { year: string; fr: string; en: string }[] = [
  { year: "2015", fr: "Doctorat en médecine — UCAD, Dakar", en: "MD — UCAD, Dakar" },
  { year: "2018", fr: "Assistant — CHU de Fann, service de cardiologie", en: "Assistant — Fann Hospital, cardiology" },
  { year: "2020", fr: "Cabinet privé — Dakar Plateau", en: "Private practice — Dakar Plateau" },
];

function PublicProfilePage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const [visible, setVisible] = useState(true);

  const expertise = ["Cardiologie", "Suivi des maladies chroniques", "Médecine préventive et dépistage", "Vaccination"];
  const subSpecialties = ["Hypertension artérielle", "Cardiologie interventionnelle", "Rythmologie"];
  const languages = isEn ? ["French", "English", "Wolof"] : ["Français", "Anglais", "Wolof"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEn ? "My public profile" : "Mon profil public"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEn
              ? "This information is visible to patients in the FUENI directory."
              : "Ces informations sont visibles par les patients dans l'annuaire FUENI."}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          <Eye className="h-4 w-4" /> {isEn ? "Patient preview" : "Aperçu patient"}
        </button>
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
        <div>
          <div className="font-semibold">{isEn ? "Profile visible in directory" : "Profil visible dans l'annuaire"}</div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEn
              ? "Turn off to temporarily remove your card from patient search results."
              : "Désactivez pour retirer temporairement votre fiche des résultats de recherche des patients."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "relative h-7 w-12 flex-none rounded-full transition",
            visible ? "bg-emerald-500" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
              visible ? "left-6" : "left-1",
            )}
          />
        </button>
      </div>

      {/* Identity */}
      <Card title={isEn ? "Displayed identity" : "Identité affichée"} icon={<BadgeCheck className="h-4 w-4" />} isEn={isEn}>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 flex-none place-items-center rounded-full bg-[image:var(--gradient-brand)] text-lg font-bold text-primary-foreground">
            AD
          </div>
          <div>
            <div className="text-lg font-bold">Dr Aboubacar Diallo</div>
            <div className="text-sm font-semibold text-primary">{isEn ? "Cardiology" : "Cardiologie"}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isEn
            ? "Name and specialty come from your verified (KYC) file and cannot be edited here."
            : "Nom et spécialité proviennent de votre dossier vérifié (KYC) et ne sont pas modifiables ici."}
        </p>
      </Card>

      {/* Presentation */}
      <Card title={isEn ? "Presentation" : "Présentation"} icon={<Stethoscope className="h-4 w-4" />} isEn={isEn}>
        <p className="text-sm text-muted-foreground">
          {isEn
            ? "Board-certified physician, I support my patients in routine health monitoring, prevention and chronic conditions. Consultations by appointment, in French, English and Wolof."
            : "Médecin généraliste diplômé, j'accompagne mes patients dans le suivi de santé courant, la prévention et les pathologies chroniques. Consultations sur rendez-vous, en français, anglais et wolof."}
        </p>
      </Card>

      {/* Expertise */}
      <Card title={isEn ? "Areas of expertise" : "Domaines d'expertise"} icon={<Award className="h-4 w-4" />} isEn={isEn}>
        <div className="flex flex-wrap gap-2">
          {expertise.map((e, i) => (
            <Chip key={e} highlighted={i === 0}>{e}</Chip>
          ))}
        </div>
        <div className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {isEn ? "Sub-specialties" : "Sous-spécialités"}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {subSpecialties.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </Card>

      {/* Languages */}
      <Card title={isEn ? "Languages spoken" : "Langues parlées"} icon={<Languages className="h-4 w-4" />} isEn={isEn}>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
      </Card>

      {/* Location */}
      <Card title={isEn ? "Location" : "Localisation"} icon={<MapPin className="h-4 w-4" />} isEn={isEn}>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" /> 12, rue Carnot, Dakar, {isEn ? "Senegal" : "Sénégal"}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>
            <Accessibility className="mr-1 inline h-3.5 w-3.5" />
            {isEn ? "Wheelchair access" : "Accès fauteuil roulant"}
          </Chip>
          <Chip>
            <ParkingSquare className="mr-1 inline h-3.5 w-3.5" />
            {isEn ? "Parking nearby" : "Parking à proximité"}
          </Chip>
        </div>
      </Card>

      {/* Hours */}
      <Card title={isEn ? "Consultation hours" : "Horaires de consultation"} icon={<Clock className="h-4 w-4" />} isEn={isEn}>
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
      </Card>

      {/* Reasons & pricing */}
      <Card title={isEn ? "Consultation reasons & pricing" : "Motifs de consultation & tarifs"} icon={<Wallet className="h-4 w-4" />} isEn={isEn}>
        <ul className="space-y-2">
          {REASONS.map((r) => (
            <li key={r.fr} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{isEn ? r.en : r.fr}</div>
                <div className="text-xs text-muted-foreground">{r.duration}</div>
              </div>
              <span className="text-sm font-bold text-primary">{r.price}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Education */}
      <Card title={isEn ? "Training & experience" : "Formation & expériences"} icon={<GraduationCap className="h-4 w-4" />} isEn={isEn}>
        <ul className="space-y-3">
          {EDUCATION.map((e) => (
            <li key={e.year} className="flex gap-4">
              <span className="w-12 flex-none text-sm font-bold text-primary">{e.year}</span>
              <span className="text-sm text-muted-foreground">{isEn ? e.en : e.fr}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {isEn
            ? "Degrees, positions and experience. This information is declarative (not verified by FUENI)."
            : "Diplômes, postes et expériences. Ces informations sont déclaratives (non vérifiées par FUENI)."}
        </p>
      </Card>

      {/* Legal info */}
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold">{isEn ? "Legal information" : "Informations légales"}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <BadgeCheck className="h-3 w-3" /> {isEn ? "Verified" : "Vérifié"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label={isEn ? "Medical board number" : "N° d'ordre médical"} value="SN-CARD-2015-0847" />
          <InfoRow label={isEn ? "Registration board" : "Ordre d'inscription"} value={isEn ? "Medical Board of Senegal" : "Ordre des Médecins du Sénégal"} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isEn
            ? "This information comes from your verified (KYC) file and is shown publicly to attest your registration. Your national ID number stays private and is never published."
            : "Ces informations proviennent de votre dossier vérifié (KYC) et sont affichées publiquement pour attester votre inscription. Votre numéro d'identifiant national reste privé et n'est jamais publié."}
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  isEn,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isEn: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5" /> {isEn ? "Edit" : "Modifier"}
        </button>
      </div>
      {children}
    </div>
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
