// TODO Sprint 3-4 — Wire to backend. Per §4.9.2 (OTP reset).
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { evaluatePassword, scorePassword } from "@/lib/password";
import { validatePhone } from "@/lib/phone-rules";
import { PasswordStrength } from "@/components/site/PasswordStrength";

export const Route = createFileRoute("/$locale/mot-de-passe-oublie")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — FUENI" }] }),
  component: ForgotPwd,
});

type S = "id" | "code" | "pwd" | "done";
type Method = "email" | "sms";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRIES = [
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "BJ", dial: "+229", flag: "🇧🇯", name: "Bénin" },
  { code: "TG", dial: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "BF", dial: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "NE", dial: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun" },
  { code: "CD", dial: "+243", flag: "🇨🇩", name: "RDC" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
];

const FORGOT_STEP_IDS: S[] = ["id", "code", "pwd"];

function Stepper({ step }: { step: S }) {
  const { t } = useTranslation();
  const stepLabels: Record<string, string> = {
    id: t("forgotPwd.steps.id"),
    code: t("forgotPwd.steps.code"),
    pwd: t("forgotPwd.steps.pwd"),
  };
  const currentIdx = step === "done" ? FORGOT_STEP_IDS.length - 1 : FORGOT_STEP_IDS.indexOf(step);
  const progressPct = ((currentIdx + 1) / FORGOT_STEP_IDS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          {t("forgotPwd.steps.stepLabel", { defaultValue: "Étape" })}{" "}
          <span className="text-foreground">{currentIdx + 1}</span> / {FORGOT_STEP_IDS.length}
        </span>
        <span className="text-foreground">{stepLabels[step] ?? stepLabels[FORGOT_STEP_IDS[currentIdx]]}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-brand)] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {FORGOT_STEP_IDS.map((id, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-full transition-all cursor-default"
            >
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-all ring-offset-2",
                  done && "bg-emerald-500 text-white",
                  active && "bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-md)]",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline transition-colors",
                  done || active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stepLabels[id]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForgotPwd() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const navigate = useNavigate();

  const [step, setStep] = useState<S>("id");
  const [method, setMethod] = useState<Method>("email");

  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("SN");
  const [phone, setPhone] = useState("");
  const [identError, setIdentError] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendLeft, setResendLeft] = useState(60);
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const pwdRules = useMemo(() => evaluatePassword(pwd), [pwd]);
  const pwdScore = useMemo(() => scorePassword(pwdRules), [pwdRules]);
  const pwdStrength = useMemo(() => {
    if (pwdScore <= 2)
      return { label: t("inscription.form.pwdWeak"), color: "bg-red-500", text: "text-red-600" };
    if (pwdScore === 3)
      return { label: t("inscription.form.pwdFair"), color: "bg-amber-500", text: "text-amber-600" };
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

  useEffect(() => {
    if (step !== "code") return;
    setResendLeft(60);
    const id = setInterval(() => {
      setResendLeft((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(
      () => navigate({ to: "/$locale/login", params: { locale }, search: { audience: "patient" } }),
      1800,
    );
    return () => clearTimeout(t);
  }, [step, locale, navigate]);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleOtpChange = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = c;
    setOtp(next);
    setCodeError(null);
    if (c && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const switchMethod = (m: Method) => {
    setMethod(m);
    setIdentError(false);
  };

  const submitId = () => {
    if (method === "email") {
      if (!EMAIL_RE.test(email.trim())) {
        setIdentError(true);
        return;
      }
    } else {
      if (!validatePhone(phone, country)) {
        setIdentError(true);
        return;
      }
    }
    setIdentError(false);
    setStep("code");
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code !== "123456") {
      setCodeError(t("forgotPwd.otp.invalid"));
      return;
    }
    setStep("pwd");
  };

  const targetMasked = useMemo(() => {
    if (method === "email") {
      if (!email) return "";
      const [u, d] = email.split("@");
      const masked = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
      return `${masked}@${d}`;
    }
    const digits = phone.replace(/\D/g, "");
    const masked = digits.slice(0, -2).replace(/\d/g, "•") + digits.slice(-2);
    return `${selectedCountry?.dial ?? ""} ${masked}`;
  }, [method, email, phone, selectedCountry]);

  const canSubmitId = method === "email" ? !!email : !!phone;

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-center px-4">
          <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] font-bold text-primary-foreground">
              F
            </div>
            <span className="text-lg font-bold">FUENI</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-14">
        <Link
          to="/$locale/login"
          params={{ locale }}
          search={{ audience: "patient" }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("forgotPwd.backToLogin")}
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-[var(--shadow-card)] backdrop-blur-xl">
          <Stepper step={step} />

          {step === "id" && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("forgotPwd.id.intro")}
              </p>

              {/* Segmented E-mail / Téléphone toggle */}
              <div
                role="tablist"
                aria-label={t("forgotPwd.id.methodAria")}
                className="mb-5 grid grid-cols-2 rounded-full border border-border/60 bg-muted/40 p-1"
              >
                {(["email", "sms"] as Method[]).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    type="button"
                    aria-selected={method === m}
                    onClick={() => switchMethod(m)}
                    className={cn(
                      "h-9 rounded-full text-sm font-semibold transition-colors",
                      method === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "email" ? t("forgotPwd.method.email") : t("forgotPwd.method.phone")}
                  </button>
                ))}
              </div>

              {method === "email" ? (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t("forgotPwd.id.emailLabel")}</Label>
                  <Input
                    type="email"
                    className="h-11"
                    placeholder={t("forgotPwd.id.emailPlaceholder")}
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIdentError(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitId()}
                  />
                  {identError ? (
                    <p className="text-xs text-destructive">{t("forgotPwd.id.emailError")}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("forgotPwd.id.emailHint")}</p>
                  )}
                  <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => switchMethod("sms")}
                      className="text-left hover:text-foreground"
                    >
                      {t("forgotPwd.id.altPhone")}
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t("forgotPwd.id.phoneLabel")}</Label>
                  <div className="flex gap-2">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="h-11 w-[120px]">
                        <SelectValue>
                          {selectedCountry ? (
                            <span className="flex items-center gap-1.5">
                              <span>{selectedCountry.flag}</span>
                              <span className="text-sm">{selectedCountry.dial}</span>
                            </span>
                          ) : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span className="text-sm">{c.dial}</span>
                              <span className="text-xs text-muted-foreground">{c.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      className="h-11 flex-1"
                      placeholder={t("forgotPwd.id.phonePlaceholder")}
                      value={phone}
                      autoComplete="tel"
                      inputMode="numeric"
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                        setIdentError(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitId()}
                    />
                  </div>
                  {identError ? (
                    <p className="text-xs text-destructive">{t("forgotPwd.id.phoneError")}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("forgotPwd.id.phoneHint")}</p>
                  )}
                  <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => switchMethod("email")}
                      className="text-left hover:text-foreground"
                    >
                      {t("forgotPwd.id.altEmail")}
                    </button>
                  </p>
                </div>
              )}

              <Button
                onClick={submitId}
                disabled={!canSubmitId}
                className="mt-5 h-11 w-full rounded-full"
              >
                {t("forgotPwd.email.cta")}
              </Button>
            </>
          )}

          {step === "code" && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("forgotPwd.otp.description")}{" "}
                <span className="font-semibold text-foreground">{targetMasked}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">{t("forgotPwd.otp.demo")}</p>

              <div className="mt-5 flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="h-12 w-10 rounded-xl border border-input bg-background text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    inputMode="numeric"
                    maxLength={1}
                  />
                ))}
              </div>

              {codeError && (
                <p className="mt-3 text-center text-xs text-destructive">{codeError}</p>
              )}

              <p className="mt-3 text-center text-xs text-muted-foreground">
                {resendLeft > 0 ? (
                  <>
                    {t("forgotPwd.otp.resendIn")}{" "}
                    <span className="font-mono">
                      00:{String(resendLeft).padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendLeft(60)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t("forgotPwd.email.cta")}
                  </button>
                )}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {t("forgotPwd.otp.notReceived")}{" "}
                <button
                  type="button"
                  onClick={() => setStep("id")}
                  className="font-semibold text-primary hover:underline"
                >
                  {t("forgotPwd.otp.tryOther")}
                </button>
              </p>

              <Button
                onClick={verifyOtp}
                disabled={otp.join("").length < 6}
                className="mt-5 h-11 w-full rounded-full"
              >
                {t("forgotPwd.otp.cta")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("id")}
                className="mt-2 h-10 w-full rounded-full"
              >
                {t("forgotPwd.otp.back")}
              </Button>
            </>
          )}

          {step === "pwd" && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("forgotPwd.newPwd.description")}
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t("forgotPwd.newPwd.label")}</Label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    className="h-11 pr-11"
                    placeholder="••••••••••••"
                    value={pwd}
                    autoComplete="new-password"
                    maxLength={128}
                    onChange={(e) => setPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPwd ? t("inscription.form.hidePwd") : t("inscription.form.showPwd")
                    }
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength
                  password={pwd}
                  pwdRules={pwdRules}
                  pwdScore={pwdScore}
                  pwdStrength={pwdStrength}
                />
              </div>
              <Button
                onClick={() => setStep("done")}
                disabled={pwdScore < 6}
                className="mt-5 h-11 w-full rounded-full"
              >
                {t("forgotPwd.newPwd.cta")}
              </Button>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Check className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold">{t("forgotPwd.done.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("forgotPwd.done.description")}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-border/60 pt-4 text-center">
            <Link
              to="/$locale/login"
              params={{ locale }}
              search={{ audience: "patient" }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              ← {t("forgotPwd.backToLogin")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
