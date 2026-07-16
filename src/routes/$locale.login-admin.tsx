// Admin sign-in — password + mandatory TOTP MFA (prototype).
// Demo credentials: admin@fueni.com / Admin2026!  TOTP: 000000
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { KeyRound, Lock, Mail, Shield, ShieldCheck } from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/login-admin")({
  head: () => ({
    meta: [
      { title: "Connexion Super Admin — FUENI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginAdmin,
});

const DEMO_EMAIL = "admin@fueni.com";
const DEMO_PASSWORD = "Admin2026!";
const DEMO_TOTP = "000000";
const MAX_ATTEMPTS = 5;

function LoginAdmin() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const navigate = useNavigate();

  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= MAX_ATTEMPTS;

  function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setStep("totp");
      setAttempts(0);
    } else {
      setError("Identifiants invalides.");
    }
  }

  function submitTotp(code: string) {
    if (locked) return;
    if (code === DEMO_TOTP) {
      navigate({ to: "/$locale/admin", params: { locale } });
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setError(
      next >= MAX_ATTEMPTS
        ? "Compte verrouillé après 5 tentatives. Contactez le support."
        : `Code invalide. Tentative ${next}/${MAX_ATTEMPTS}.`,
    );
  }

  return (
    <div className="grid min-h-screen bg-gradient-to-br from-[#0d3b46] via-[#123f4b] to-[#1a1a2e] p-4 text-white">
      <div className="m-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 backdrop-blur">
            <Shield className="h-6 w-6 text-violet-300" />
          </div>
          <div className="text-lg font-bold tracking-wide">FUENI</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Portail Super Admin</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl">
          {step === "credentials" ? (
            <>
              <h1 className="text-xl font-bold tracking-tight">Connexion sécurisée</h1>
              <p className="mt-1 text-sm text-slate-500">
                Accès réservé aux administrateurs FUENI.
              </p>

              <form onSubmit={submitCredentials} className="mt-5 space-y-4">
                <Field label="E-mail administrateur" icon={Mail}>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-none bg-transparent p-0 text-sm focus:outline-none"
                  />
                </Field>
                <Field label="Mot de passe" icon={Lock}>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-none bg-transparent p-0 text-sm focus:outline-none"
                  />
                </Field>

                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Continuer
                </button>
              </form>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Démo :</span> {DEMO_EMAIL} · {DEMO_PASSWORD}
              </div>
            </>
          ) : (
            <TotpStep
              onSubmit={submitTotp}
              onBack={() => {
                setStep("credentials");
                setError(null);
              }}
              error={error}
              locked={locked}
            />
          )}
        </div>

        <div className="mt-6 text-center text-xs text-white/60">
          <Link to="/$locale" params={{ locale }} className="hover:text-white">
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
        <Icon className="h-4 w-4 text-slate-400" />
        {children}
      </div>
    </label>
  );
}

function TotpStep({
  onSubmit,
  onBack,
  error,
  locked,
}: {
  onSubmit: (code: string) => void;
  onBack: () => void;
  error: string | null;
  locked: boolean;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const code = useMemo(() => digits.join(""), [digits]);

  function setAt(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  }

  return (
    <>
      <div className="mb-1 flex items-center gap-2 text-violet-700">
        <ShieldCheck className="h-5 w-5" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Vérification en deux étapes
        </h1>
      </div>
      <p className="text-sm text-slate-500">
        Entrez le code à 6 chiffres généré par votre application d'authentification.
      </p>

      <div className="mt-5 flex justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            disabled={locked}
            className={cn(
              "h-12 w-11 rounded-lg border text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2",
              "border-slate-200 focus:border-violet-500 focus:ring-violet-100",
              locked && "bg-slate-100 text-slate-400",
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => onSubmit(code)}
        disabled={code.length !== 6 || locked}
        className={cn(
          "mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-white shadow-sm transition",
          code.length === 6 && !locked
            ? "bg-violet-600 hover:bg-violet-700"
            : "cursor-not-allowed bg-slate-300",
        )}
      >
        <KeyRound className="mr-1.5 inline h-4 w-4" /> Vérifier
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-700"
      >
        ← Utiliser un autre compte
      </button>

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-600">Démo :</span> code TOTP {DEMO_TOTP}
      </div>
    </>
  );
}
