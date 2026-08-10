// TODO Sprint 4 — Wire booking action to the real appointment API.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import {
  MapPin,
  ShieldCheck,
  Video,
  ArrowLeft,
  Languages,
  BriefcaseMedical,
  Check,
  Clock,
  Accessibility,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { BookingDialog } from "@/components/site/BookingDialog";

import { getDoctor, type Doctor } from "@/lib/doctors";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/medecin/$doctorId")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    city: typeof search.city === "string" ? search.city : "",
    type: typeof search.type === "string" ? search.type : "",
  }),
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
          { title: en ? "Doctor unavailable — FUENI" : "Médecin indisponible — FUENI" },
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
  const { doctor } = Route.useLoaderData() as { doctor: Doctor };
  const search = Route.useSearch();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialSlot, setInitialSlot] = useState<{ day: string; time: string } | null>(null);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/$locale/recherche"
          params={{ locale }}
          search={search}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {en ? "Back to results" : "Retour aux résultats"}
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

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">{en ? "Areas of expertise" : "Domaines d'expertise"}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.expertise.map((e) => (
                <span
                  key={e.fr}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-brand-deep"
                >
                  {en ? e.en : e.fr}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-bold">{en ? "Languages spoken" : "Langues parlées"}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.languages.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium"
                >
                  <Languages className="h-3.5 w-3.5 text-brand-deep" />
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">{en ? "Location" : "Localisation"}</h2>
            <div className="mt-4 space-y-3">
              {doctor.practices.map((p) => (
                <div key={p.name} className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{en ? p.kind.en : p.kind.fr}</p>
                  <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {p.address}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid h-44 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
              {en ? "Practice map" : "Carte du cabinet"}
            </div>

            <h3 className="mt-6 text-sm font-semibold">{en ? "Accessibility" : "Accessibilité"}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {doctor.accessibility.map((a) => (
                <li
                  key={a.fr}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm"
                >
                  <Accessibility className="h-4 w-4 text-brand-deep" />
                  {en ? a.en : a.fr}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold">{en ? "Practice photos" : "Photos du cabinet"}</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="grid aspect-4/3 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground"
                >
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">
              {en ? "Consultation hours" : "Horaires de consultation"}
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {doctor.hours.map((h) => (
                <li key={h.day.fr} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="font-medium">{en ? h.day.en : h.day.fr}</span>
                  <span className={h.ranges.length ? "text-muted-foreground" : "text-muted-foreground/70"}>
                    {h.ranges.length ? h.ranges.join(", ") : en ? "Closed" : "Fermé"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              {en ? "Local time at the practice" : "Heure locale du lieu"} · {doctor.timezone}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">{en ? "Consultation fees" : "Tarifs des consultations"}</h2>
            <ul className="mt-4 divide-y divide-border">
              {doctor.prices.map((p) => (
                <li key={p.label.fr} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{en ? p.label.en : p.label.fr}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.duration} min
                    </p>
                  </div>
                  <p className="text-sm font-bold">{p.amount}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">
              {en ? "Training & experience" : "Formation & expériences"}
            </h2>
            <ol className="mt-5 space-y-5 border-l border-border pl-6">
              {doctor.education.map((m) => (
                <li key={`${m.year}-${m.label.fr}`} className="relative">
                  <span className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.year}
                  </p>
                  <p className="text-sm">{en ? m.label.en : m.label.fr}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 mb-4 rounded-3xl border border-border bg-card p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                {en ? "Legal information" : "Informations légales"}
              </h2>
              {doctor.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-brand-deep">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {en ? "FUENI verified" : "Vérifié FUENI"}
                </span>
              )}
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {en ? "Medical license number" : "N° d'ordre médical"}
                </dt>
                <dd className="text-sm font-semibold">{doctor.legal.licenseNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {en ? "Registration board" : "Ordre d'inscription"}
                </dt>
                <dd className="text-sm font-semibold">
                  {en ? doctor.legal.board.en : doctor.legal.board.fr}
                </dd>
              </div>
            </dl>
          </div>
        </div>


        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-float)]">
            <p className="text-sm text-muted-foreground">
              {en ? "Consultation from" : "Consultation à partir de"}
            </p>
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
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setInitialSlot({ day: en ? slot.day.en : slot.day.fr, time });
                          setBookingOpen(true);
                        }}
                        className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10 hover:text-brand-deep"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => {
                setInitialSlot(null);
                setBookingOpen(true);
              }}
              className="mt-6 h-12 w-full rounded-xl bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground hover:opacity-95"
            >
              {en ? "Book an appointment" : "Prendre rendez-vous"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {en
                ? "Free cancellation up to 24h before the appointment."
                : "Annulation gratuite jusqu'à 24h avant le rendez-vous."}
            </p>

          </div>
        </aside>
      </section>

      <BookingDialog
        doctor={doctor}
        en={en}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        initialSlot={initialSlot}
      />

      <SiteFooter />

    </div>
  );
}
