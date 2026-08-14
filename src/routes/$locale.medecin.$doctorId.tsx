// TODO Sprint 4 — Wire booking action to the real appointment API.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
  const [activeId, setActiveId] = useState(doctor.practices[0]!.id);
  const active = doctor.practices.find((p) => p.id === activeId) ?? doctor.practices[0]!;



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

          <div id="lieux" className="mt-6 rounded-3xl border border-border bg-card p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {en ? "Consultation locations" : "Lieux de consultation"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {en
                    ? `Hours, fees and access differ by location. Pick one to see its details (${doctor.practices.length} available).`
                    : `Horaires, tarifs et accès varient selon le lieu. Choisissez-en un pour voir ses détails (${doctor.practices.length} disponibles).`}
                </p>
              </div>
            </div>

            {/* Location selector */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="tablist">
              {doctor.practices.map((p) => {
                const isActive = p.id === active.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(p.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{en ? p.kind.en : p.kind.fr}</p>
                      </div>
                      {isActive && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          {en ? "Selected" : "Sélectionné"}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {p.city}, {p.country}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-semibold text-brand-deep">
                        {en ? "From" : "À partir de"} {p.fee}
                      </span>
                      {p.teleconsultation && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Video className="h-3.5 w-3.5" />
                          {en ? "Teleconsultation" : "Téléconsultation"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected location details */}
            <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-base font-bold">{active.name}</p>
              <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {active.address}
              </p>

              <div className="mt-5 grid h-44 place-items-center rounded-2xl border border-dashed border-border bg-card text-sm text-muted-foreground">
                {en ? `Map — ${active.name}` : `Carte — ${active.name}`}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-brand-deep" />
                    {en ? "Hours at this location" : "Horaires de ce lieu"}
                  </h3>
                  <ul className="mt-3 divide-y divide-border">
                    {active.hours.map((h) => (
                      <li
                        key={h.day.fr}
                        className="flex items-center justify-between gap-4 py-2 text-sm"
                      >
                        <span className="font-medium">{en ? h.day.en : h.day.fr}</span>
                        <span
                          className={
                            h.ranges.length ? "text-muted-foreground" : "text-muted-foreground/70"
                          }
                        >
                          {h.ranges.length ? h.ranges.join(", ") : en ? "Closed" : "Fermé"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {en ? "Local time" : "Heure locale"} · {active.timezone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    {en ? "Fees at this location" : "Tarifs de ce lieu"}
                  </h3>
                  <ul className="mt-3 divide-y divide-border">
                    {active.prices.map((p) => (
                      <li key={p.label.fr} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold">{en ? p.label.en : p.label.fr}</p>
                          <p className="text-xs text-muted-foreground">{p.duration} min</p>
                        </div>
                        <p className="text-sm font-bold">{p.amount}</p>
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-6 text-sm font-semibold">
                    {en ? "Accessibility" : "Accessibilité"}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {active.accessibility.map((a) => (
                      <li
                        key={a.fr}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm"
                      >
                        <Accessibility className="h-4 w-4 text-brand-deep" />
                        {en ? a.en : a.fr}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <h3 className="mt-6 text-sm font-semibold">
                {en ? "Photos of this location" : "Photos de ce lieu"}
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {active.photos.map((photo) => (
                  <figure
                    key={photo.fr}
                    className="overflow-hidden rounded-2xl border border-dashed border-border bg-card"
                  >
                    <div className="grid aspect-4/3 place-items-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                      {en ? photo.en : photo.fr}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
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
