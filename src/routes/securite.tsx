import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Lock, FileSignature, ShieldCheck, Scale, Database, Eye } from "lucide-react";

export const Route = createFileRoute("/securite")({
  head: () => ({
    meta: [
      { title: "Sécurité & conformité — FUENI" },
      { name: "description", content: "Chiffrement AES-256, signatures PKI, authentification forte, conformité RGPD, CDP, ARTCI, APDP, HDS. La sécurité au cœur de FUENI." },
      { property: "og:title", content: "Sécurité & conformité — FUENI" },
      { property: "og:description", content: "Vos données restent vos données. Standards de sécurité de l'industrie santé." },
      { property: "og:url", content: "/securite" },
    ],
    links: [{ rel: "canonical", href: "/securite" }],
  }),
  component: SecurityPage,
});

const ITEMS = [
  { icon: Lock, title: "Chiffrement AES-256", desc: "Vos dossiers médicaux sont chiffrés AVANT stockage. Même nos équipes ne peuvent pas y accéder sans votre consentement explicite." },
  { icon: FileSignature, title: "Signatures électroniques PKI", desc: "Ordonnances et comptes-rendus signés cryptographiquement, immuables, légalement opposables dans toute la zone OHADA et l'UE." },
  { icon: ShieldCheck, title: "Authentification forte (2FA)", desc: "Double authentification obligatoire pour tous les professionnels : SMS, application TOTP, ou clé physique FIDO2." },
  { icon: Scale, title: "Conforme par pays", desc: "RGPD (Europe), CDP (Sénégal), ARTCI (Côte d'Ivoire), APDP (Mali, Bénin), HDS en option pour la France." },
  { icon: Database, title: "Hébergement souverain", desc: "Données hébergées dans des datacenters certifiés, avec option de localisation par pays selon les exigences réglementaires." },
  { icon: Eye, title: "Audit & traçabilité", desc: "Chaque accès à un dossier patient est tracé, horodaté, et auditable. Vous savez qui a vu quoi, et quand." },
];

function SecurityPage() {
  return (
    <SiteLayout>
      <section className="bg-[oklch(0.20_0.04_240)] text-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-20 lg:py-28 text-center">
          <div className="section-tag justify-center" style={{ color: "var(--color-accent-cyan-bright)" }}>Sécurité & conformité</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Vos données restent <span className="text-accent-cyan-bright">vos données.</span>
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            FUENI est conçu avec les standards de sécurité les plus exigeants de l'industrie santé. Chiffrement de bout en bout, audit complet, et conformité dans chaque pays où vous exercez.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-7 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan-bg text-primary grid place-items-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 bg-surface border border-border rounded-3xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Une question sur notre conformité ?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Notre équipe DPO répond sous 48 h aux demandes de DPIA, contrats de sous-traitance et audits de sécurité.</p>
        </div>
      </section>
    </SiteLayout>
  );
}
