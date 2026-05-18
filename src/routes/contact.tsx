import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — FUENI" },
      { name: "description", content: "Une question, un partenariat, une demande presse ? Contactez l'équipe FUENI." },
      { property: "og:title", content: "Contact — FUENI" },
      { property: "og:description", content: "Contactez l'équipe FUENI." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  role: z.string().max(60).optional(),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      role: fd.get("role") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("Message envoyé. Nous revenons vers vous sous 24 h.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[oklch(0.97_0.03_220)] to-background py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <div className="section-tag justify-center">Contact</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Parlons de votre <span className="text-accent-cyan">projet santé.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">L'équipe FUENI répond sous 24 h ouvrées.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1fr_1.4fr] gap-10">
          <aside className="space-y-5">
            <InfoCard icon={<Mail className="w-5 h-5" />} title="Email" value="contact@fueni.health" href="mailto:contact@fueni.health" />
            <InfoCard icon={<Phone className="w-5 h-5" />} title="Téléphone" value="+221 33 800 00 00" href="tel:+221338000000" />
            <InfoCard icon={<MapPin className="w-5 h-5" />} title="Siège" value="Dakar, Sénégal · Paris, France" />
          </aside>

          <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-soft">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nom complet" name="name" placeholder="Dr. Mamadou Sow" error={errors.name} />
              <Field label="Email" name="email" type="email" placeholder="vous@exemple.com" error={errors.email} />
            </div>
            <div className="mt-5">
              <Field label="Rôle (optionnel)" name="role" placeholder="Médecin, DAF, journaliste…" error={errors.role} />
            </div>
            <div className="mt-5">
              <label className="text-sm font-semibold">Message</label>
              <textarea
                name="message" rows={5}
                placeholder="Comment pouvons-nous aider ?"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              />
              {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
            </div>
            <button
              type="submit" disabled={submitting}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "Envoi…" : (<>Envoyer le message <Send className="w-4 h-4" /></>)}
            </button>
            <p className="mt-4 text-xs text-muted-foreground">En soumettant ce formulaire, vous acceptez notre politique de confidentialité.</p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href?: string }) {
  const inner = (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-accent-cyan transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent-cyan-bg text-primary grid place-items-center shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{title}</div>
        <div className="font-semibold mt-1">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : inner;
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
