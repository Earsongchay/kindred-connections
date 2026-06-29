// TODO Sprint 3-4 — Validate copy with Nazounki team. Texts from SF-PATIENT-REGISTRATION v1.0.
// TODO Sprint 4-5 — Wire to Keycloak + Africa's Talking SMS OTP + Brevo email OTP. Pure UI prototype.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Smartphone,
  Globe,
  Loader2,
  Info,
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
import { sessionForm } from "@/lib/session-form";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/inscription")({
  head: () => ({
    meta: [
      { title: "Créer mon compte patient — FUENI" },
      {
        name: "description",
        content:
          "Inscription patient FUENI : prenez RDV, conservez vos documents médicaux, en moins de 3 minutes.",
      },
    ],
  }),
  component: PatientRegistration,
});

type Step = "form" | "smsOtp" | "baseProfile" | "emailOtp" | "done";

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
  { code: "OTHER", name: "Other", dial: "", flag: "🌍" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  SN: ["Dakar", "Thiès", "Saint-Louis", "Touba", "Ziguinchor", "Autre"],
  CI: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Autre"],
  ML: ["Bamako", "Sikasso", "Mopti", "Ségou", "Kayes", "Autre"],
  BJ: ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Autre"],
  TG: ["Lomé", "Sokodé", "Kara", "Kpalimé", "Autre"],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Autre"],
  NE: ["Niamey", "Zinder", "Maradi", "Agadez", "Autre"],
  CM: ["Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua", "Autre"],
  CD: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Goma", "Autre"],
};

const STEP_IDS: Step[] = ["form", "smsOtp", "baseProfile"];

// §4.1.3 — mask local phone digits except last 2, preserving spaces
function maskLocalPhone(phone: string): string {
  const raw = phone.trim();
  const total = (raw.match(/\d/g) ?? []).length;
  if (total < 2) return raw;
  let seen = 0;
  return raw.replace(/\d/g, (d) => {
    seen++;
    return seen > total - 2 ? d : "*";
  });
}

function PatientRegistration() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [customDial, setCustomDial] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [rgpd, setRgpd] = useState(false);

  // T20 — restored banner flag
  const [restoredBanner, setRestoredBanner] = useState(false);

  // Base profile state (§4.3)
  const [profileCountry, setProfileCountry] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState(locale === "en" ? "en" : "fr");
  const [address, setAddress] = useState("");

  // Errors
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // T15 — CAPTCHA failure simulation (dev only)
  const [captchaFailures, setCaptchaFailures] = useState(0);
  const [captchaBlockedSeconds, setCaptchaBlockedSeconds] = useState(0);

  // T09 — Load saved form data on mount
  useEffect(() => {
    const saved = sessionForm.getInscription();
    if (saved) {
      setFirstName(saved.firstName);
      setLastName(saved.lastName);
      setDob(saved.dob);
      setSex(saved.sex);
      setEmail(saved.email);
      setPhone(saved.phone);
      setCountry(saved.countryCode);
      setRestoredBanner(true);
    }
  }, []);

  // §4.1.3 — IP geolocation: auto-select country on first visit (no saved session)
  useEffect(() => {
    if (sessionForm.getInscription()) return;
    fetch("https://api.country.is/")
      .then((r) => r.json())
      .then((d: { country?: string }) => {
        if (d.country && COUNTRIES.some((c) => c.code === d.country)) {
          setCountry(d.country);
        }
      })
      .catch(() => {});
  }, []);

  // T09 — Persist form data on every change (excluding password)
  useEffect(() => {
    if (!firstName && !lastName && !dob && !sex && !email && !phone) return;
    sessionForm.setInscription({
      firstName,
      lastName,
      dob,
      sex,
      email,
      phone,
      countryCode: country,
    });
    // T22 — persist first name for dashboard greeting
    if (firstName) sessionForm.setFirstName(firstName);
  }, [firstName, lastName, dob, sex, email, phone, country]);

  // T15 — CAPTCHA block countdown
  useEffect(() => {
    if (captchaBlockedSeconds <= 0) return;
    const id = setTimeout(() => setCaptchaBlockedSeconds((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [captchaBlockedSeconds]);

  // Age validation (R1 — §4.1.4)
  const age = useMemo(() => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  }, [dob]);
  const ageError = age !== null && age < 18 ? t("inscription.form.ageError") : null;

  // T03/Password rules — use shared util
  const pwdRules = useMemo(() => evaluatePassword(password), [password]);
  const pwdScore = useMemo(() => scorePassword(pwdRules), [pwdRules]);
  const pwdStrength = useMemo(() => {
    if (pwdScore <= 2)
      return { label: t("inscription.form.pwdWeak"), color: "bg-red-500", text: "text-red-600" };
    if (pwdScore === 3)
      return {
        label: t("inscription.form.pwdFair"),
        color: "bg-amber-500",
        text: "text-amber-600",
      };
    if (pwdScore <= 5)
      return {
        label: t("inscription.form.pwdStrong"),
        color: "bg-emerald-500",
        text: "text-emerald-600",
      };
    return {
      label: t("inscription.form.pwdVeryStrong"),
      color: "bg-emerald-600",
      text: "text-emerald-700",
    };
  }, [pwdScore, t]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // T10 — Per-country phone validation; empty country always invalid
  const phoneValid = country !== "" && validatePhone(phone, country);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  // T15 — Simulate CAPTCHA failure
  const handleCaptchaFailure = () => {
    const next = captchaFailures + 1;
    setCaptchaFailures(next);
    if (next >= 3) {
      setCaptchaBlockedSeconds(15 * 60);
    }
  };

  const handleSubmitForm = () => {
    setGlobalError(null);
    if (captchaBlockedSeconds > 0) return;
    const countryOk =
      country !== "" && (country !== "OTHER" || /^\+\d{1,4}$/.test(customDial.trim()));
    const ok =
      firstName &&
      lastName &&
      dob &&
      !ageError &&
      sex &&
      emailValid &&
      phoneValid &&
      countryOk &&
      pwdScore === 6 &&
      cgu &&
      rgpd;
    if (!ok) {
      setGlobalError(t("inscription.form.errorRequired"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProfileCountry(country === "OTHER" ? "" : country);
      setStep("smsOtp");
    }, 700);
  };

  const handleBackToForm = () => {
    setStep("form");
    // T09 — form data is preserved via sessionStorage, no reset needed
  };

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
            search={{ audience: "patient" }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("inscription.form.signIn")} →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:py-14">
        <div>
          <Stepper step={step} onStepClick={(s) => setStep(s)} />

          {step === "form" && (
            <FormStep
              {...{
                firstName,
                setFirstName,
                lastName,
                setLastName,
                dob,
                setDob,
                sex,
                setSex,
                email,
                setEmail,
                country,
                setCountry,
                customDial,
                setCustomDial,
                phone,
                setPhone,
                password,
                setPassword,
                showPwd,
                setShowPwd,
                cgu,
                setCgu,
                rgpd,
                setRgpd,
                pwdRules,
                pwdScore,
                pwdStrength,
                selectedCountry,
                emailValid,
                phoneValid,
                ageError,
                globalError,
                loading,
                onSubmit: handleSubmitForm,
                locale,
                restoredBanner,
                onDismissRestored: () => setRestoredBanner(false),
                captchaFailures,
                captchaBlockedSeconds,
                onCaptchaFailure: handleCaptchaFailure,
              }}
            />
          )}

          {step === "smsOtp" && (
            <SmsOtpStep
              country={{ dial: country === "OTHER" ? customDial : (selectedCountry?.dial ?? "") }}
              phone={phone}
              onVerified={() => setStep("baseProfile")}
              onEdit={handleBackToForm}
              onRestart={() => {
                setStep("form");
                setFirstName("");
                setLastName("");
                setDob("");
                setSex("");
                setEmail("");
                setPhone("");
                setPassword("");
                setCgu(false);
                setRgpd(false);
                sessionForm.clearInscription();
              }}
            />
          )}

          {step === "baseProfile" && (
            <BaseProfileStep
              country={profileCountry}
              setCountry={setProfileCountry}
              city={city}
              setCity={setCity}
              language={language}
              setLanguage={setLanguage}
              address={address}
              setAddress={setAddress}
              onSubmit={() => {
                sessionForm.clearInscription();
                navigate({ to: "/$locale/espace-patient", params: { locale } });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── STEPPER ───────────────────────────────────────────────────────────── */
function Stepper({ step, onStepClick }: { step: Step; onStepClick?: (s: Step) => void }) {
  const { t } = useTranslation();
  const stepLabels: Record<string, string> = {
    form: t("inscription.steps.form"),
    smsOtp: t("inscription.steps.sms"),
    baseProfile: t("inscription.steps.profile"),
  };
  const currentIdx = STEP_IDS.indexOf(step);
  const progressPct = ((currentIdx + 1) / STEP_IDS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          {t("inscription.steps.stepLabel", {
            defaultValue: "Étape",
          })}{" "}
          <span className="text-foreground">{currentIdx + 1}</span> / {STEP_IDS.length}
        </span>
        <span className="text-foreground">{stepLabels[step]}</span>
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
          const clickable = done && onStepClick;
          return (
            <button
              key={id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick!(id)}
              className={cn(
                "flex items-center gap-2 rounded-full transition-all",
                clickable && "cursor-pointer hover:scale-105",
                !clickable && "cursor-default",
              )}
            >
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-all ring-offset-2",
                  done && "bg-emerald-500 text-white",
                  active && "bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-md)]",
                  !done && !active && "bg-muted text-muted-foreground",
                  clickable && "hover:ring-2 hover:ring-emerald-400/60",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline transition-colors",
                  done || active ? "text-foreground" : "text-muted-foreground",
                  clickable && "hover:text-emerald-600",
                )}
              >
                {stepLabels[id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── STEP 1 — FORM (§4.1) ──────────────────────────────────────────────── */
function FormStep(p: {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  sex: string;
  setSex: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  customDial: string;
  setCustomDial: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPwd: boolean;
  setShowPwd: (v: boolean) => void;
  cgu: boolean;
  setCgu: (v: boolean) => void;
  rgpd: boolean;
  setRgpd: (v: boolean) => void;
  pwdRules: PwdRules;
  pwdScore: number;
  pwdStrength: { label: string; color: string; text: string };
  selectedCountry: { code: string; name: string; dial: string; flag: string } | undefined;
  emailValid: boolean;
  phoneValid: boolean;
  ageError: string | null;
  globalError: string | null;
  loading: boolean;
  onSubmit: () => void;
  locale: Locale;
  restoredBanner: boolean;
  onDismissRestored: () => void;
  captchaFailures: number;
  captchaBlockedSeconds: number;
  onCaptchaFailure: () => void;
}) {
  const { t } = useTranslation();
  const blocked = p.captchaBlockedSeconds > 0;
  const mm = String(Math.floor(p.captchaBlockedSeconds / 60)).padStart(2, "0");
  const ss = String(p.captchaBlockedSeconds % 60).padStart(2, "0");

  return (
    <div className="glass rounded-3xl p-6 sm:p-9">

      {/* T20 — Restored data banner */}
      {p.restoredBanner && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-300/60 bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/40">
          <Info className="mt-0.5 h-4 w-4 flex-none" />
          <p className="flex-1">{t("inscription.profile.restoredBanner")}</p>
          <button onClick={p.onDismissRestored} className="text-blue-600 hover:text-blue-800">
            ×
          </button>
        </div>
      )}

      {p.globalError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/40">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>{p.globalError}</p>
        </div>
      )}

      {/* T15 — CAPTCHA blocked banner */}
      {blocked && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>{t("inscription.form.captchaBlockedMsg", { time: `${mm}:${ss}` })}</p>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label={t("inscription.form.firstName")}>
          <Input
            placeholder="Ex : Aïssatou"
            value={p.firstName}
            onChange={(e) => p.setFirstName(e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label={t("inscription.form.lastName")}>
          <Input
            placeholder="Ex : Diop"
            value={p.lastName}
            onChange={(e) => p.setLastName(e.target.value)}
            maxLength={80}
          />
        </Field>

        <Field label={t("inscription.form.dob")} error={p.ageError ?? undefined}>
          <Input type="date" value={p.dob} onChange={(e) => p.setDob(e.target.value)} />
        </Field>
        <Field label={t("inscription.form.sex")}>
          <Select value={p.sex} onValueChange={p.setSex}>
            <SelectTrigger>
              <SelectValue placeholder={t("inscription.form.sexPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">{t("inscription.form.sexF")}</SelectItem>
              <SelectItem value="M">{t("inscription.form.sexM")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field
            label={t("inscription.form.email")}
            error={p.email && !p.emailValid ? t("inscription.form.emailError") : undefined}
          >
            <Input
              type="email"
              placeholder="Ex : aissatou.diop@example.com"
              value={p.email}
              onChange={(e) => p.setEmail(e.target.value)}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-sm font-medium">{t("inscription.form.phone")}</Label>
          <div className="mt-1.5 flex gap-2">
            <Select
              value={p.country}
              onValueChange={(v) => {
                p.setCountry(v);
                p.setCustomDial("");
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("inscription.form.sexPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code === "OTHER"
                      ? t("inscription.form.phoneCountryOther")
                      : `${c.flag} ${c.dial}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="flex-1"
              placeholder="Ex : 77 123 45 67"
              value={p.phone}
              onChange={(e) => p.setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
              inputMode="numeric"
            />
          </div>
          {p.phone && !p.phoneValid && (
            <p className="mt-1.5 text-xs text-red-600">{t("inscription.form.phoneError")}</p>
          )}
          {p.country === "OTHER" && (
            <div className="mt-2 space-y-1.5">
              <Label className="text-sm font-medium">
                {t("inscription.form.phoneOtherDialLabel")}
              </Label>
              <Input
                placeholder={t("inscription.form.phoneOtherDialPlaceholder")}
                value={p.customDial}
                onChange={(e) => p.setCustomDial(e.target.value)}
                className="w-32"
              />
              <p className="flex items-start gap-1.5 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-3 w-3 flex-none" />
                {t("inscription.form.phoneOtherWarning")}
              </p>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label className="text-sm font-medium">{t("inscription.form.password")}</Label>
          <div className="relative mt-1.5">
            <Input
              type={p.showPwd ? "text" : "password"}
              placeholder="••••••••••••"
              value={p.password}
              onChange={(e) => p.setPassword(e.target.value)}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => p.setShowPwd(!p.showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={p.showPwd ? t("inscription.form.hidePwd") : t("inscription.form.showPwd")}
            >
              {p.showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${p.pwdStrength.color}`}
                  style={{ width: `${(p.pwdScore / 6) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${p.pwdStrength.text}`}>
                {p.password ? p.pwdStrength.label : ""}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Rule ok={p.pwdRules.length}>{t("inscription.form.pwdLength")}</Rule>
              <Rule ok={p.pwdRules.upper}>{t("inscription.form.pwdUpper")}</Rule>
              <Rule ok={p.pwdRules.lower}>{t("inscription.form.pwdLower")}</Rule>
              <Rule ok={p.pwdRules.digit}>{t("inscription.form.pwdDigit")}</Rule>
              <Rule ok={p.pwdRules.special}>{t("inscription.form.pwdSpecial")}</Rule>
              <Rule ok={p.pwdRules.noSpace}>{t("inscription.form.pwdNoSpace")}</Rule>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={p.cgu}
            onCheckedChange={(v) => p.setCgu(Boolean(v))}
            className="mt-0.5"
          />
          <span>
            {t("inscription.form.cguAccept")}{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener"
              className="font-medium text-primary underline"
            >
              {t("inscription.form.cguLink")}
            </a>
            {t("inscription.form.cguSuffix")}
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={p.rgpd}
            onCheckedChange={(v) => p.setRgpd(Boolean(v))}
            className="mt-0.5"
          />
          <span>
            {t("inscription.form.rgpdAccept")}{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener"
              className="font-medium text-primary underline"
            >
              {t("inscription.form.rgpdLink")}
            </a>{" "}
            {t("inscription.form.rgpdSuffix")}
          </span>
        </label>
      </div>

      <Button
        className="mt-7 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.01] hover:opacity-95"
        onClick={p.onSubmit}
        disabled={p.loading || blocked}
      >
        {p.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {t("inscription.form.submit")}
      </Button>

      {/* T15 — Dev-only CAPTCHA simulation button */}
      {blocked && (
        <button
          onClick={p.onCaptchaFailure}
          className="mt-2 block w-full text-center text-xs text-muted-foreground/60 hover:text-red-500"
        >
          {t("inscription.form.devSimulateCaptcha")} ({p.captchaFailures}/3)
        </button>
      )}


      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("inscription.form.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("inscription.form.alreadyAccount")}{" "}
        <Link
          to="/$locale/login"
          params={{ locale: p.locale }}
          search={{ audience: "patient" }}
          className="font-semibold text-primary hover:underline"
        >
          {t("inscription.form.signIn")}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        👤 {t("inscription.form.isPro")}{" "}
        <Link
          to="/$locale/signup"
          params={{ locale: p.locale }}
          className="font-semibold text-primary hover:underline"
        >
          {t("inscription.form.proSignup")}
        </Link>
      </p>
    </div>
  );
}

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

/* ─── STEP 2 — SMS OTP (§4.2.1) ─────────────────────────────────────────── */
const SMS_VALID_CODE = "123456";

function SmsOtpStep({
  country,
  phone,
  onVerified,
  onEdit,
  onRestart,
}: {
  country: { dial: string };
  phone: string;
  onVerified: () => void;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [tooMany, setTooMany] = useState(false);
  // T02 — 60 s cooldown (was 42)
  const [cooldown, setCooldown] = useState(60);
  // T08 — resend rate limit
  const [resendCount, setResendCount] = useState(0);
  // T07 — 5-min expiry countdown
  const [expiry, setExpiry] = useState(300);
  const [expired, setExpired] = useState(false);

  const code = digits.join("");
  const masked = maskLocalPhone(phone);

  // T07 — expiry countdown
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

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const expiryMm = String(Math.floor(expiry / 60)).padStart(2, "0");
  const expirySs = String(expiry % 60).padStart(2, "0");

  // T24 — paste handler
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
    document.getElementById(`otp-sms-${last}`)?.focus();
  };

  const handleVerify = () => {
    setError(null);
    if (code.length < 6 || expired) return;
    if (code === SMS_VALID_CODE) {
      onVerified();
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setTooMany(true);
      setError(t("inscription.sms.tooManyAttempts"));
      setTimeout(() => onRestart(), 2000);
    } else {
      setError(t("inscription.sms.errorAttempts").replace("{count}", String(3 - newAttempts)));
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
          <Smartphone className="h-7 w-7" />
        </div>
      </div>
      <h2 className="text-center text-2xl font-bold">{t("inscription.sms.title")}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("inscription.sms.subtitle")}
        <br />
        <span className="font-semibold text-foreground">
          {country.dial} {masked}
        </span>
      </p>

      {/* T07 — expiry display */}
      <div className="mt-4 text-center text-sm">
        {expired ? (
          <p className="text-red-600">{t("inscription.sms.expiredMessage")}</p>
        ) : (
          <p className="text-muted-foreground">
            {t("inscription.sms.validFor").replace("{time}", `${expiryMm}:${expirySs}`)}
          </p>
        )}
      </div>
      <div className="flex justify-center text-muted-foreground text-xs">{SMS_VALID_CODE}</div>
      <div className="mt-5 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-sms-${i}`}
            value={d}
            disabled={tooMany || (expired && !tooMany)}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...digits];
              next[i] = v;
              setDigits(next);
              if (v && i < 5)
                (document.getElementById(`otp-sms-${i + 1}`) as HTMLInputElement)?.focus();
            }}
            onPaste={i === 0 ? handlePaste : undefined}
            className="h-14 w-12 rounded-2xl border-2 border-input bg-background/70 text-center text-xl font-bold shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
            inputMode="numeric"
            maxLength={1}
          />
        ))}
      </div>
      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      {/* T08 — resend controls */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {resendCount >= 5 ? (
          <span className="text-red-600">{t("inscription.sms.resendLimitReached")}</span>
        ) : (expired && !tooMany) || cooldown <= 0 ? (
          <>
            {t("inscription.sms.notReceived")}{" "}
            <button onClick={handleResend} className="font-semibold text-primary hover:underline">
              {t("inscription.sms.resend")}
            </button>
          </>
        ) : (
          <>
            {t("inscription.sms.notReceived")}{" "}
            <span>
              {t("inscription.sms.resendTimer")}{" "}
              {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
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
        {t("inscription.sms.verify")} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <button
        onClick={onEdit}
        className="mt-4 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("inscription.sms.edit")}
      </button>
    </div>
  );
}

/* ─── STEP 3 — BASE PROFILE (§4.3) ──────────────────────────────────────── */
function BaseProfileStep(p: {
  country: string;
  setCountry: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const [err, setErr] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState("");
  const cities = CITIES_BY_COUNTRY[p.country] ?? [];

  const submit = () => {
    setErr(null);
    const effectiveCity = p.city === "Autre" ? customCity : p.city;
    if (!p.country || !effectiveCity || !p.language) {
      setErr(t("inscription.profile.errorRequired"));
      return;
    }
    // T16 — persist profile to sessionStorage for dashboard completion %
    sessionForm.setProfile({
      address: p.address,
      postalCode: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
    });
    p.onSubmit();
  };

  return (
    <div className="glass rounded-3xl p-8">
      <div className="mb-4 flex justify-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <Globe className="h-7 w-7" />
        </div>
      </div>
      <h2 className="text-center text-2xl font-bold">{t("inscription.profile.title")}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("inscription.profile.subtitle")}
      </p>

      {err && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" /> {err}
        </div>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={t("inscription.profile.country")}>
          <Select
            value={p.country}
            onValueChange={(v) => {
              p.setCountry(v);
              p.setCity("");
              setCustomCity("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("inscription.profile.cityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.filter((c) => c.code !== "OTHER").map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("inscription.profile.countryHint")}
          </p>
        </Field>

        <div>
          <Field label={t("inscription.profile.city")}>
            <Select value={p.city} onValueChange={p.setCity}>
              <SelectTrigger>
                <SelectValue placeholder={t("inscription.profile.cityPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {/* T11 — free-text input when "Autre" is selected */}
          {p.city === "Autre" && (
            <Input
              className="mt-2"
              placeholder={t("inscription.profile.cityOther")}
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
            />
          )}
        </div>

        <div className="sm:col-span-2">
          <Field label={t("inscription.profile.language")}>
            <Select value={p.language} onValueChange={p.setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">{t("inscription.profile.langFr")}</SelectItem>
                <SelectItem value="en">{t("inscription.profile.langEn")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label={t("inscription.profile.address")}>
            <textarea
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder={t("inscription.profile.addressPlaceholder")}
              value={p.address}
              onChange={(e) => p.setAddress(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <Button
        onClick={submit}
        className="mt-7 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.01] hover:opacity-95"
      >
        {t("inscription.profile.submit")} <Check className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
