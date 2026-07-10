// TODO Sprint 3-4 — Wire to Keycloak. UI per §4.9.1 (flexible identifier).
import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Shield, Lock, Globe, AlertCircle, ArrowRight, Mail, Phone } from "lucide-react";
import { z } from "zod";
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
import { validatePhone } from "@/lib/phone-rules";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

const searchSchema = z.object({
  audience: z.enum(["patient", "pro"]).optional().default("patient"),
});

export const Route = createFileRoute("/$locale/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Connexion — FUENI" }] }),
  component: LoginPage,
});

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

function LoginPage() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const { audience } = useSearch({ from: "/$locale/login" });
  const navigate = useNavigate();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("SN");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isPro = audience === "pro";
  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const submit = () => {
    setError(null);
    setFieldError(null);
    if (!password) {
      setError(t("login.errorEmpty"));
      return;
    }
    if (method === "email") {
      const v = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setFieldError(t("login.errorFormat"));
        return;
      }
    } else {
      if (!phone || !validatePhone(phone, country)) {
        setFieldError(t("login.errorPhone"));
        return;
      }
    }
    window.location.href = `/${locale}/${isPro ? "espace-pro" : "espace-patient"}`;
  };

  const trustPoints = [
    { icon: Shield, title: t("login.trust1Title"), desc: t("login.trust1Desc") },
    { icon: Lock, title: t("login.trust2Title"), desc: t("login.trust2Desc") },
    { icon: Globe, title: t("login.trust3Title"), desc: t("login.trust3Desc") },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left brand panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[460px] xl:w-[500px] flex-col bg-[image:var(--gradient-brand)] p-10 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-10 bottom-40 h-40 w-40 rounded-full border border-white/10" />

        <Link to="/$locale" params={{ locale }} className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FUENI</span>
        </Link>

        <div className="relative z-10 mt-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
            {t("login.brandTag")}
          </p>
          <h2 className="text-[2rem] font-bold leading-tight">{t("login.brandTagline")}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t("login.brandDesc")}</p>
        </div>

        <div className="relative z-10 mt-auto space-y-6">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-10 border-t border-white/20 pt-6">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <Shield className="h-3.5 w-3.5" />
            <span>{t("login.compliance")}</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-16 max-w-lg items-center justify-center px-4">
            <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-brand)] text-sm font-bold text-white">
                F
              </div>
              <span className="text-base font-bold">FUENI</span>
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                {isPro ? t("login.titlePro") : t("login.formHeading")}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("login.subtitle")}</p>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Method toggle: Email | Phone */}
              <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
                {(["email", "phone"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMethod(m);
                      setFieldError(null);
                    }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      method === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    {t(m === "email" ? "login.methodEmail" : "login.methodPhone")}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {method === "email" ? t("login.methodEmail") : t("login.methodPhone")}
                </Label>

                {method === "email" ? (
                  <Input
                    type="email"
                    className="h-11"
                    placeholder={t("login.identifierPlaceholder")}
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-[120px] h-11">
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
                      placeholder={t("login.phonePlaceholder")}
                      value={phone}
                      autoComplete="tel"
                      inputMode="numeric"
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                        setFieldError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                  </div>
                )}

                {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    {t("login.password")}
                  </Label>
                  <Link
                    to="/$locale/mot-de-passe-oublie"
                    params={{ locale }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("login.forgotPwd")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    className="h-11 pr-11"
                    placeholder="••••••••••••"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t("login.togglePwd")}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={submit}
                className="group h-12 w-full rounded-xl bg-[image:var(--gradient-brand)] text-base font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {t("common.signIn")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("login.noAccount")}{" "}
              <Link
                to="/$locale/inscription"
                params={{ locale }}
                className="font-semibold text-primary hover:underline"
              >
                {t("common.signUp")}
              </Link>
            </p>

            {/* Audience switch — moved out of the main form */}
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
              {isPro ? t("login.patientSwitchPrompt") : t("login.proSwitchPrompt")}{" "}
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/$locale/login",
                    params: { locale },
                    search: { audience: isPro ? "patient" : "pro" },
                  })
                }
                className="font-semibold text-primary hover:underline"
              >
                {isPro ? t("login.patientSwitchLink") : t("login.proSwitchLink")}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <Lock className="h-3 w-3" />
              <span>{t("login.secureNote")}</span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 lg:hidden">
              <Shield className="h-3 w-3" />
              <span>{t("login.compliance")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
