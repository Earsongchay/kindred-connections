import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  CalendarDays, FolderOpen, Wallet, MessageSquare, FileText, BarChart3,
  Bell, Smartphone, Globe, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/fonctionnalites")({
  head: () => ({
    meta: [
      { title: "Fonctionnalités — FUENI" },
      { name: "description", content: "Découvrez toutes les fonctionnalités FUENI : RDV intelligent, dossier médical structuré, paiement Mobile Money, messagerie, ordonnances signées." },
      { property: "og:title", content: "Fonctionnalités — FUENI" },
      { property: "og:description", content: "Toutes les fonctionnalités d'une plateforme santé moderne." },
      { property: "og:url", content: "/fonctionnalites" },
    ],
    links: [{ rel: "canonical", href: "/fonctionnalites" }],
  }),
  component: FeaturesPage,
});

const FEATURES = [
  { icon: CalendarDays, title: "Prise de RDV intelligente", desc: "Recherche par spécialité, ville et disponibilité. Réservation en quelques secondes. Rappels SMS et email automatiques 48 h et 1 h 30 avant le rendez-vous." },
  { icon: FolderOpen, title: "Dossier médical structuré", desc: "Format POMR/SOAP standard international. Antécédents, traitements, diagnostics SNOMED-CT. Accessible hors-ligne en cas de besoin." },
  { icon: Wallet, title: "Paiement Mobile Money", desc: "Flutterwave, Wave, Orange Money, MTN Money. Wallet praticien avec payout automatique sous quelques jours, dans la devise locale." },
  { icon: MessageSquare, title: "Messagerie sécurisée", desc: "Échangez avec votre praticien ou vos patients en messagerie chiffrée bout en bout. Partage de documents, photos, ordonnances." },
  { icon: FileText, title: "Ordonnances électroniques", desc: "Ordonnances signées électroniquement (PKI), envoyées directement à la pharmacie du patient. Plus aucun risque de perte ou de falsification." },
  { icon: BarChart3, title: "Tableau de bord analytics", desc: "Suivez votre activité : nombre de consultations, taux d'occupation, revenus, satisfaction patient. Décisions data-driven." },
  { icon: Bell, title: "Notifications intelligentes", desc: "SMS, push, email. Le bon canal au bon moment. Réduisez le no-show jusqu'à 40 %." },
  { icon: Smartphone, title: "Mobile-first", desc: "Application web optimisée pour smartphone. Fonctionne sur connexions lentes et appareils d'entrée de gamme." },
  { icon: Globe, title: "Multi-pays · multi-devises", desc: "14 pays francophones supportés. Conformité locale, devise locale, langue locale. Une seule plateforme." },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[oklch(0.97_0.03_220)] to-background py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <div className="section-tag justify-center">Fonctionnalités</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Tout ce qu'il faut, <span className="text-accent-cyan">rien de superflu.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Des fonctionnalités pensées pour la pratique quotidienne en cabinet, à l'hôpital et au domicile du patient.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-7 hover:shadow-card hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan-bg text-primary grid place-items-center mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Une plateforme. Tous vos soins.</h2>
          <p className="mt-4 text-muted-foreground">Créez votre compte en moins d'une minute, sans carte bancaire.</p>
          <Link to="/inscription" className="mt-7 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition">
            Démarrer gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
