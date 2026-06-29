// TODO Sprint 3-4 — Validate sign-up copy with Nazounki team.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Stethoscope,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
  Lock,
  ShieldCheck,
  Gift,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site/Header";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { fr } from "@/i18n/locales/fr";
import { en } from "@/i18n/locales/en";
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

type Plan = "free" | "solo";
type PayMethod = "card" | "sepa" | "mobile" | "paypal";
type SignupForm = { first: string; last: string; email: string; login: string; phone: string };

function useLocale(): Locale {
  const params = Route.useParams();
  return isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
}

function Stepper({ current }: { current: number }) {
  const { t } = useTranslation();
  const steps = t("signup.steps", { returnObjects: true }) as string[];
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className={cn("flex  items-center", i === 3 ? "" : "flex-1")}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-all ${
                  done
                    ? "bg-emerald-500 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,.6)]"
                    : active
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 rounded bg-muted">
                <div
                  className={`h-full rounded transition-all ${done ? "w-full bg-emerald-500" : "w-0"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SignupPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>("solo");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [payment, setPayment] = useState<PayMethod>("card");
  const [form, setForm] = useState({
    first: "Jean",
    last: "Dupont",
    email: "jean.dupont@medecin.fr",
    login: "jean.dupont",
    phone: "+33 6 12 34 56 78",
  });
  const navigate = useNavigate();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Stepper current={step} />
        <div className="mt-10">
          {step === 0 && (
            <PlanStep
              plan={plan}
              setPlan={setPlan}
              billing={billing}
              setBilling={setBilling}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <AccountStep
              form={form}
              setForm={setForm}
              plan={plan}
              onBack={() => setStep(0)}
              onNext={() => setStep(plan === "free" ? 3 : 2)}
            />
          )}
          {step === 2 && (
            <PaymentStep
              payment={payment}
              setPayment={setPayment}
              billing={billing}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <ConfirmationStep
              form={form}
              plan={plan}
              onHome={() => navigate({ to: "/$locale", params: { locale } })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Step 1 ---------- */
function PlanStep({
  plan,
  setPlan,
  billing,
  setBilling,
  onNext,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
  billing: "monthly" | "yearly";
  setBilling: (b: "monthly" | "yearly") => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const soloPrice = billing === "monthly" ? "15 €" : "150 €";
  const freeFeatures = t("signup.plan.freeFeatures", { returnObjects: true }) as string[];
  const soloFeatures = t("signup.plan.soloFeatures", { returnObjects: true }) as string[];

  return (
    <section>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Stethoscope className="h-3.5 w-3.5" /> {t("signup.plan.tag")}
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("signup.plan.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("signup.plan.subtitle")}</p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full glass p-1.5 text-sm">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
              billing === "monthly" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {t("signup.plan.monthly")}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-colors ${
              billing === "yearly" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {t("signup.plan.yearly")}
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              {t("signup.plan.yearlySave")}
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <PlanCard
          name={t("signup.plan.free")}
          price="0 €"
          period={t("signup.plan.forever")}
          selected={plan === "free"}
          onSelect={() => setPlan("free")}
          features={freeFeatures.map((f, i) => ({
            ok: i < 2 ? true : i < 4 ? "soon" : false,
            t: f,
          }))}
          cta={t("signup.plan.freeCta")}
          selectedLabel={t("signup.plan.selected")}
        />
        <PlanCard
          recommended
          recommendedLabel={t("signup.plan.recommended")}
          name={t("signup.plan.solo")}
          price={soloPrice}
          period={billing === "monthly" ? t("signup.plan.perMonth") : t("signup.plan.perYear")}
          subPrice="≈ 9 839 XOF  ·  ≈ 161 MAD"
          selected={plan === "solo"}
          onSelect={() => setPlan("solo")}
          features={soloFeatures.map((f) => ({ ok: true as const, t: f }))}
          cta={t("signup.plan.soloCta")}
          selectedLabel={t("signup.plan.selected")}
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-8">
        <span className="inline-flex items-center gap-2">
          <Gift className="h-4 w-4 text-emerald-500" /> {t("signup.plan.perk1")}
        </span>
        <span className="inline-flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> {t("signup.plan.perk2")}
        </span>
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={onNext}
          className="h-12 rounded-full bg-[image:var(--gradient-brand)] px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-float)]"
        >
          {t("signup.plan.next")} <ArrowRight className="h-4 w-4" />
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
  features: { ok: boolean | "soon"; t: string }[];
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
      className={`relative flex flex-col rounded-3xl border p-8 text-left transition-all ${
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
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      {subPrice && <p className="mt-2 text-xs text-muted-foreground">{subPrice}</p>}

      <ul className="mt-6 space-y-3 border-t border-border pt-6">
        {features.map((f) => (
          <li key={f.t} className="flex items-start gap-3 text-sm">
            {f.ok === true ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : f.ok === "soon" ? (
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600">
                ?
              </span>
            ) : (
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border" />
            )}
            <span className={f.ok === false ? "text-muted-foreground line-through" : ""}>
              {f.t}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {selected ? selectedLabel : cta}
      </div>
    </button>
  );
}

/* ---------- Step 2 ---------- */
function AccountStep({
  form,
  setForm,
  plan,
  onBack,
  onNext,
}: Readonly<{
  form: SignupForm;
  setForm: (f: SignupForm) => void;
  plan: Plan;
  onBack: () => void;
  onNext: () => void;
}>) {
  const { t } = useTranslation();
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Stethoscope className="h-3.5 w-3.5" /> {t("signup.plan.tag")}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {plan === "free"
              ? t("signup.account.planBadgeFree")
              : t("signup.account.planBadgeSolo")}
          </span>
        </div>

        <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("signup.account.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("signup.account.subtitle")}</p>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("signup.account.personalInfo")}
        </h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            label={t("signup.account.first")}
            v={form.first}
            onChange={(v) => update("first", v)}
          />
          <Field
            label={t("signup.account.last")}
            v={form.last}
            onChange={(v) => update("last", v)}
          />
          <Field
            label={t("signup.account.email")}
            v={form.email}
            onChange={(v) => update("email", v)}
            type="email"
            full
          />
          <Field
            label={t("signup.account.login")}
            v={form.login}
            onChange={(v) => update("login", v)}
            hint={t("signup.account.loginHint")}
          />
          <Field
            label={t("signup.account.phone")}
            v={form.phone}
            onChange={(v) => update("phone", v)}
            hint={t("signup.account.phoneHint")}
          />
          <Field
            label={t("signup.account.password")}
            v=""
            onChange={() => {}}
            type="password"
            placeholder="••••••••"
          />
          <Field
            label={t("signup.account.passwordConfirm")}
            v=""
            onChange={() => {}}
            type="password"
            placeholder="••••••••"
          />
        </div>

        <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-xs text-muted-foreground">
          {t("signup.account.verifyNotice")}
        </div>

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> {t("signup.account.back")}
          </Button>
          <Button
            onClick={onNext}
            className="h-12 rounded-full bg-[image:var(--gradient-brand)] px-8 font-semibold text-primary-foreground shadow-[var(--shadow-float)]"
          >
            {plan === "free" ? t("signup.account.nextFree") : t("signup.account.nextPaid")}{" "}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  v,
  onChange,
  type = "text",
  hint,
  placeholder,
  full,
}: {
  label: string;
  v: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-sm">{label}</Label>
      <Input
        type={type}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 rounded-xl"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------- Step 3 ---------- */
function PaymentStep({
  payment,
  setPayment,
  billing,
  onBack,
  onNext,
}: {
  payment: PayMethod;
  setPayment: (p: PayMethod) => void;
  billing: "monthly" | "yearly";
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const price = billing === "monthly" ? "15 €" : "150 €";
  const period = billing === "monthly" ? t("signup.plan.perMonth") : t("signup.plan.perYear");
  const included = t("signup.payment.includedItems", { returnObjects: true }) as string[];

  const methods: { id: PayMethod; icon: typeof CreditCard; t: string; d: string }[] = [
    { id: "card", icon: CreditCard, t: t("signup.payment.card.t"), d: t("signup.payment.card.d") },
    { id: "sepa", icon: Landmark, t: t("signup.payment.sepa.t"), d: t("signup.payment.sepa.d") },
    {
      id: "mobile",
      icon: Smartphone,
      t: t("signup.payment.mobile.t"),
      d: t("signup.payment.mobile.d"),
    },
    {
      id: "paypal",
      icon: Wallet,
      t: t("signup.payment.paypal.t"),
      d: t("signup.payment.paypal.d"),
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-700">
          <Gift className="h-5 w-5" />
          <p>
            <strong>{t("signup.payment.trial")}</strong> {t("signup.payment.trialDate")}
          </p>
        </div>

        <h3 className="mt-7 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("signup.payment.method")}
        </h3>
        <div className="mt-4 grid gap-3">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = payment === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPayment(m.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{m.t}</span>
                  <span className="text-xs text-muted-foreground">{m.d}</span>
                </span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>

        {payment === "card" && (
          <div className="mt-7">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("signup.payment.cardInfo")}
            </h3>
            <div className="mt-4 grid gap-4">
              <Field label={t("signup.payment.cardHolder")} v="Jean Dupont" onChange={() => {}} />
              <Field
                label={t("signup.payment.cardNumber")}
                v=""
                onChange={() => {}}
                placeholder="1234 5678 9012 3456"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={t("signup.payment.cardExp")}
                  v=""
                  onChange={() => {}}
                  placeholder="MM/AA"
                />
                <Field
                  label={t("signup.payment.cardCvv")}
                  v=""
                  onChange={() => {}}
                  placeholder="123"
                />
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> {t("signup.payment.secureNote")}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> {t("signup.payment.back")}
          </Button>
          <Button
            onClick={onNext}
            className="h-12 rounded-full bg-emerald-500 px-8 font-semibold text-white hover:bg-emerald-600"
          >
            {t("signup.payment.submit")} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-3xl bg-[image:var(--gradient-brand)] p-6 text-primary-foreground shadow-[var(--shadow-float)]">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            {t("signup.payment.summaryPlan")}
          </p>
          <h3 className="mt-1 text-3xl font-extrabold">{t("signup.payment.solo")}</h3>
          <p className="text-sm opacity-80">{t("signup.payment.individual")}</p>

          <div className="mt-6 space-y-2 border-t border-white/20 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="opacity-80">
                {billing === "monthly"
                  ? t("signup.payment.subMonthly")
                  : t("signup.payment.subYearly")}
              </span>
              <span className="font-semibold">
                {price}
                {period}
              </span>
            </div>
            <p className="text-xs opacity-70">{t("signup.payment.convertedPrice")}</p>
            <div className="flex justify-between text-emerald-200">
              <span>{t("signup.payment.trialDiscount")}</span>
              <span>- {price}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-5">
            <span className="text-sm opacity-80">{t("signup.payment.dueToday")}</span>
            <span className="text-3xl font-extrabold">{t("signup.payment.dueAmount")}</span>
          </div>
          <p className="mt-2 text-xs opacity-70">
            {t("signup.payment.nextCharge")} {price}
            {period}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("signup.payment.included")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {included.map((it) => (
              <li key={it} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> {t("signup.payment.secureFoot")}
        </p>
      </aside>
    </section>
  );
}

/* ---------- Step 4 ---------- */
function ConfirmationStep({
  form,
  plan,
  onHome,
}: {
  form: SignupForm;
  plan: Plan;
  onHome: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_15px_40px_-10px_rgba(16,185,129,.6)]">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight">
          {t("signup.confirmation.title")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("signup.confirmation.welcome")} {form.first} {form.last}.<br />
          {plan === "solo" && (
            <>
              {t("signup.confirmation.trialStart")}{" "}
              <strong>{t("signup.confirmation.trialDays")}</strong>{" "}
              {t("signup.confirmation.trialStartEnd")}
            </>
          )}
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl bg-[image:var(--gradient-brand)] p-6 text-left text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {t("signup.confirmation.planSubscribed")}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {plan === "free"
                  ? t("signup.confirmation.planFree")
                  : t("signup.confirmation.planSolo")}
              </p>
              <p className="text-sm opacity-80">{t("signup.confirmation.individual")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {t("signup.confirmation.dueToday")}
              </p>
              <p className="mt-1 text-2xl font-extrabold">{t("signup.confirmation.dueAmount")}</p>
              {plan === "solo" && (
                <p className="text-xs opacity-80">{t("signup.confirmation.nextCharge")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("signup.confirmation.nextSteps")}
          </h3>
          <NextStep
            icon={Check}
            color="emerald"
            title={t("signup.confirmation.s1.t")}
            desc={t("signup.confirmation.s1.d")}
            done
          />
          <NextStep
            icon={ShieldCheck}
            color="amber"
            title={t("signup.confirmation.s2.t")}
            desc={t("signup.confirmation.s2.d")}
          />
          <NextStep
            icon={Lock}
            color="primary"
            title={t("signup.confirmation.s3.t")}
            desc={t("signup.confirmation.s3.d")}
          />
        </div>

        <Button
          onClick={onHome}
          className="mt-8 h-12 w-full rounded-full bg-[image:var(--gradient-brand)] text-base font-semibold text-primary-foreground shadow-[var(--shadow-float)]"
        >
          <Home className="h-4 w-4" /> {t("signup.confirmation.access")}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("signup.confirmation.emailSent")} <strong>{form.email}</strong>
        </p>
        <Link
          to="/$locale"
          params={{ locale }}
          className="mt-4 inline-block text-xs text-muted-foreground underline"
        >
          {t("signup.confirmation.backHome")}
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
  done,
}: {
  icon: LucideIcon;
  color: "emerald" | "amber" | "primary";
  title: string;
  desc: string;
  done?: boolean;
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
      {done && <Check className="h-5 w-5 text-emerald-500" />}
    </div>
  );
}
