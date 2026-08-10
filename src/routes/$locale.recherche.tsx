// TODO Sprint 4 — Wire to real practitioner directory API.
// Aligned with SF "Recherche & annuaire des médecins" (FUENI MVP v1.1):
// no ratings/reviews, no teleconsultation facet, live filtering, single next slot.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, ShieldCheck, Clock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { searchDoctors, nextAvailability, DOCTORS } from "@/lib/doctors";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/recherche")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    city: typeof search.city === "string" ? search.city : "",
    type: typeof search.type === "string" ? search.type : "",
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
  const { q, city, type } = Route.useSearch();
  const navigate = useNavigate();

  const [queryInput, setQueryInput] = useState(q);
  const [cityInput, setCityInput] = useState(city);

  // Live filtering: URL follows the inputs (debounced) so results update as you type.
  useEffect(() => {
    if (queryInput === q && cityInput === city) return;
    const id = setTimeout(() => {
      void navigate({
        to: "/$locale/recherche",
        params: { locale },
        search: { q: queryInput, city: cityInput, type },
        replace: true,
      });
    }, 250);
    return () => clearTimeout(id);
  }, [queryInput, cityInput, q, city, type, locale, navigate]);

  const specialties = useMemo(() => {
    const seen = new Map<string, { fr: string; en: string }>();
    DOCTORS.forEach((d) => seen.set(d.specialty.fr, d.specialty));
    return [...seen.values()];
  }, []);

  const results = useMemo(() => {
    const base = searchDoctors(q, city);
    return type ? base.filter((d) => d.specialty.fr === type) : base;
  }, [q, city, type]);

  const setType = (value: string) =>
    void navigate({
      to: "/$locale/recherche",
      params: { locale },
      search: { q, city, type: value },
      replace: true,
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {en ? "Find a doctor" : "Trouver un médecin"}
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
                search: { q: queryInput, city: cityInput, type },
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setType("")}
            aria-pressed={!type}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !type
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {en ? "All specialties" : "Toutes les spécialités"}
          </button>
          {specialties.map((s) => (
            <button
              key={s.fr}
              type="button"
              onClick={() => setType(type === s.fr ? "" : s.fr)}
              aria-pressed={type === s.fr}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                type === s.fr
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {en ? s.en : s.fr}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          {en ? "doctor(s) found" : "médecin(s) trouvé(s)"}
          {q || city ? (
            <>
              {" · "}
              {[q, city].filter(Boolean).join(" · ")}
            </>
          ) : null}
        </p>

        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-lg font-semibold">
              {en ? "No doctor matches your search" : "Aucun médecin ne correspond à votre recherche"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {en
                ? "Try another specialty or widen the location."
                : "Essayez une autre spécialité ou élargissez la localisation."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 lg:grid-cols-2">
            {results.map((d) => {
              const next = nextAvailability(d);
              return (
                <li key={d.id}>
                  <div className="flex h-full gap-5 rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-[var(--shadow-card)]">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-brand)] text-lg font-bold text-primary-foreground">
                      {d.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">
                          <Link
                            to="/$locale/medecin/$doctorId"
                            params={{ locale, doctorId: d.id }}
                            search={{ q, city, type }}
                            className="hover:text-brand-deep"
                          >
                            {d.name}
                          </Link>
                        </h2>
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

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {d.languages.map((l) => (
                          <span
                            key={l}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            <Languages className="h-3 w-3" />
                            {l}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {next && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {en ? "Next slot" : "Prochaine dispo"} :{" "}
                            <span className="font-semibold text-foreground">
                              {(en ? next.day.en : next.day.fr) + " " + next.time}
                            </span>
                          </span>
                        )}
                        <span>
                          {en ? "from" : "à partir de"}{" "}
                          <span className="font-semibold text-foreground">{d.fee}</span>
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          asChild
                          className="h-10 rounded-xl bg-[image:var(--gradient-brand)] px-4 text-sm font-semibold text-primary-foreground hover:opacity-95"
                        >
                          <Link
                            to="/$locale/medecin/$doctorId"
                            params={{ locale, doctorId: d.id }}
                            search={{ q, city, type }}
                          >
                            {en ? "Book an appointment" : "Prendre rendez-vous"}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="h-10 rounded-xl px-4 text-sm font-semibold"
                        >
                          <Link
                            to="/$locale/medecin/$doctorId"
                            params={{ locale, doctorId: d.id }}
                            search={{ q, city, type }}
                          >
                            {en ? "View profile" : "Voir le profil"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
