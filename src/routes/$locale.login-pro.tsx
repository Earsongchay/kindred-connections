// Professional (praticien) login — distinct UI from patient login.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Mail,
  Phone,
  Home,
  UserCheck,
  CalendarCheck,
  ShieldCheck,
  KeyRound,
  Smartphone,
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
import { cn } from "@/lib/utils";
import { validatePhone } from "@/lib/phone-rules";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";

export const Route = createFileRoute("/$locale/login-pro")({
  head: () => ({
    meta: [
      { title: "Connexion praticien — FUENI" },
      { name: "description", content: "Accédez à votre espace praticien FUENI." },
    ],
  }),
  component: LoginProPage,
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

const T = {
  fr: {
    protoBar: "Écran — Connexion praticien",
    backHome: "Accueil",
    brandTitle: "Votre pratique, en ligne.",
    brandDesc:
      "Gérez votre agenda, vos patients et vos consultations depuis un espace sécurisé.",
    trust1T: "Identité vérifiée",
    trust1D: "Profil validé par notre équipe (KYC).",
    trust2T: "Agenda & patients",
    trust2D: "Vos rendez-vous et dossiers au même endroit.",
    trust3T: "Conforme RGPD & HDS",
    trust3D: "Aux plus hauts standards du secteur de la santé.",
    heading: "Bon retour",
    subtitle: "Connectez-vous à votre espace praticien.",
    tabEmail: "E-mail",
    tabPhone: "Téléphone",
    identifier: "Identifiant",
    identifierPh: "vous@exemple.com",
    phonePh: "77 000 00 00",
    password: "Mot de passe",
    forgot: "Mot de passe oublié ?",
    remember: "Rester connecté sur cet appareil",
    submit: "Se connecter",
    noAccount: "Pas encore inscrit comme praticien ?",
    createAccount: "Créer un compte praticien",
    secure: "Connexion chiffrée et sécurisée",
    youArePatient: "Vous êtes un patient ?",
    patientSpace: "Espace patient",
    demoLabel: "Démo",
    demoEmail: "e-mail",
    demoOr: "ou tél",
    demoPwd: "mot de passe",
    phoneNote:
      "Par téléphone → MFA avec message générique (« si vérifié, code envoyé »), sans OTP.",
    errRequired: "Renseignez votre identifiant et votre mot de passe.",
    errEmail: "E-mail invalide.",
    errPhone: "Numéro invalide pour le pays sélectionné.",
    footer: "RGPD · HDS · ISO 27001",
  },
  en: {
    protoBar: "Screen — Practitioner login",
    backHome: "Home",
    brandTitle: "Your practice, online.",
    brandDesc:
      "Manage your calendar, patients and consultations from one secure workspace.",
    trust1T: "Verified identity",
    trust1D: "Profile validated by our team (KYC).",
    trust2T: "Calendar & patients",
    trust2D: "Your appointments and records in one place.",
    trust3T: "GDPR & HDS compliant",
    trust3D: "Built to the highest healthcare standards.",
    heading: "Welcome back",
    subtitle: "Sign in to your practitioner workspace.",
    tabEmail: "Email",
    tabPhone: "Phone",
    identifier: "Identifier",
    identifierPh: "you@example.com",
    phonePh: "77 000 00 00",
    password: "Password",
    forgot: "Forgot password?",
    remember: "Stay signed in on this device",
    submit: "Sign in",
    noAccount: "Not yet registered as a practitioner?",
    createAccount: "Create a practitioner account",
    secure: "Encrypted and secure connection",
    youArePatient: "Are you a patient?",
    patientSpace: "Patient space",
    demoLabel: "Demo",
    demoEmail: "email",
    demoOr: "or phone",
    demoPwd: "password",
    phoneNote:
      "By phone → MFA with generic message (\"if verified, code sent\"), no OTP.",
    errRequired: "Enter your identifier and password.",
    errEmail: "Invalid email.",
    errPhone: "Invalid number for the selected country.",
    footer: "GDPR · HDS · ISO 27001",
  },
} as const;

function LoginProPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = T[locale === "en" ? "en" : "fr"];

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("dr.diallo@fueni.com");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("SN");
  const [password, setPassword] = useState("MotDePasse123!");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const submit = () => {
    setError(null);
    setFieldError(null);
    if (!password) {
      setError(t.errRequired);
      return;
    }
    if (method === "email") {
      const v = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setFieldError(t.errEmail);
        return;
      }
    } else if (!phone || !validatePhone(phone, country)) {
      setFieldError(t.errPhone);
      return;
    }
    window.location.href = `/${locale}/espace-pro`;
  };

  const trust = [
    { Icon: UserCheck, t: t.trust1T, d: t.trust1D },
    { Icon: CalendarCheck, t: t.trust2T, d: t.trust2D },
    { Icon: ShieldCheck, t: t.trust3T, d: t.trust3D },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left dark brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:w-[460px] xl:w-[520px] flex-col bg-[#0d3b46] p-10 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute right-16 bottom-56 h-40 w-40 rounded-full border border-white/10" />

        <Link to="/$locale" params={{ locale }} className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur-sm">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FUENI</span>
        </Link>

        <div className="relative z-10 mt-16">
          <h2 className="text-[2.25rem] font-bold leading-tight">{t.brandTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t.brandDesc}</p>
        </div>

        <div className="relative z-10 mt-auto space-y-5">
          {trust.map(({ Icon, t: title, d }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/95 text-[#0d3b46]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/65">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-10 border-t border-white/15 pt-5 text-xs text-white/45">
          {t.footer}
        </div>
      </aside>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/40 bg-background px-6 py-4 lg:hidden">
          <Link to="/$locale" params={{ locale }} className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d3b46] text-sm font-bold text-white">
              F
            </div>
            <span className="text-base font-bold">FUENI</span>
          </Link>
        </header>

        <div className="relative flex flex-1 items-start justify-center px-6 pt-14 pb-12 sm:pt-20">
          <Link
            to="/$locale"
            params={{ locale }}
            className="absolute right-6 top-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            {t.backHome}
          </Link>

          <div className="w-full max-w-[420px]">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.heading}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>

            {/* Segmented tabs */}
            <div className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/60 p-1">
              {(["email", "phone"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setFieldError(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    method === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  {m === "email" ? t.tabEmail : t.tabPhone}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {error && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">{t.identifier}</Label>
                {method === "email" ? (
                  <Input
                    type="email"
                    className="h-11 rounded-xl"
                    placeholder={t.identifierPh}
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
                      <SelectTrigger className="w-[120px] h-11 rounded-xl">
                        <SelectValue>
                          {selectedCountry && (
                            <span className="flex items-center gap-1.5">
                              <span>{selectedCountry.flag}</span>
                              <span className="text-sm">{selectedCountry.dial}</span>
                            </span>
                          )}
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
                      className="h-11 flex-1 rounded-xl"
                      placeholder={t.phonePh}
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
                  <Label className="text-sm font-semibold text-foreground">{t.password}</Label>
                  <Link
                    to="/$locale/mot-de-passe-oublie"
                    params={{ locale }}
                    className="text-xs font-medium text-[#0d3b46] hover:underline"
                  >
                    {t.forgot}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    className="h-11 rounded-xl pr-11"
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
                    aria-label="toggle"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                {t.remember}
              </label>

              <Button
                onClick={submit}
                className="group h-12 w-full rounded-xl bg-[#0d3b46] text-base font-semibold text-white hover:bg-[#0a2f38]"
              >
                {t.submit}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t.noAccount}{" "}
                <Link
                  to="/$locale/signup"
                  params={{ locale }}
                  className="font-semibold text-[#0d3b46] hover:underline"
                >
                  {t.createAccount}
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <Lock className="h-3 w-3" />
                <span>{t.secure}</span>
              </div>

              <div className="border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                {t.youArePatient}{" "}
                <Link
                  to="/$locale/login"
                  params={{ locale }}
                  className="font-semibold text-[#0d3b46] hover:underline"
                >
                  {t.patientSpace}
                </Link>
              </div>

              <div className="space-y-1.5 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>
                    <strong className="text-foreground">{t.demoLabel}</strong> · {t.demoEmail}{" "}
                    <strong className="text-foreground">dr.diallo@fueni.com</strong> {t.demoOr}{" "}
                    <strong className="text-foreground">770000000</strong> · {t.demoPwd}{" "}
                    <strong className="text-foreground">MotDePasse123!</strong>
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{t.phoneNote}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
