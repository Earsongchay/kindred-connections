// SF-DOCTOR-REGISTRATION v1.0 — practitioner account lifecycle (sign-up).
// Flow: Eligibility (country) → Sign-up (identity + email + password) → Email OTP
// (account created PENDING_KYC) → Plan choice (Free/Solo, NO payment) → Verification landing.
// Pure UI prototype — wire to Keycloak + Brevo email OTP in a later sprint.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Stethoscope,
  MapPin,
  Mail,
  ShieldCheck,
  Sparkles,
  Gift,
  FileText,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { evaluatePassword, scorePassword, type PwdRules } from "@/lib/password";
import { validatePhone } from "@/lib/phone-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/signup")({
  head: ({ params }) => {
    const dict = params.locale === "en" ? en : fr;
    return {
      meta: [
        { title: dict.signup.meta.title },
        { name: "description", content: dict.signup.meta.description },
      ],
    };
  },
  component: SignupPage,
});

// 9 MVP launch countries — country of practice sets KYC referential + phone dial code.
const COUNTRIES = [
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "NE", name: "Niger", dial: "+227", flag: "🇳🇪" },
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "CD", name: "RDC", dial: "+243", flag: "🇨🇩" },
];

type Plan = "free" | "solo";
type Profession = "doctor" | "pharmacist" | "nurse";
type Step = "eligibility" | "profession" | "form" | "otp" | "plan" | "done";
const STEP_IDS: Step[] = ["eligibility", "profession", "form", "otp", "plan"];

type SignupForm = {
  country: string;
  profession: Profession | "";
  first: string;
  last: string;
  dob: string;
  sex: string;
  email: string;
  phone: string;
  password: string;
};


import { fr } from "@/i18n/locales/fr";
import { en } from "@/i18n/locales/en";

function useLocale(): Locale {
  const params = Route.useParams();
  return isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
}

function SignupPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("eligibility");
  const [plan, setPlan] = useState<Plan>("solo");
  const [form, setForm] = useState<SignupForm>({
    country: "",
    first: "",
    last: "",
    dob: "",
    sex: "",
    email: "",
    phone: "",
    password: "",
  });

  const update = (patch: Partial<SignupForm>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-accent/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-70" />
      </div>

      <header className="border-b border-border/40 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/$locale" params={{ locale }} className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] font-bold text-primary-foreground shadow-[var(--shadow-md)]">
              F
            </div>
            <span className="text-lg font-bold tracking-tight">FUENI</span>
          </Link>
          <Link
            to="/$locale/login"
            params={{ locale }}
            search={{ audience: "pro" }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("signup.common.signIn")} →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:py-14">
        {step !== "done" && <Stepper step={step} />}

        {step === "eligibility" && (
          <EligibilityStep
            country={form.country}
            setCountry={(c) => update({ country: c })}
            onNext={() => setStep("form")}
            locale={locale}
          />
        )}

        {step === "form" && (
          <FormStep
            form={form}
            update={update}
            onBack={() => setStep("eligibility")}
            onNext={() => setStep("otp")}
            locale={locale}
          />
        )}

        {step === "otp" && (
          <EmailOtpStep
            email={form.email}
            onVerified={() => setStep("plan")}
            onEdit={() => setStep("form")}
            onRestart={() => setStep("eligibility")}
          />
        )}

        {step === "plan" && (
          <PlanStep
            plan={plan}
            setPlan={setPlan}
            onBack={() => setStep("otp")}
            onNext={() => setStep("done")}
          />
        )}

        {step === "done" && (
          <DoneStep
            form={form}
            plan={plan}
            onDashboard={() => navigate({ to: "/$locale", params: { locale } })}
            locale={locale}
          />
        )}
      </main>
    </div>
  );
}

/* ─── STEPPER ───────────────────────────────────────────────────────────── */
function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation();
  const labels = t("signup.steps", { returnObjects: true }) as string[];
  const currentIdx = STEP_IDS.indexOf(step);
  const progressPct = ((currentIdx + 1) / STEP_IDS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          <span className="text-foreground">{currentIdx + 1}</span> / {STEP_IDS.length}
        </span>
        <span className="text-foreground">{labels[currentIdx]}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-brand)] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {STEP_IDS.map((id, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={id} className="flex items-center gap-2">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-all",
                  done && "bg-emerald-500 text-white",
                  active &&
                    "bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-md)]",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  done || active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── STEP 1 — ELIGIBILITY (§4.1) ───────────────────────────────────────── */
function EligibilityStep({
  country,
  setCountry,
  onNext,
  locale,
}: {
  country: string;
  setCountry: (c: string) => void;
  onNext: () => void;
  locale: Locale;
}) {
  const { t } = useTranslation();
  return (
    <div className="glass rounded-3xl p-6 sm:p-9">
      <div className="mb-5 flex justify-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-7 w-7" />
        </div>
      </div>
      <span className="mx-auto block w-fit rounded-full bg-primary/10 px-3 py-1 text-center text-xs font-semibold text-primary">
        {t("signup.eligibility.tag")}
      </span>
      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight sm:text-3xl">
        {t("signup.eligibility.title")}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("signup.eligibility.subtitle")}
      </p>

      <div className="mt-8">
        <Label className="text-sm font-medium">{t("signup.eligibility.countryLabel")}</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder={t("signup.eligibility.countryPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dial})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-primary" />
        <p>{t("signup.eligibility.kycNote")}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("signup.eligibility.whyTitle")}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
            {t("signup.eligibility.why1")}
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
            {t("signup.eligibility.why2")}
          </li>
        </ul>
      </div>

      <Button
        className="mt-7 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.01] hover:opacity-95"
        disabled={!country}
        onClick={onNext}
      >
        {t("signup.eligibility.next")} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("signup.common.isPatient")}{" "}
        <Link
          to="/$locale/inscription"
          params={{ locale }}
          className="font-semibold text-primary hover:underline"
        >
          {t("signup.common.patientSignup")}
        </Link>
      </p>
    </div>
  );
}

/* ─── STEP 2 — SIGN-UP FORM (§4.1 / §6.1) ───────────────────────────────── */
function FormStep({
  form,
  update,
  onBack,
  onNext,
  locale,
}: {
  form: SignupForm;
  update: (patch: Partial<SignupForm>) => void;
  onBack: () => void;
  onNext: () => void;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const [showPwd, setShowPwd] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [code, setCode] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === form.country);

  const age = useMemo(() => {
    if (!form.dob) return null;
    const d = new Date(form.dob);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
  }, [form.dob]);
  const ageError = age !== null && age < 18 ? t("signup.form.ageError") : null;

  const pwdRules: PwdRules = useMemo(() => evaluatePassword(form.password), [form.password]);
  const pwdScore = useMemo(() => scorePassword(pwdRules), [pwdRules]);
  const pwdStrength = useMemo(() => {
    if (pwdScore <= 2)
      return { label: t("signup.form.pwdWeak"), color: "bg-red-500", text: "text-red-600" };
    if (pwdScore === 3)
      return { label: t("signup.form.pwdFair"), color: "bg-amber-500", text: "text-amber-600" };
    if (pwdScore <= 5)
      return { label: t("signup.form.pwdStrong"), color: "bg-emerald-500", text: "text-emerald-600" };
    return {
      label: t("signup.form.pwdVeryStrong"),
      color: "bg-emerald-600",
      text: "text-emerald-700",
    };
  }, [pwdScore, t]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = form.country !== "" && validatePhone(form.phone, form.country);

  const submit = () => {
    setGlobalError(null);
    const ok =
      form.first &&
      form.last &&
      form.dob &&
      !ageError &&
      form.sex &&
      emailValid &&
      phoneValid &&
      pwdScore === 6 &&
      cgu &&
      code;
    if (!ok) {
      setGlobalError(t("signup.form.errorRequired"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 700);
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-9">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Stethoscope className="h-3.5 w-3.5" /> {t("signup.form.tag")}
        </span>
        {selectedCountry && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {t("signup.form.countryBadge")} {selectedCountry.flag} {selectedCountry.name}
          </span>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {t("signup.form.title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("signup.form.subtitle")}</p>

      {globalError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/40">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>{globalError}</p>
        </div>
      )}

      <h3 className="mt-7 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("signup.form.personalInfo")}
      </h3>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <Field label={t("signup.form.first")}>
          <Input
            placeholder="Ex : Aïssatou"
            value={form.first}
            onChange={(e) => update({ first: e.target.value })}
            maxLength={80}
          />
        </Field>
        <Field label={t("signup.form.last")}>
          <Input
            placeholder="Ex : Diop"
            value={form.last}
            onChange={(e) => update({ last: e.target.value })}
            maxLength={80}
          />
        </Field>

        <Field label={t("signup.form.dob")} error={ageError ?? undefined}>
          <Input type="date" value={form.dob} onChange={(e) => update({ dob: e.target.value })} />
        </Field>
        <Field label={t("signup.form.sex")}>
          <Select value={form.sex} onValueChange={(v) => update({ sex: v })}>
            <SelectTrigger>
              <SelectValue placeholder={t("signup.form.sexPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">{t("signup.form.sexF")}</SelectItem>
              <SelectItem value="M">{t("signup.form.sexM")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field
            label={t("signup.form.email")}
            error={form.email && !emailValid ? t("signup.form.emailError") : undefined}
          >
            <Input
              type="email"
              placeholder="Ex : aissatou.diop@example.com"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </Field>
          <p className="mt-1.5 text-xs text-muted-foreground">{t("signup.form.emailHint")}</p>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-sm font-medium">{t("signup.form.phone")}</Label>
          <div className="mt-1.5 flex gap-2">
            <div className="grid w-28 place-items-center rounded-xl border border-input bg-muted/50 text-sm font-semibold text-foreground">
              {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.dial}` : "—"}
            </div>
            <Input
              className="flex-1"
              placeholder="Ex : 77 123 45 67"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value.replace(/[^\d\s]/g, "") })}
              inputMode="numeric"
            />
          </div>
          {form.phone && !phoneValid && (
            <p className="mt-1.5 text-xs text-red-600">{t("signup.form.phoneError")}</p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">{t("signup.form.phoneHint")}</p>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-sm font-medium">{t("signup.form.password")}</Label>
          <div className="relative mt-1.5">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => update({ password: e.target.value })}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? t("signup.form.hidePwd") : t("signup.form.showPwd")}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${pwdStrength.color}`}
                  style={{ width: `${(pwdScore / 6) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${pwdStrength.text}`}>
                {form.password ? pwdStrength.label : ""}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Rule ok={pwdRules.length}>{t("signup.form.pwdLength")}</Rule>
              <Rule ok={pwdRules.upper}>{t("signup.form.pwdUpper")}</Rule>
              <Rule ok={pwdRules.lower}>{t("signup.form.pwdLower")}</Rule>
              <Rule ok={pwdRules.digit}>{t("signup.form.pwdDigit")}</Rule>
              <Rule ok={pwdRules.special}>{t("signup.form.pwdSpecial")}</Rule>
              <Rule ok={pwdRules.noSpace}>{t("signup.form.pwdNoSpace")}</Rule>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={cgu} onCheckedChange={(v) => setCgu(Boolean(v))} className="mt-0.5" />
          <span>
            {t("signup.form.cguAccept")}{" "}
            <a href="#" target="_blank" rel="noopener" className="font-medium text-primary underline">
              {t("signup.form.cguLink")}
            </a>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={code} onCheckedChange={(v) => setCode(Boolean(v))} className="mt-0.5" />
          <span>
            {t("signup.form.codeAccept")}{" "}
            <a href="#" target="_blank" rel="noopener" className="font-medium text-primary underline">
              {t("signup.form.codeLink")}
            </a>
          </span>
        </label>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} className="sm:w-auto">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("signup.common.back")}
        </Button>
        <Button
          className="h-12 rounded-full bg-[image:var(--gradient-brand)] px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.01] hover:opacity-95"
          onClick={submit}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("signup.form.submit")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("signup.common.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("signup.common.alreadyAccount")}{" "}
        <Link
          to="/$locale/login"
          params={{ locale }}
          search={{ audience: "pro" }}
          className="font-semibold text-primary hover:underline"
        >
          {t("signup.common.signIn")}
        </Link>
      </p>
    </div>
  );
}

/* ─── STEP 3 — EMAIL OTP (§4.1) ─────────────────────────────────────────── */
const EMAIL_VALID_CODE = "123456";

function EmailOtpStep({
  email,
  onVerified,
  onEdit,
  onRestart,
}: {
  email: string;
  onVerified: () => void;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [tooMany, setTooMany] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [expiry, setExpiry] = useState(300);
  const [expired, setExpired] = useState(false);

  const code = digits.join("");

  useEffect(() => {
    if (expired || expiry <= 0) {
      if (!expired) {
        setExpired(true);
        setDigits(Array(6).fill(""));
        setError(null);
        setAttempts(0);
      }
      return;
    }
    const id = setTimeout(() => setExpiry((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [expiry, expired]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const expiryMm = String(Math.floor(expiry / 60)).padStart(2, "0");
  const expirySs = String(expiry % 60).padStart(2, "0");

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    const last = Math.min(pasted.length - 1, 5);
    document.getElementById(`otp-email-${last}`)?.focus();
  };

  const handleVerify = () => {
    setError(null);
    if (code.length < 6 || expired) return;
    if (code === EMAIL_VALID_CODE) {
      onVerified();
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    if (next >= 3) {
      setTooMany(true);
      setError(t("signup.otp.tooManyAttempts"));
      setTimeout(() => onRestart(), 2000);
    } else {
      setError(t("signup.otp.errorAttempts").replace("{count}", String(3 - next)));
    }
  };

  const handleResend = () => {
    if (resendCount >= 5) return;
    setResendCount((n) => n + 1);
    setCooldown(60);
    setExpiry(300);
    setExpired(false);
    setDigits(Array(6).fill(""));
    setError(null);
    setAttempts(0);
    setTooMany(false);
  };

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8">
      <div className="mb-4 flex justify-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-7 w-7" />
        </div>
      </div>
      <span className="mx-auto block w-fit rounded-full bg-primary/10 px-3 py-1 text-center text-xs font-semibold text-primary">
        {t("signup.otp.tag")}
      </span>
      <h2 className="mt-3 text-center text-2xl font-bold">{t("signup.otp.title")}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("signup.otp.subtitle")}
        <br />
        <span className="font-semibold text-foreground">{email}</span>
      </p>

      <div className="mt-4 text-center text-sm">
        {expired ? (
          <p className="text-red-600">{t("signup.otp.expired")}</p>
        ) : (
          <p className="text-muted-foreground">
            {t("signup.otp.validFor").replace("{time}", `${expiryMm}:${expirySs}`)}
          </p>
        )}
      </div>
      <div className="flex justify-center text-xs text-muted-foreground">{EMAIL_VALID_CODE}</div>

      <div className="mt-5 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-email-${i}`}
            value={d}
            disabled={tooMany || (expired && !tooMany)}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...digits];
              next[i] = v;
              setDigits(next);
              if (v && i < 5) document.getElementById(`otp-email-${i + 1}`)?.focus();
            }}
            onPaste={i === 0 ? handlePaste : undefined}
            className="h-14 w-12 rounded-2xl border-2 border-input bg-background/70 text-center text-xl font-bold shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
            inputMode="numeric"
            maxLength={1}
          />
        ))}
      </div>
      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {resendCount >= 5 ? (
          <span className="text-red-600">{t("signup.otp.tooManyAttempts")}</span>
        ) : (expired && !tooMany) || cooldown <= 0 ? (
          <>
            {t("signup.otp.notReceived")}{" "}
            <button onClick={handleResend} className="font-semibold text-primary hover:underline">
              {t("signup.otp.resend")}
            </button>
          </>
        ) : (
          <>
            {t("signup.otp.notReceived")}{" "}
            <span>
              {t("signup.otp.resendTimer")} {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
              {String(cooldown % 60).padStart(2, "0")}
            </span>
          </>
        )}
      </p>

      <Button
        disabled={code.length < 6 || tooMany || expired}
        onClick={handleVerify}
        className="mt-6 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.01] hover:opacity-95"
      >
        {t("signup.otp.verify")} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <button
        onClick={onEdit}
        className="mt-4 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("signup.otp.edit")}
      </button>
    </div>
  );
}

/* ─── STEP 4 — PLAN CHOICE (§4.1 — NO payment) ──────────────────────────── */
function PlanStep({
  plan,
  setPlan,
  onBack,
  onNext,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const freeFeatures = t("signup.plan.freeFeatures", { returnObjects: true }) as string[];
  const soloFeatures = t("signup.plan.soloFeatures", { returnObjects: true }) as string[];

  return (
    <section>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {t("signup.plan.tag")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("signup.plan.title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("signup.plan.subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <PlanCard
          name={t("signup.plan.free")}
          price="0 €"
          period={t("signup.plan.forever")}
          selected={plan === "free"}
          onSelect={() => setPlan("free")}
          features={freeFeatures}
          cta={t("signup.plan.freeCta")}
          selectedLabel={t("signup.plan.selected")}
        />
        <PlanCard
          recommended
          recommendedLabel={t("signup.plan.recommended")}
          name={t("signup.plan.solo")}
          price={t("signup.plan.soloPrice")}
          period={t("signup.plan.perMonth")}
          subPrice={t("signup.plan.subPrice")}
          selected={plan === "solo"}
          onSelect={() => setPlan("solo")}
          features={soloFeatures}
          cta={t("signup.plan.soloCta")}
          selectedLabel={t("signup.plan.selected")}
        />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-500/10 p-4 text-sm text-emerald-700">
        <Gift className="mt-0.5 h-4 w-4 flex-none" />
        <p>{t("signup.plan.noPaymentNote")}</p>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("signup.common.back")}
        </Button>
        <Button
          onClick={onNext}
          className="h-12 rounded-full bg-[image:var(--gradient-brand)] px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-lg)]"
        >
          {t("signup.plan.next")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  period,
  subPrice,
  features,
  cta,
  recommended,
  recommendedLabel,
  selected,
  onSelect,
  selectedLabel,
}: {
  name: string;
  price: string;
  period: string;
  subPrice?: string;
  features: string[];
  cta: string;
  recommended?: boolean;
  recommendedLabel?: string;
  selected: boolean;
  onSelect: () => void;
  selectedLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col rounded-3xl border p-7 text-left transition-all ${
        selected
          ? "border-primary bg-card shadow-[var(--shadow-float)] ring-2 ring-primary/30"
          : "border-border bg-card hover:border-primary/60"
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[image:var(--gradient-brand)] px-3 py-1 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-card)]">
          <Sparkles className="h-3 w-3" /> {recommendedLabel}
        </span>
      )}
      <span className="text-xs font-semibold tracking-widest text-muted-foreground">{name}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      {subPrice && <p className="mt-2 text-xs text-muted-foreground">{subPrice}</p>}

      <ul className="mt-6 space-y-3 border-t border-border pt-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {selected ? selectedLabel : cta}
      </div>
    </button>
  );
}

/* ─── STEP 5 — VERIFICATION LANDING (PENDING_KYC) ───────────────────────── */
function DoneStep({
  form,
  plan,
  onDashboard,
  locale,
}: {
  form: SignupForm;
  plan: Plan;
  onDashboard: () => void;
  locale: Locale;
}) {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-2xl">
      <div className="glass rounded-3xl p-8 text-center sm:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_15px_40px_-10px_rgba(16,185,129,.6)]">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{t("signup.done.title")}</h2>
        <p className="mt-3 text-muted-foreground">
          {t("signup.done.welcome")} {form.first} {form.last}.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("signup.done.statusLabel")}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-2 font-semibold text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t("signup.done.statusPending")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("signup.done.planLabel")}
            </p>
            <p className="mt-1.5 font-semibold">
              {plan === "free" ? t("signup.done.planFree") : t("signup.done.planSolo")}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-left">
          <NextStep
            icon={FileText}
            color="primary"
            title={t("signup.done.kycTitle")}
            desc={t("signup.done.kycDesc")}
          />
          <NextStep
            icon={Smartphone}
            color="amber"
            title={t("signup.done.phoneTitle")}
            desc={t("signup.done.phoneDesc")}
          />
          {plan === "solo" && (
            <NextStep
              icon={CreditCard}
              color="emerald"
              title={t("signup.done.soloTitle")}
              desc={t("signup.done.soloDesc")}
            />
          )}
        </div>

        <Button
          onClick={onDashboard}
          className="mt-8 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground shadow-[var(--shadow-lg)]"
        >
          <FileText className="mr-2 h-4 w-4" /> {t("signup.done.kycCta")}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("signup.done.emailSent")} <strong>{form.email}</strong>
        </p>
        <Link
          to="/$locale"
          params={{ locale }}
          className="mt-4 inline-block text-xs text-muted-foreground underline"
        >
          {t("signup.done.backHome")}
        </Link>
      </div>
    </section>
  );
}

function NextStep({
  icon: Icon,
  color,
  title,
  desc,
}: {
  icon: typeof FileText;
  color: "emerald" | "amber" | "primary";
  title: string;
  desc: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-600",
    amber: "bg-amber-500/15 text-amber-600",
    primary: "bg-primary/15 text-primary",
  };
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

/* ─── SHARED ────────────────────────────────────────────────────────────── */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : ""}`}>
      <Check className={`h-3 w-3 ${ok ? "opacity-100" : "opacity-30"}`} /> {children}
    </li>
  );
}
