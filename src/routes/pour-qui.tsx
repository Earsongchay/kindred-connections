import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { User, UserRound, Hospital, Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pour-qui")({
  head: () => ({
    meta: [
      { title: "Pour qui ? — FUENI" },
      { name: "description", content: "FUENI s'adresse aux patients, praticiens, cabinets et hôpitaux. Découvrez l'espace adapté à votre rôle." },
      { property: "og:title", content: "Pour qui ? — FUENI" },
      { property: "og:description", content: "Patient, praticien, structure de santé : FUENI s'adapte à votre rôle." },
      { property: "og:url", content: "/pour-qui" },
    ],
    links: [{ rel: "canonical", href: "/pour-qui" }],
  }),
  component: AudiencesPage,
});

function AudiencesPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[oklch(0.97_0.03_220)] to-background py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <div className="section-tag justify-center">Pour qui ?</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            FUENI s'adapte à <span className="text-accent-cyan">votre rôle.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chaque utilisateur a son espace dédié et ses outils. Choisissez le vôtre.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-3 gap-6">
          <Card icon={<User className="w-7 h-7" />} title="Patient" desc="Pour particuliers — gérez votre santé et celle de vos proches."
            features={["Trouvez et réservez avec un médecin", "Conservez vos documents médicaux", "Échangez avec votre praticien", "Paiement Mobile Money simple"]}
            cta="Créer mon compte patient" role="patient"
          />
          <Card featured badge="Le plus populaire" icon={<UserRound className="w-7 h-7" />} title="Praticien"
            desc="Médecin, pharmacien, infirmier — gérez votre activité de A à Z."
            features={["Planning + RDV intelligent", "Dossiers patients structurés (POMR/SOAP)", "Ordonnances électroniques signées", "Tableau de bord analytics", "Wallet · payouts automatiques"]}
            cta="Découvrir les plans praticien" role="praticien"
          />
          <Card comingSoon badge="Phase 2" icon={<Hospital className="w-7 h-7" />} title="Cabinet & Hôpital"
            desc="Pour structures de santé — coordonnez votre équipe et vos services."
            features={["Gestion multi-praticiens", "Tableau de bord institutionnel", "Coordination des soins", "Statistiques avancées", "Intégration assurances"]}
            cta="Disponible en 2026 →"
          />
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({
  featured, comingSoon, badge, icon, title, desc, features, cta, role,
}: {
  featured?: boolean; comingSoon?: boolean; badge?: string;
  icon: React.ReactNode; title: string; desc: string;
  features: string[]; cta: string; role?: string;
}) {
  const isFeatured = !!featured;
  return (
    <div className={[
      "relative rounded-3xl p-9 border transition-all",
      isFeatured ? "bg-gradient-to-br from-primary to-[oklch(0.48_0.10_210)] text-primary-foreground border-transparent shadow-card lg:scale-[1.03]" : "bg-card border-border",
    ].join(" ")}>
      {badge && (
        <span className={`absolute top-5 right-5 text-[0.65rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${comingSoon ? "bg-surface-muted text-muted-foreground" : "bg-warm text-[oklch(0.25_0.06_60)]"}`}>{badge}</span>
      )}
      <div className={`w-16 h-16 rounded-2xl grid place-items-center mb-5 ${isFeatured ? "bg-white/15 text-white" : "bg-primary-lighter text-primary"}`}>{icon}</div>
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
        {role ? (
          <Link to="/inscription" search={{ role }} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition ${isFeatured ? "bg-white text-primary hover:bg-white/90" : "bg-foreground text-background hover:opacity-90"}`}>
            {cta} <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium">{cta}</span>
        )}
      </div>
    </div>
  );
}
