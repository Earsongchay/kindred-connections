// TODO Sprint 4 — Wire to real practitioner directory API.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Star, ShieldCheck, Video, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { searchDoctors } from "@/lib/doctors";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/recherche")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    city: typeof search.city === "string" ? search.city : "",
  }),
  head: ({ params }) => {
    const en = params.locale === "en";
    const title = en
      ? "Find a verified doctor — FUENI"
      : "Trouver un médecin vérifié — FUENI";
    const description = en
      ? "Search verified doctors by name, specialty or city across Francophone Africa and book an appointment in minutes."
      : "Recherchez des médecins vérifiés par nom, spécialité ou ville en Afrique francophone et prenez rendez-vous en quelques minutes.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const en = locale === "en";
  const { q, city } = Route.useSearch();
  const navigate = useNavigate();

  const [queryInput, setQueryInput] = useState(q);
  const [cityInput, setCityInput] = useState(city);
  const [teleOnly, setTeleOnly] = useState(false);

  let results = searchDoctors(q, city);
  if (teleOnly) results = results.filter((d) => d.teleconsultation);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {en ? "Find a practitioner" : "Trouver un praticien"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {en
              ? "Verified profiles, transparent fees, instant booking."
              : "Profils vérifiés, tarifs transparents, réservation instantanée."}
          </p>

          <form
            className="glass mt-6 rounded-2xl p-2 shadow-[var(--shadow-float)]"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({
                to: "/$locale/recherche",
                params: { locale },
                search: { q: queryInput, city: cityInput },
              });
            }}
          >
            <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={en ? "Name, specialty…" : "Nom, spécialité…"}
                  aria-label={en ? "Name or specialty" : "Nom ou spécialité"}
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60 md:border-l md:border-border">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={en ? "City or country" : "Ville ou pays"}
                  aria-label={en ? "City or country" : "Ville ou pays"}
                />
              </label>
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-xl bg-[image:var(--gradient-brand)] px-6 text-base font-semibold text-primary-foreground hover:opacity-95"
              >
                {en ? "Search" : "Rechercher"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {en ? "practitioner(s) found" : "praticien(s) trouvé(s)"}
            {q || city ? (
              <>
                {" · "}
                {[q, city].filter(Boolean).join(" · ")}
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => setTeleOnly((v) => !v)}
            aria-pressed={teleOnly}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              teleOnly
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {en ? "Teleconsultation only" : "Téléconsultation uniquement"}
          </button>
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-lg font-semibold">
              {en ? "No practitioner matches your search" : "Aucun praticien ne correspond à votre recherche"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {en
                ? "Try another specialty or widen the location."
                : "Essayez une autre spécialité ou élargissez la localisation."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 lg:grid-cols-2">
            {results.map((d) => (
              <li key={d.id}>
                <Link
                  to="/$locale/medecin/$doctorId"
                  params={{ locale, doctorId: d.id }}
                  className="group flex h-full gap-5 rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-card)]"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-brand)] text-lg font-bold text-primary-foreground">
                    {d.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{d.name}</h2>
                      {d.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                          <ShieldCheck className="h-3 w-3" />
                          {en ? "Verified" : "Vérifié"}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-brand-deep">
                      {en ? d.specialty.en : d.specialty.fr}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {d.city}, {d.country}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="font-semibold text-foreground">{d.rating.toFixed(1)}</span> (
                        {d.reviews})
                      </span>
                      <span>{d.fee}</span>
                      {d.teleconsultation && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          {en ? "Teleconsultation" : "Téléconsultation"}
                        </span>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-deep">
                      {en ? "View profile" : "Voir le profil"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
