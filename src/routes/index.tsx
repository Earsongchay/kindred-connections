import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Search, MapPin, UserPlus, ShieldCheck, Stethoscope,
  Check, ArrowRight, User, UserRound, Hospital,
  CalendarDays, FolderOpen, Wallet, CalendarCheck,
  Lock, FileSignature, Scale,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUENI — Plateforme santé numérique pour l'Afrique francophone" },
      { name: "description", content: "FUENI rassemble patients, praticiens, pharmacies et hôpitaux dans une seule plateforme moderne et sécurisée. Prise de RDV, dossier médical, paiement Mobile Money." },
      { property: "og:title", content: "FUENI — Une plateforme. Tous vos soins." },
      { property: "og:description", content: "La plateforme santé numérique pour l'Afrique francophone et l'Europe." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <HowItWorks />
      <Audiences />
      <Features />
      <Security />
      <Coverage />
      <Testimonials />
      <FinalCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.97_0.03_220)] to-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="section-tag">Plateforme santé numérique · Afrique francophone</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Une plateforme.<br />
            <span className="text-accent-cyan">Tous vos soins.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            FUENI rassemble patients, praticiens, pharmacies et hôpitaux dans une seule plateforme
            moderne et sécurisée. Pensée pour l'Afrique francophone et l'Europe — accessible où que vous soyez.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 bg-card border border-border rounded-2xl p-2 flex flex-col md:flex-row md:items-center gap-2 shadow-soft"
          >
            <div className="flex items-center gap-2 flex-1 px-3 h-12 md:h-14">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nom, spécialité, établissement…"
                aria-label="Rechercher"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-border" />
            <div className="flex items-center gap-2 flex-1 px-3 h-12 md:h-14">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ville, pays…"
                aria-label="Localisation"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 h-12 md:h-12 px-6 rounded-xl bg-accent-cyan-bright text-primary-foreground font-semibold text-sm hover:bg-accent-cyan transition shadow-cta"
            >
              <Search className="w-4 h-4" /> Rechercher
            </button>
          </form>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            <Stat n="14" label="Pays francophones" />
            <Stat n="5" label="Devises supportées" />
            <Stat n="100%" label="Conforme RGPD" />
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[28px] bg-gradient-to-br from-primary-lighter to-accent-cyan-bg shadow-card overflow-hidden grid place-items-center">
            <div className="absolute -top-24 -right-24 w-3/4 h-3/4 rounded-full bg-warm/20 blur-3xl" />
            <Stethoscope className="w-40 h-40 text-primary/70 relative" strokeWidth={1.2} />
          </div>
          <FloatingCard className="top-[12%] -left-4 sm:-left-8" icon={<CalendarCheck className="w-5 h-5" />} iconBg="bg-warm-light text-[oklch(0.55_0.16_60)]" label="Prochain RDV" value="Aujourd'hui · 14:30" />
          <FloatingCard className="bottom-[18%] -right-4 sm:-right-8" pct="98%" label="Taux de satisfaction" value="Patients FUENI" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-foreground">{n}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function FloatingCard({
  className = "", icon, iconBg = "", pct, label, value,
}: {
  className?: string; icon?: React.ReactNode; iconBg?: string;
  pct?: string; label: string; value: string;
}) {
  return (
    <div className={`absolute bg-card border border-border rounded-2xl px-4 py-3 shadow-soft flex items-center gap-3 ${className}`}>
      {pct ? (
        <div className="w-10 h-10 rounded-full bg-primary-lighter text-primary grid place-items-center text-xs font-bold">{pct}</div>
      ) : (
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${iconBg}`}>{icon}</div>
      )}
      <div>
        <div className="text-[0.7rem] text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <UserPlus className="w-6 h-6" />, step: "Étape 1", title: "Créez votre compte", desc: "Inscription en quelques clics. Aucune carte bancaire requise. Patient ou praticien : choisissez votre profil et commencez immédiatement." },
    { icon: <ShieldCheck className="w-6 h-6" />, step: "Étape 2", title: "Vérifiez votre identité", desc: "Vérification par SMS pour les patients · validation manuelle Super Admin pour les praticiens (RPPS, Ordre des Médecins, justificatifs)." },
    { icon: <Stethoscope className="w-6 h-6" />, step: "Étape 3", title: "Profitez de FUENI", desc: "Prenez vos RDV, consultez vos dossiers, communiquez avec votre médecin, gérez vos paiements en Mobile Money. Tout, depuis une seule plateforme." },
  ];
  return (
    <section id="a-propos" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center">Comment ça marche</div>
        <h2 className="section-title mx-auto max-w-3xl">Une solution simple,<br /><span className="accent">en trois étapes.</span></h2>
        <p className="section-subtitle mx-auto">Que vous soyez patient ou professionnel de santé, l'accès à FUENI est immédiat. Création de compte en moins d'une minute, vérification rapide, et c'est parti.</p>
        <div className="mt-14 grid md:grid-cols-3 gap-6 text-left">
          {steps.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-8 hover:shadow-card hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-primary-lighter text-primary grid place-items-center mb-5">{s.icon}</div>
              <div className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">{s.step}</div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section id="audiences" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center">Pour qui ?</div>
        <h2 className="section-title">FUENI s'adapte à <span className="accent">votre rôle.</span></h2>
        <p className="section-subtitle mx-auto">Chaque utilisateur a son espace dédié et ses outils. Choisissez le vôtre.</p>

        <div className="mt-14 grid lg:grid-cols-3 gap-6 text-left">
          <AudienceCard
            icon={<User className="w-7 h-7" />}
            title="Patient"
            desc="Pour particuliers — gérez votre santé et celle de vos proches."
            features={["Trouvez et réservez avec un médecin", "Conservez vos documents médicaux", "Échangez avec votre praticien", "Paiement Mobile Money simple"]}
            cta="Créer mon compte patient"
            to="/inscription"
            role="patient"
          />
          <AudienceCard
            featured
            badge="Le plus populaire"
            icon={<UserRound className="w-7 h-7" />}
            title="Praticien"
            desc="Médecin, pharmacien, infirmier — gérez votre activité de A à Z."
            features={["Planning + RDV intelligent", "Dossiers patients structurés (POMR/SOAP)", "Ordonnances électroniques signées", "Tableau de bord analytics", "Wallet · payouts automatiques"]}
            cta="Découvrir les plans praticien"
            to="/inscription"
            role="praticien"
          />
          <AudienceCard
            comingSoon
            badge="Phase 2"
            icon={<Hospital className="w-7 h-7" />}
            title="Cabinet & Hôpital"
            desc="Pour structures de santé — coordonnez votre équipe et vos services."
            features={["Gestion multi-praticiens", "Tableau de bord institutionnel", "Coordination des soins", "Statistiques avancées", "Intégration assurances"]}
            cta="Disponible en 2026 →"
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  featured, comingSoon, badge, icon, title, desc, features, cta, to, role,
}: {
  featured?: boolean; comingSoon?: boolean; badge?: string;
  icon: React.ReactNode; title: string; desc: string;
  features: string[]; cta: string; to?: string; role?: string;
}) {
  const isFeatured = !!featured;
  return (
    <div
      className={[
        "relative rounded-3xl p-9 border transition-all",
        isFeatured
          ? "bg-gradient-to-br from-primary to-[oklch(0.48_0.10_210)] text-primary-foreground border-transparent shadow-card scale-[1.02]"
          : "bg-card border-border",
        comingSoon ? "opacity-90" : "",
      ].join(" ")}
    >
      {badge && (
        <span
          className={[
            "absolute top-5 right-5 text-[0.65rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
            comingSoon ? "bg-surface-muted text-muted-foreground" : "bg-warm text-[oklch(0.25_0.06_60)]",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
      <div className={`w-16 h-16 rounded-2xl grid place-items-center mb-5 ${isFeatured ? "bg-white/15 text-white" : "bg-primary-lighter text-primary"}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className={`mt-2 text-sm ${isFeatured ? "text-white/85" : "text-muted-foreground"}`}>{desc}</p>
      <ul className="mt-5 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0 ${isFeatured ? "bg-white/20 text-white" : "bg-primary-lighter text-primary"}`}>
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">
        {to ? (
          <Link
            to={to}
            search={role ? { role } : undefined}
            className={[
              "inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition",
              isFeatured
                ? "bg-white text-primary hover:bg-white/90"
                : "bg-foreground text-background hover:opacity-90",
            ].join(" ")}
          >
            {cta} <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium">{cta}</span>
        )}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: <CalendarDays className="w-6 h-6" />, title: "Prise de RDV intelligente", desc: "Recherche par spécialité, ville et disponibilité. Réservation en quelques secondes. Notifications SMS + email automatiques 48 h et 1 h 30 avant." },
    { icon: <FolderOpen className="w-6 h-6" />, title: "Dossier médical structuré", desc: "Format POMR/SOAP standard international. Antécédents, traitements, diagnostics SNOMED-CT. Accessible hors-ligne en cas de besoin." },
    { icon: <Wallet className="w-6 h-6" />, title: "Paiement Mobile Money", desc: "Flutterwave + Wave + Orange Money + MTN Money. Wallet praticien avec payout automatique sous quelques jours." },
  ];
  return (
    <section id="fonctionnalites" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center">Fonctionnalités</div>
        <h2 className="section-title">Tout ce qu'il faut, <span className="accent">rien de superflu.</span></h2>
        <p className="section-subtitle mx-auto">Des fonctionnalités pensées pour la pratique quotidienne en cabinet, à l'hôpital et au domicile du patient.</p>
        <div className="mt-14 grid md:grid-cols-3 gap-6 text-left">
          {items.map((it) => (
            <div key={it.title} className="bg-card border border-border rounded-2xl p-8 hover:shadow-card hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan-bg text-primary grid place-items-center mb-5">{it.icon}</div>
              <h4 className="text-lg font-bold mb-2">{it.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/fonctionnalites" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent-cyan">
            Voir toutes les fonctionnalités <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { icon: <Lock className="w-5 h-5" />, title: "Chiffrement AES-256", desc: "Vos dossiers médicaux sont chiffrés AVANT stockage. Même nos équipes ne peuvent pas y accéder." },
    { icon: <FileSignature className="w-5 h-5" />, title: "Signatures électroniques PKI", desc: "Ordonnances et comptes-rendus signés cryptographiquement, immuables, légalement opposables." },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Authentification forte", desc: "Double authentification (SMS, application, clé physique) pour tous les professionnels." },
    { icon: <Scale className="w-5 h-5" />, title: "Conforme par pays", desc: "RGPD (Europe), CDP (Sénégal), ARTCI (CI), APDP (Mali, Bénin), HDS (option France)." },
  ];
  return (
    <section id="securite" className="bg-[oklch(0.20_0.04_240)] text-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center" style={{ color: "var(--color-accent-cyan-bright)" }}>Sécurité & conformité</div>
        <h2 className="section-title text-white">Vos données restent <span className="text-accent-cyan-bright">vos données.</span></h2>
        <p className="section-subtitle mx-auto text-white/70">
          FUENI est conçu avec les standards de sécurité les plus exigeants de l'industrie santé. Chiffrement de bout en bout, audit complet, et conformité dans chaque pays où vous exercez.
        </p>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {items.map((it) => (
            <div key={it.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <div className="w-11 h-11 rounded-xl bg-accent-cyan-bright/15 text-accent-cyan-bright grid place-items-center mb-4">{it.icon}</div>
              <h5 className="font-semibold mb-1.5">{it.title}</h5>
              <p className="text-sm text-white/65 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const COUNTRIES = [
  ["🇸🇳", "Sénégal"], ["🇨🇮", "Côte d'Ivoire"], ["🇨🇲", "Cameroun"],
  ["🇲🇱", "Mali"], ["🇨🇩", "RDC"], ["🇧🇯", "Bénin"], ["🇹🇬", "Togo"],
  ["🇧🇫", "Burkina Faso"], ["🇳🇪", "Niger"], ["🇹🇩", "Tchad"],
  ["🇬🇦", "Gabon"], ["🇨🇬", "Congo"], ["🇲🇬", "Madagascar"],
  ["🇫🇷", "France (export)"],
] as const;

function Coverage() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center">Couverture</div>
        <h2 className="section-title">14 pays. <span className="accent">Une seule plateforme.</span></h2>
        <p className="section-subtitle mx-auto">
          FUENI est conçue pour fonctionner dans chaque pays francophone d'Afrique et en Europe.
          Affichage en devise locale, paiements adaptés, conformité locale.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {COUNTRIES.map(([flag, name]) => (
            <span key={name} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-medium hover:border-accent-cyan transition-colors">
              <span className="text-lg leading-none">{flag}</span>{name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { quote: "FUENI m'a permis de gagner 2 h par jour sur la gestion administrative. Mes patients adorent prendre RDV en ligne. Le dossier patient structuré est devenu indispensable au quotidien.", name: "Dr. Mamadou Sow", role: "Cardiologue · Dakar, Sénégal", initials: "MS", color: "bg-primary" },
    { quote: "En tant que pharmacienne en zone rurale, FUENI est une révolution. Les ordonnances signées électroniquement arrivent directement, plus de doute sur l'authenticité.", name: "Aminata Diallo", role: "Pharmacienne · Bamako, Mali", initials: "AD", color: "bg-warm" },
    { quote: "Prendre RDV avec mon médecin depuis mon téléphone, c'est devenu naturel. Et tous mes documents médicaux sont au même endroit, je ne perds plus rien.", name: "Fatou Konaté", role: "Patiente · Abidjan, Côte d'Ivoire", initials: "FK", color: "bg-[oklch(0.6_0.18_290)]" },
  ];
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="section-tag justify-center">Ils utilisent FUENI</div>
        <h2 className="section-title">Adoptés par des professionnels.<br /><span className="accent">Plébiscités par leurs patients.</span></h2>
        <p className="section-subtitle mx-auto">Témoignages illustratifs — la plateforme étant en cours de lancement, ces témoignages sont fictifs mais représentent les retours que nous visons.</p>
        <div className="mt-14 grid md:grid-cols-3 gap-6 text-left">
          {t.map((x) => (
            <article key={x.name} className="relative bg-card border border-border rounded-2xl p-7">
              <span className="absolute top-4 right-4 text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-surface-muted text-muted-foreground">Exemple illustratif</span>
              <p className="text-base leading-relaxed text-foreground/90">"{x.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full text-white font-bold grid place-items-center text-sm ${x.color}`}>{x.initials}</div>
                <div>
                  <div className="font-semibold text-sm">{x.name}</div>
                  <div className="text-xs text-muted-foreground">{x.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.42_0.10_215)] to-[oklch(0.48_0.13_210)] text-white">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.25),transparent_55%)]" />
      <div className="relative mx-auto max-w-4xl px-5 lg:px-8 py-20 lg:py-28 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Prêt(e) à transformer votre santé ?</h2>
        <p className="mt-5 text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">
          Rejoignez la plateforme qui rassemble patients, praticiens et établissements de santé francophones. Aucune carte bancaire requise pour démarrer.
        </p>
        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <Link to="/inscription" search={{ role: "patient" }} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition">
            <User className="w-4 h-4" /> Créer mon compte patient <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/inscription" search={{ role: "praticien" }} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur border border-white/25 text-white font-semibold text-sm hover:bg-white/15 transition">
            <UserRound className="w-4 h-4" /> Inscription professionnel de santé
          </Link>
        </div>
      </div>
    </section>
  );
}
