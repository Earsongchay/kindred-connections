// Super Admin login — distinct from patient & practitioner. Password + mandatory TOTP MFA.
// TODO Sprint 3-4 — Wire to real IdP (Keycloak) + TOTP validation. Prototype only.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  FileClock,
  FlaskConical,
  Home,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/login-admin")({
  head: () => ({
    meta: [
      { title: "Connexion administrateur — FUENI" },
      { name: "description", content: "Portail d'administration FUENI — accès réservé." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginAdminPage,
});

const DEMO_EMAIL = "admin@fueni.com";
const DEMO_PASSWORD = "Admin2026!";
const DEMO_OTP = "000000";

const T = {
  fr: {
    brandTag: "Portail d'administration",
    brandDesc: "Accès réservé aux administrateurs FUENI provisionnés par le DSI Nazounki.",
    trust1T: "MFA TOTP obligatoire",
    trust1D: "Double authentification à chaque connexion.",
    trust2T: "VPN WireGuard requis",
    trust2D: "Accès depuis le réseau autorisé uniquement.",
    trust3T: "Actions auditées",
    trust3D: "Journalisation complète · conservation 20 ans.",
    footer: "PRODUCTION · RGPD · HDS · ISO 27001",
    backHome: "Accueil",
    heading: "Connexion administrateur",
    demo: "Mode démo",
    demoPwd: "mot de passe",
    email: "Email administrateur",
    emailPh: "admin@fueni.com",
    password: "Mot de passe",
    submit: "Se connecter",
    forgot: "Mot de passe oublié ?",
    contactDsi: "Contacter le DSI",
    audited: "Toutes les actions admin sont auditées · Conservation logs 20 ans",
    errRequired: "Renseignez votre email et votre mot de passe.",
    errInvalid: "Identifiants incorrects.",
    mfaHeading: "Vérification à deux facteurs",
    mfaDesc: "Saisissez le code à 6 chiffres de votre application d'authentification associé à",
    mfaProto: "Prototype — utilisez",
    mfaProtoRest: "pour simuler une connexion réussie.",
    validate: "Valider et accéder",
    back: "Retour",
    mfaFooter: "Code valable 30 s · 5 essais max avant blocage 15 min",
    errOtp: "Code incorrect.",
    errOtpAttempts: "Code incorrect · {count} essai(s) restant(s).",
    locked: "Trop de tentatives. Réessayez dans 15 min.",
  },
  en: {
    brandTag: "Administration portal",
    brandDesc: "Restricted to FUENI administrators provisioned by DSI Nazounki.",
    trust1T: "Mandatory TOTP MFA",
    trust1D: "Two-factor authentication on every sign-in.",
    trust2T: "WireGuard VPN required",
    trust2D: "Access from the authorized network only.",
    trust3T: "Audited actions",
    trust3D: "Full logging · 20-year retention.",
    footer: "PRODUCTION · GDPR · HDS · ISO 27001",
    backHome: "Home",
    heading: "Administrator sign-in",
    demo: "Demo mode",
    demoPwd: "password",
    email: "Administrator email",
    emailPh: "admin@fueni.com",
    password: "Password",
    submit: "Sign in",
    forgot: "Forgot password?",
    contactDsi: "Contact DSI",
    audited: "All admin actions are audited · Logs kept 20 years",
    errRequired: "Enter your email and password.",
    errInvalid: "Incorrect credentials.",
    mfaHeading: "Two-factor verification",
    mfaDesc: "Enter the 6-digit code from your authenticator app linked to",
    mfaProto: "Prototype — use",
    mfaProtoRest: "to simulate a successful sign-in.",
    validate: "Validate and enter",
    back: "Back",
    mfaFooter: "Code valid 30 s · 5 attempts max before 15 min lockout",
    errOtp: "Incorrect code.",
    errOtpAttempts: "Incorrect code · {count} attempt(s) left.",
    locked: "Too many attempts. Try again in 15 min.",
  },
} as const;

type AdminT = { [K in keyof (typeof T)["fr"]]: string };

function LoginAdminPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = T[locale === "en" ? "en" : "fr"];

  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCredentials = () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t.errRequired);
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError(t.errInvalid);
      return;
    }
    setStep("mfa");
  };

  const trust = [
    { Icon: Smartphone, t: t.trust1T, d: t.trust1D },
    { Icon: KeyRound, t: t.trust2T, d: t.trust2D },
    { Icon: FileClock, t: t.trust3T, d: t.trust3D },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left dark brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:w-[460px] xl:w-[520px] flex-col bg-[#1e1b3a] p-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(124,58,237,0.35),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/[0.04]" />

        <Link to="/$locale" params={{ locale }} className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur-sm">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FUENI</span>
        </Link>

        <div className="relative z-10 mt-16">
          <h2 className="text-[2.25rem] font-bold leading-tight">{t.brandTag}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t.brandDesc}</p>
        </div>

        <div className="relative z-10 mt-auto space-y-5">
          {trust.map(({ Icon, t: title, d }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7c3aed] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/65">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-10 border-t border-white/15 pt-5 text-xs tracking-[0.12em] text-white/45">
          {t.footer}
        </div>
      </aside>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/40 bg-background px-6 py-4 lg:hidden">
          <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1e1b3a] text-sm font-bold text-white">
              F
            </div>
            <span className="text-base font-bold">FUENI</span>
          </Link>
        </header>

        <div className="relative flex flex-1 items-start justify-center px-6 pt-14 pb-12 sm:pt-24">
          <Link
            to="/$locale"
            params={{ locale }}
            className="absolute right-6 top-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            {t.backHome}
          </Link>

          <div className="w-full max-w-[420px]">
            {step === "credentials" ? (
              <CredentialsStep
                t={t}
                email={email}
                password={password}
                showPwd={showPwd}
                error={error}
                setEmail={setEmail}
                setPassword={setPassword}
                setShowPwd={setShowPwd}
                onSubmit={submitCredentials}
              />
            ) : (
              <MfaStep t={t} email={email} locale={locale} onBack={() => setStep("credentials")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CredentialsStep({
  t,
  email,
  password,
  showPwd,
  error,
  setEmail,
  setPassword,
  setShowPwd,
  onSubmit,
}: {
  t: AdminT;
  email: string;
  password: string;
  showPwd: boolean;
  error: string | null;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setShowPwd: (v: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-semibold text-[#7c3aed]">
        <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.heading}</h1>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <strong>{t.demo}</strong> — <code className="rounded bg-black/5 px-1 py-0.5 font-mono">{DEMO_EMAIL}</code>{" "}
          · {t.demoPwd} <code className="rounded bg-black/5 px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">{t.email}</Label>
          <Input
            type="email"
            className="h-11 rounded-xl"
            placeholder={t.emailPh}
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">{t.password}</Label>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              className="h-11 rounded-xl pr-11"
              placeholder="••••••••••••"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="toggle"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          className="group h-12 w-full rounded-xl bg-[image:linear-gradient(135deg,#7c3aed,#5b21b6)] text-base font-semibold text-white hover:opacity-95"
        >
          <Lock className="mr-2 h-4 w-4" /> {t.submit}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t.forgot}{" "}
          <a
            href="mailto:dsi@nazounki.com?subject=Acc%C3%A8s%20Super%20Admin%20FUENI"
            className="font-semibold text-[#7c3aed] hover:underline"
          >
            {t.contactDsi}
          </a>
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Lock className="h-3 w-3" />
          <span>{t.audited}</span>
        </div>
      </div>
    </>
  );
}

function MfaStep({
  t,
  email,
  locale,
  onBack,
}: {
  t: AdminT;
  email: string;
  locale: Locale;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const code = digits.join("");

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setDigits(next);
    document.getElementById(`admin-otp-${Math.min(pasted.length - 1, 5)}`)?.focus();
  };

  const verify = () => {
    if (code.length < 6 || locked) return;
    if (code === DEMO_OTP) {
      window.location.href = `/${locale}/admin`;
      return;
    }
    const a = attempts + 1;
    setAttempts(a);
    if (a >= 5) {
      setError(t.locked);
      setLocked(true);
    } else {
      setError(t.errOtpAttempts.replace("{count}", String(5 - a)));
    }
    setDigits(Array(6).fill(""));
    firstRef.current?.focus();
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>

      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed]">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.mfaHeading}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.mfaDesc} <strong className="text-foreground">{email}</strong>.
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <span>
          {t.mfaProto} <code className="rounded bg-black/5 px-1 py-0.5 font-mono">{DEMO_OTP}</code> {t.mfaProtoRest}
        </span>
      </div>

      <div className="mt-6 flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            id={`admin-otp-${i}`}
            ref={i === 0 ? firstRef : undefined}
            value={d}
            disabled={locked}
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-12 rounded-xl border border-input bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed] disabled:opacity-50"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...digits];
              next[i] = v;
              setDigits(next);
              if (v && i < 5) document.getElementById(`admin-otp-${i + 1}`)?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0)
                document.getElementById(`admin-otp-${i - 1}`)?.focus();
              if (e.key === "Enter") verify();
            }}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

      <Button
        onClick={verify}
        disabled={code.length < 6 || locked}
        className="group mt-6 h-12 w-full rounded-xl bg-[image:linear-gradient(135deg,#7c3aed,#5b21b6)] text-base font-semibold text-white hover:opacity-95"
      >
        {t.validate}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground/70">{t.mfaFooter}</p>
    </>
  );
}
