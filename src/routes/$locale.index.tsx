// TODO Sprint 3-4 — Validate marketing wording with Nazounki team.
// TODO Sprint 4-5 — Replace prototype photo with brand-validated photography.
// TODO Sprint 4-5 — Replace illustrative testimonials with real, consented ones.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Pill,
  Building2,
  ArrowRight,
  Check,
  Lock,
  KeyRound,
  Smartphone,
  FileSignature,
  Star,
  Sparkles,
  Video,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import doctorHero from "@/assets/doctor-hero.jpg";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { fr } from "@/i18n/locales/fr";
import { en } from "@/i18n/locales/en";

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const dict = params.locale === "en" ? en : fr;
    return {
      meta: [
        { title: dict.home.meta.title },
        { name: "description", content: dict.home.meta.description },
        { property: "og:title", content: dict.home.meta.title },
        { property: "og:description", content: dict.home.meta.description },
      ],
      links: [
        { rel: "alternate", hrefLang: "fr", href: "/fr" },
        { rel: "alternate", hrefLang: "en", href: "/en" },
        { rel: "alternate", hrefLang: "x-default", href: "/fr" },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Audience />
      <Features />
      <Security />
      <Coverage />
      <Testimonials />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

function useLocale(): Locale {
  const params = Route.useParams();
  return isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
}

function Hero() {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <section className="relative overflow-hidden bg-[var(--gradient-hero)]">
      <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -left-32 top-40 h-[360px] w-[360px] rounded-full bg-accent/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-24">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            {t("home.hero.badge")}
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {t("home.hero.titleA")}
            <br />
            <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              {t("home.hero.titleB")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {t("home.hero.description")}
          </p>

          <form
            className="glass mt-8 rounded-2xl p-2 shadow-[var(--shadow-float)]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={t("home.hero.searchName")}
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60 md:border-l md:border-border">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={t("home.hero.searchCity")}
                />
              </label>
              <Button
                size="lg"
                className="h-12 rounded-xl bg-[image:var(--gradient-brand)] px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-card)] hover:opacity-95"
              >
                {t("home.hero.searchCta")}
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> {t("home.hero.perk1")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> {t("home.hero.perk2")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> {t("home.hero.perk3")}
            </span>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/40 to-brand-deep/20 shadow-[var(--shadow-float)]">
            <img
              src={doctorHero}
              alt={t("home.hero.doctorAlt")}
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="glass absolute -left-6 top-10 w-64 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.hero.floatRdvLabel")}</p>
                <p className="text-sm font-semibold">{t("home.hero.floatRdvValue")}</p>
              </div>
            </div>
          </div>
          <div className="glass absolute -right-4 bottom-10 w-60 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/30 text-sm font-bold text-brand-deep">
                98%
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.hero.floatSatLabel")}</p>
                <p className="text-sm font-semibold">{t("home.hero.floatSatValue")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* prevent unused-locale warning */}
      <span className="sr-only">{locale}</span>
    </section>
  );
}

function TrustBar() {
  const { t } = useTranslation();
  // TODO Sprint 3-4 — Replace marketing stats with audited real values.
  const stats = [
    { v: "14", l: t("home.trust.countries") },
    { v: "5", l: t("home.trust.currencies") },
    { v: "100%", l: t("home.trust.rgpd") },
    { v: t("home.trust.signupValue"), l: t("home.trust.signup") },
  ];
  return (
    <section className="border-y border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.l} className="text-center sm:text-left">
            <p className="text-3xl font-extrabold tracking-tight">{s.v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-deep">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    { n: "01", t: t("home.how.step1.t"), d: t("home.how.step1.d") },
    { n: "02", t: t("home.how.step2.t"), d: t("home.how.step2.d") },
    { n: "03", t: t("home.how.step3.t"), d: t("home.how.step3.d") },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <SectionLabel>{t("home.how.tag")}</SectionLabel>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.how.title")}
          <br />
          {t("home.how.titleBr")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("home.how.description")}</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-[var(--shadow-card)]"
          >
            <div className="text-5xl font-extrabold text-primary/40">{s.n}</div>
            <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            <ArrowRight className="absolute right-6 top-8 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand-deep" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Audience() {
  const { t } = useTranslation();
  const locale = useLocale();
  const cards = [
    {
      icon: Stethoscope,
      tag: null,
      title: t("home.audience.patient.title"),
      desc: t("home.audience.patient.desc"),
      items: [
        t("home.audience.patient.i1"),
        t("home.audience.patient.i2"),
        t("home.audience.patient.i3"),
        t("home.audience.patient.i4"),
      ],
      cta: t("home.audience.patient.cta"),
      link: "/$locale/inscription",
    },
    {
      icon: Pill,
      tag: t("home.audience.popular"),
      featured: true,
      title: t("home.audience.practitioner.title"),
      desc: t("home.audience.practitioner.desc"),
      items: [
        t("home.audience.practitioner.i1"),
        t("home.audience.practitioner.i2"),
        t("home.audience.practitioner.i3"),
        t("home.audience.practitioner.i4"),
      ],
      cta: t("home.audience.practitioner.cta"),
      link: "/$locale/signup",
    },
    {
      icon: Building2,
      tag: t("home.audience.phase2"),
      disabled: true,
      title: t("home.audience.hospital.title"),
      desc: t("home.audience.hospital.desc"),
      items: [
        t("home.audience.hospital.i1"),
        t("home.audience.hospital.i2"),
        t("home.audience.hospital.i3"),
        t("home.audience.hospital.i4"),
      ],
      cta: t("home.audience.hospital.cta"),
      link: "/$locale/signup",
    },
  ] as const;

  return (
    <section id="audience" className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <SectionLabel>{t("home.audience.tag")}</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("home.audience.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("home.audience.description")}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            const featured = "featured" in c && c.featured;
            const disabled = "disabled" in c && c.disabled;
            return (
              <div
                key={c.title}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
                  featured
                    ? "border-transparent bg-foreground text-background shadow-[var(--shadow-float)] lg:-translate-y-4"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {c.tag && (
                  <span
                    className={`absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold ${
                      featured
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.tag}
                  </span>
                )}
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${featured ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold">{c.title}</h3>
                <p
                  className={`mt-2 text-sm ${featured ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {c.desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-accent" : "text-primary"}`}
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild={!disabled}
                  disabled={disabled}
                  className={`mt-8 h-12 rounded-xl font-semibold ${
                    featured
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : disabled
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {disabled ? (
                    <span>{c.cta}</span>
                  ) : (
                    <Link to={c.link} params={{ locale }}>
                      {c.cta}
                    </Link>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useTranslation();
  const feats = [
    { icon: Calendar, t: t("home.features.f1.t"), d: t("home.features.f1.d") },
    { icon: FileText, t: t("home.features.f2.t"), d: t("home.features.f2.d") },
    { icon: CreditCard, t: t("home.features.f3.t"), d: t("home.features.f3.d") },
    { icon: Video, t: t("home.features.f4.t"), d: t("home.features.f4.d") },
    { icon: FileSignature, t: t("home.features.f5.t"), d: t("home.features.f5.d") },
    { icon: Smartphone, t: t("home.features.f6.t"), d: t("home.features.f6.d") },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <SectionLabel>{t("home.features.tag")}</SectionLabel>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.features.title")}
          <br />
          {t("home.features.titleBr")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("home.features.description")}</p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feats.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.t}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-card)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-brand-deep">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Security() {
  const { t } = useTranslation();
  const items = [
    { icon: Lock, t: t("home.security.i1.t"), d: t("home.security.i1.d") },
    { icon: FileSignature, t: t("home.security.i2.t"), d: t("home.security.i2.d") },
    { icon: KeyRound, t: t("home.security.i3.t"), d: t("home.security.i3.d") },
    { icon: ShieldCheck, t: t("home.security.i4.t"), d: t("home.security.i4.d") },
  ];
  return (
    <section id="security" className="bg-foreground py-24 text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("home.security.tag")}
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("home.security.title")}
          </h2>
          <p className="mt-4 text-lg text-background/70">{t("home.security.description")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.t}
                className="glass-dark rounded-2xl p-6 transition-colors hover:bg-background/10"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{it.t}</h3>
                <p className="mt-2 text-sm text-background/70">{it.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  const { t } = useTranslation();
  // Country labels intentionally not translated (proper nouns + flag emojis)
  const countries = [
    "🇸🇳 Sénégal",
    "🇨🇮 Côte d'Ivoire",
    "🇨🇲 Cameroun",
    "🇲🇱 Mali",
    "🇨🇩 RDC",
    "🇧🇯 Bénin",
    "🇹🇬 Togo",
    "🇧🇫 Burkina Faso",
    "🇳🇪 Niger",
    "🇹🇩 Tchad",
    "🇬🇦 Gabon",
    "🇨🇬 Congo",
    "🇲🇬 Madagascar",
    "🇫🇷 France",
  ];
  return (
    <section id="coverage" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <SectionLabel>{t("home.coverage.tag")}</SectionLabel>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.coverage.title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("home.coverage.description")}</p>
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        {countries.map((c) => (
          <span
            key={c}
            className="glass rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useTranslation();
  const list = [
    {
      q: t("home.testimonials.t1.q"),
      n: t("home.testimonials.t1.n"),
      r: t("home.testimonials.t1.r"),
      i: "MS",
    },
    {
      q: t("home.testimonials.t2.q"),
      n: t("home.testimonials.t2.n"),
      r: t("home.testimonials.t2.r"),
      i: "AD",
    },
    {
      q: t("home.testimonials.t3.q"),
      n: t("home.testimonials.t3.n"),
      r: t("home.testimonials.t3.r"),
      i: "FK",
    },
  ];
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <SectionLabel>{t("home.testimonials.tag")}</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("home.testimonials.title")}
            <br />
            {t("home.testimonials.titleBr")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("home.testimonials.disclaimer")}</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {list.map((tt) => (
            <figure
              key={tt.n}
              className="flex flex-col rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-base leading-relaxed text-foreground/90">
                « {tt.q} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-bold text-primary-foreground">
                  {tt.i}
                </div>
                <div>
                  <p className="text-sm font-semibold">{tt.n}</p>
                  <p className="text-xs text-muted-foreground">{tt.r}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-16 text-background sm:px-16 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("home.cta.title")}
          </h2>
          <p className="mt-4 text-lg text-background/70">{t("home.cta.description")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-[image:var(--gradient-brand)] px-7 text-base font-semibold text-primary-foreground hover:opacity-95"
            >
              <Link to="/$locale/signup" params={{ locale }}>
                {t("home.cta.primary")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-background/20 bg-transparent px-7 text-base font-semibold text-background hover:bg-background/10"
            >
              {t("home.cta.secondary")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
