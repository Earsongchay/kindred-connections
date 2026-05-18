import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { User, UserRound, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

type Role = "patient" | "praticien";

export const Route = createFileRoute("/inscription")({
  validateSearch: (s: Record<string, unknown>) => ({
    role: (s.role === "praticien" ? "praticien" : "patient") as Role,
  }),
  head: () => ({
    meta: [
      { title: "Inscription — FUENI" },
      { name: "description", content: "Créez votre compte FUENI en moins d'une minute. Patient ou praticien, sans carte bancaire." },
      { property: "og:title", content: "Inscription — FUENI" },
      { property: "og:description", content: "Créez votre compte FUENI en moins d'une minute." },
      { property: "og:url", content: "/inscription" },
    ],
    links: [{ rel: "canonical", href: "/inscription" }],
  }),
  component: SignupPage,
});

const baseSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone requis").max(30),
  country: z.string().min(1, "Pays requis"),
  password: z.string().min(8, "Au moins 8 caractères").max(128),
  consent: z.literal("on", { errorMap: () => ({ message: "Consentement requis" }) }),
});

const praticienSchema = baseSchema.extend({
  speciality: z.string().trim().min(2, "Spécialité requise").max(120),
  rpps: z.string().trim().min(3, "Numéro RPPS / Ordre requis").max(40),
});

const COUNTRIES = ["Sénégal", "Côte d'Ivoire", "Cameroun", "Mali", "RDC", "Bénin", "Togo", "Burkina Faso", "Niger", "Tchad", "Gabon", "Congo", "Madagascar", "France"];

function SignupPage() {
  const { role: initial } = Route.useSearch();
  const navigate = Route.useNavigate();
  const role = initial;
  const setRole = (r: Role) => navigate({ search: { role: r }, replace: true });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const schema = role === "praticien" ? praticienSchema : baseSchema;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    toast.success(
      role === "patient"
        ? "Compte créé. Vérifiez votre téléphone pour le code SMS."
        : "Demande envoyée. Nos équipes vérifient votre dossier sous 48 h."
    );
    (e.target as HTMLFormElement).reset();
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[oklch(0.97_0.03_220)] to-background py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <div className="section-tag justify-center">Inscription</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Démarrez sur FUENI en <span className="text-accent-cyan">moins d'une minute.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">Aucune carte bancaire requise. Choisissez votre profil.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="flex bg-surface border border-border rounded-full p-1.5 max-w-md mx-auto">
            <RoleBtn active={role === "patient"} onClick={() => setRole("patient")} icon={<User className="w-4 h-4" />}>Patient</RoleBtn>
            <RoleBtn active={role === "praticien"} onClick={() => setRole("praticien")} icon={<UserRound className="w-4 h-4" />}>Praticien</RoleBtn>
          </div>

          <form onSubmit={onSubmit} className="mt-8 bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-soft">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Prénom" name="firstName" placeholder="Mamadou" error={errors.firstName} />
              <Field label="Nom" name="lastName" placeholder="Sow" error={errors.lastName} />
              <Field label="Email" name="email" type="email" placeholder="vous@exemple.com" error={errors.email} />
              <Field label="Téléphone" name="phone" type="tel" placeholder="+221 77 000 00 00" error={errors.phone} />
              <Select label="Pays" name="country" options={COUNTRIES} error={errors.country} />
              <Field label="Mot de passe" name="password" type="password" placeholder="Au moins 8 caractères" error={errors.password} />
              {role === "praticien" && (
                <>
                  <Field label="Spécialité" name="speciality" placeholder="Cardiologie, pharmacie…" error={errors.speciality} />
                  <Field label="N° RPPS / Ordre" name="rpps" placeholder="Numéro d'identification" error={errors.rpps} />
                </>
              )}
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm">
              <input type="checkbox" name="consent" className="mt-1 w-4 h-4 accent-[color:var(--color-accent-cyan)]" />
              <span className="text-muted-foreground">
                J'accepte les <a href="#" className="text-primary underline">conditions d'utilisation</a> et la <a href="#" className="text-primary underline">politique de confidentialité</a>.
              </span>
            </label>
            {errors.consent && <p className="mt-1.5 text-xs text-destructive">{errors.consent}</p>}

            {role === "praticien" && (
              <div className="mt-6 bg-warm-light/60 border border-warm/30 rounded-xl p-4 text-sm">
                <strong>Validation manuelle.</strong> Nos équipes vérifient votre RPPS / Ordre des Médecins et vous activent sous 48 h ouvrées.
              </div>
            )}

            <button
              type="submit" disabled={submitting}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "Envoi…" : (<>Créer mon compte <ArrowRight className="w-4 h-4" /></>)}
            </button>

            <Bullets role={role} />
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ? <Link to="/contact" className="text-primary font-semibold">Contactez-nous</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function RoleBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className={[
        "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition",
        active ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {icon} {children}
    </button>
  );
}

function Field({ label, name, type = "text", placeholder, error }: {
  label: string; name: string; type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type} placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Select({ label, name, options, error }: { label: string; name: string; options: string[]; error?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={name}>{label}</label>
      <select
        id={name} name={name} defaultValue=""
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
      >
        <option value="" disabled>Sélectionnez…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Bullets({ role }: { role: Role }) {
  const items = role === "patient"
    ? ["Accès immédiat après vérification SMS", "Vos documents médicaux centralisés", "Paiement Mobile Money pris en charge"]
    : ["Validation manuelle de votre dossier sous 48 h", "Planning, dossiers patients, ordonnances signées", "Wallet & payouts automatiques"];
  return (
    <ul className="mt-6 grid sm:grid-cols-3 gap-3">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
          <span className="mt-0.5 w-4 h-4 rounded-full bg-primary-lighter text-primary grid place-items-center shrink-0">
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
          {i}
        </li>
      ))}
    </ul>
  );
}
