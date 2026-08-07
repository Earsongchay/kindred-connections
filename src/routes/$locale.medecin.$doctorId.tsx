// TODO Sprint 4 — Wire booking action to the real appointment API.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Star,
  ShieldCheck,
  Video,
  ArrowLeft,
  Languages,
  BriefcaseMedical,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { getDoctor } from "@/lib/doctors";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/medecin/$doctorId")({
  loader: ({ params }) => {
    const doctor = getDoctor(params.doctorId);
    if (!doctor) throw notFound();
    return { doctor };
  },
  head: ({ params, loaderData }) => {
    const en = params.locale === "en";
    if (!loaderData) {
      return {
        meta: [
          { title: en ? "Practitioner unavailable — FUENI" : "Praticien indisponible — FUENI" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { doctor } = loaderData;
    const specialty = en ? doctor.specialty.en : doctor.specialty.fr;
    const title = `${doctor.name} — ${specialty}, ${doctor.city} | FUENI`;
    const description = en ? doctor.bio.en : doctor.bio.fr;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: DoctorDetailPage,
});

function DoctorDetailPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const en = locale === "en";
  const { doctor } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/$locale/recherche"
          params={{ locale }}
          search={{ q: "", city: "" }}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {en ? "Back to search" : "Retour à la recherche"}
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-6 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[image:var(--gradient-brand)] text-2xl font-bold text-primary-foreground">
              {doctor.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{doctor.name}</h1>
                {doctor.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-brand-deep">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {en ? "Verified profile" : "Profil vérifié"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-base font-semibold text-brand-deep">
                {en ? doctor.specialty.en : doctor.specialty.fr}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {doctor.address}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{doctor.rating.toFixed(1)}</span> (
                  {doctor.reviews} {en ? "reviews" : "avis"})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseMedical className="h-4 w-4" /> {doctor.experience}{" "}
                  {en ? "years of practice" : "ans d'exercice"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="h-4 w-4" /> {doctor.languages.join(", ")}
                </span>
                {doctor.teleconsultation && (
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4" />
                    {en ? "Teleconsultation available" : "Téléconsultation disponible"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">{en ? "About" : "À propos"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {en ? doctor.bio.en : doctor.bio.fr}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">
              {en ? "Consultations offered" : "Motifs de consultation"}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {doctor.services.map((s) => (
                <li key={s.fr} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{en ? s.en : s.fr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-float)]">
            <p className="text-sm text-muted-foreground">{en ? "Consultation fee" : "Tarif de consultation"}</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{doctor.fee}</p>

            <h2 className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-brand-deep" />
              {en ? "Next available slots" : "Prochaines disponibilités"}
            </h2>
            <div className="mt-4 space-y-4">
              {doctor.slots.map((slot) => (
                <div key={slot.day.fr}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {en ? slot.day.en : slot.day.fr}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {slot.times.map((time) => (
                      <span
                        key={time}
                        className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="mt-6 h-12 w-full rounded-xl bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground hover:opacity-95"
            >
              <Link to="/$locale/inscription" params={{ locale }}>
                {en ? "Book an appointment" : "Prendre rendez-vous"}
              </Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {en
                ? "Create your patient account to confirm the booking."
                : "Créez votre compte patient pour confirmer le rendez-vous."}
            </p>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}
