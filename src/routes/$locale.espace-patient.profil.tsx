// TODO Sprint 3-4 — Wire to API. Per §4.5 / §4.7 (3-level edit rights).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Info, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sessionForm } from "@/lib/session-form";
import { OtpVerificationModal } from "@/components/site/OtpVerificationModal";

export const Route = createFileRoute("/$locale/espace-patient/profil")({
  head: () => ({ meta: [{ title: "Mon profil — FUENI" }] }),
  component: Profil,
});

const PROFILE_COUNTRIES = [
  { code: "SN", label: "🇸🇳 Sénégal" },
  { code: "CI", label: "🇨🇮 Côte d'Ivoire" },
  { code: "ML", label: "🇲🇱 Mali" },
  { code: "BJ", label: "🇧🇯 Bénin" },
  { code: "TG", label: "🇹🇬 Togo" },
  { code: "BF", label: "🇧🇫 Burkina Faso" },
  { code: "NE", label: "🇳🇪 Niger" },
  { code: "CM", label: "🇨🇲 Cameroun" },
  { code: "CD", label: "🇨🇩 RDC" },
];

// T16 — optional fields that count towards completion
const OPTIONAL_FIELDS = [
  "address",
  "postalCode",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
] as const;
type ProfileKey = (typeof OPTIONAL_FIELDS)[number];

function computeCompletion(data: Record<ProfileKey, string>): number {
  const filled = OPTIONAL_FIELDS.filter((f) => !!data[f]).length;
  return Math.round((filled / OPTIONAL_FIELDS.length) * 100);
}

function Profil() {
  const { t } = useTranslation();

  // Editable L1 fields
  const [city, setCity] = useState("Dakar");
  const [address, setAddress] = useState("Sacré-Cœur 3, Villa 12");
  const [postalCode, setPostalCode] = useState("");
  const [language, setLanguage] = useState("fr");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fix #2 — Display values for L2 fields (start as mock, get updated on verified)
  const [displayEmail, setDisplayEmail] = useState("aissatou.diop@example.com");
  const [displayPhone, setDisplayPhone] = useState("+221 77 *** ** 67");
  const [displayCountry, setDisplayCountry] = useState("🇸🇳 Sénégal");

  // Fix #1 — L2 two-step flow: 'input' collects new value, 'otp' verifies it
  const [l2Modal, setL2Modal] = useState<{
    field: "email" | "phone" | "country";
    label: string;
    channel: string;
  } | null>(null);
  const [l2Step, setL2Step] = useState<"input" | "otp">("input");
  const [l2NewValue, setL2NewValue] = useState("");

  // Fix #4 — Reactive completion (recalculates as fields change)
  const completionData: Record<ProfileKey, string> = {
    address,
    postalCode,
    emergencyName,
    emergencyPhone,
    emergencyRelation,
  };
  const completion = computeCompletion(completionData);

  const handleSave = () => {
    sessionForm.setProfile(completionData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const openL2Modal = (field: "email" | "phone" | "country", label: string, channel: string) => {
    setL2NewValue("");
    setL2Step("input");
    setL2Modal({ field, label, channel });
  };

  // Fix #1 — advance from 'input' step to 'otp' step
  const handleL2NewValueSubmit = (value: string) => {
    setL2NewValue(value);
    setL2Step("otp");
  };

  // Fix #2 — on OTP verified, write the new value back to the display state
  const handleL2Verified = () => {
    if (l2Modal?.field === "email") setDisplayEmail(l2NewValue);
    if (l2Modal?.field === "phone") setDisplayPhone(l2NewValue);
    if (l2Modal?.field === "country") {
      const found = PROFILE_COUNTRIES.find((c) => c.code === l2NewValue);
      setDisplayCountry(found?.label ?? l2NewValue);
    }
    setL2Modal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("profil.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profil.subtitle")}</p>
      </header>

      {/* Fix #4 — Profile completion bar */}
      <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">{t("profil.completion", { pct: completion })}</span>
          <span className="text-xs text-muted-foreground">
            {OPTIONAL_FIELDS.filter((f) => !!completionData[f]).length}/{OPTIONAL_FIELDS.length}{" "}
            {t("profil.completionFields")}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="mt-2 text-xs text-muted-foreground">{t("profil.completionHint")}</p>
        )}
      </div>

      {/* Niveau 3 — identité légale (Super Admin) */}
      <Section
        title={t("profil.sections.legalIdentity")}
        level={3}
        hint={t("profil.sections.legalIdentityHint")}
      >
        <ReadField label={t("profil.fields.firstName")} value="Aïssatou" />
        <ReadField label={t("profil.fields.lastName")} value="Diop" />
        <ReadField label={t("profil.fields.dob")} value="14/03/1992" />
        <ReadField label={t("profil.fields.sex")} value={t("profil.fields.sexFemale")} />
      </Section>

      {/* Niveau 2 — canaux (OTP) */}
      <Section
        title={t("profil.sections.loginIds")}
        level={2}
        hint={t("profil.sections.loginIdsHint")}
      >
        <EditField
          label={t("profil.fields.email")}
          value={displayEmail}
          cta={t("profil.fields.emailCta")}
          onEdit={() => openL2Modal("email", t("profil.fields.email"), "e-mail")}
        />
        <EditField
          label={t("profil.fields.phone")}
          value={displayPhone}
          cta={t("profil.fields.phoneCta")}
          onEdit={() => openL2Modal("phone", t("profil.fields.phone"), "SMS")}
        />
      </Section>

      {/* Niveau 2 — zone de service (OTP e-mail) */}
      <Section
        title={t("profil.sections.location")}
        level={2}
        hint={t("profil.sections.locationHint")}
      >
        <EditField
          label={t("profil.fields.country")}
          value={displayCountry}
          cta={t("profil.fields.countryCta")}
          onEdit={() => openL2Modal("country", t("profil.fields.country"), "e-mail")}
        />
      </Section>

      {/* Niveau 1 — libre */}
      <Section
        title={t("profil.sections.coordinates")}
        level={1}
        hint={t("profil.sections.coordinatesHint")}
      >
        <Field label={t("profil.fields.city")}>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label={t("profil.fields.address")}>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label={t("profil.fields.postalCode")}>
          <Input
            placeholder={t("profil.fields.postalCodePlaceholder")}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </Field>
        <Field label={t("profil.fields.language")}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">{t("profil.fields.langFr")}</option>
            <option value="en">{t("profil.fields.langEn")}</option>
          </select>
        </Field>
      </Section>

      {/* T01 — emergency contact */}
      <Section title={t("profil.sections.emergencyContact")} level={1} hint="">
        <Field label={t("profil.fields.emergencyName")}>
          <Input
            placeholder={t("profil.fields.emergencyNamePlaceholder")}
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </Field>
        <Field label={t("profil.fields.emergencyRelation")}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={emergencyRelation}
            onChange={(e) => setEmergencyRelation(e.target.value)}
          >
            <option value="">{t("inscription.form.sexPlaceholder")}</option>
            <option value="spouse">{t("profil.fields.relationSpouse")}</option>
            <option value="child">{t("profil.fields.relationChild")}</option>
            <option value="parent">{t("profil.fields.relationParent")}</option>
            <option value="friend">{t("profil.fields.relationFriend")}</option>
            <option value="other">{t("profil.fields.relationOther")}</option>
          </select>
        </Field>
        <Field label={t("profil.fields.emergencyPhone")}>
          <Input
            placeholder="+221 …"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />
        </Field>
      </Section>

      <Section title={t("profil.sections.notifications")} level={1} hint="">
        <Toggle label={t("profil.fields.notifSms")} checked={notifSms} onChange={setNotifSms} />
        <Toggle
          label={t("profil.fields.notifEmail")}
          checked={notifEmail}
          onChange={setNotifEmail}
        />
      </Section>

      <div className="flex items-center justify-end gap-4">
        {saveSuccess && <span className="text-sm text-emerald-600">{t("profil.saveSuccess")}</span>}
        <Button className="rounded-full" onClick={handleSave}>
          {t("profil.save")}
        </Button>
      </div>

      {/* Fix #1 — Step 1: collect new email/phone value */}
      {l2Modal && l2Step === "input" && (
        <NewValueModal
          field={l2Modal.field}
          label={l2Modal.label}
          onSubmit={handleL2NewValueSubmit}
          onClose={() => setL2Modal(null)}
        />
      )}

      {/* Fix #1 & #2 — Step 2: OTP verification on the new channel */}
      {l2Modal && l2Step === "otp" && (
        <OtpVerificationModal
          title={t("profil.l2Modal.otpTitle", { label: l2Modal.label })}
          description={t("profil.l2Modal.otpDesc", {
            channel: l2Modal.channel,
            value: l2Modal.field === "country" ? displayEmail : l2NewValue,
          })}
          validCode="111111"
          resendCooldownSeconds={60}
          onVerified={handleL2Verified}
          onClose={() => setL2Modal(null)}
          showDevHint
        />
      )}
    </div>
  );
}

// ── Fix #1: New value input modal ──────────────────────────────────────────

function NewValueModal({
  field,
  label,
  onSubmit,
  onClose,
}: {
  field: "email" | "phone" | "country";
  label: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t("profil.l2Modal.required"));
      return;
    }
    if (field === "email" && !trimmed.includes("@")) {
      setError(t("profil.l2Modal.emailInvalid"));
      return;
    }
    if (field === "phone" && !/^\+?\d{6,}$/.test(trimmed.replace(/[\s.-]/g, ""))) {
      setError(t("profil.l2Modal.phoneInvalid"));
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-7 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t("profil.l2Modal.title", { label })}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profil.l2Modal.desc", { label: label.toLowerCase() })}
            </p>
          </div>
          <button onClick={onClose} className="mt-0.5 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{label}</Label>
          {field === "country" ? (
            <select
              autoFocus
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
            >
              <option value="" />
              {PROFILE_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              autoFocus
              type={field === "email" ? "email" : "tel"}
              placeholder={
                field === "email"
                  ? t("profil.l2Modal.emailPlaceholder")
                  : t("profil.l2Modal.phonePlaceholder")
              }
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && validate()}
            />
          )}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t("profil.l2Modal.otpNote")}</p>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">
            {t("profil.l2Modal.cancel")}
          </Button>
          <Button onClick={validate} className="flex-1 rounded-full">
            {t("profil.l2Modal.sendCode")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Shared layout components ───────────────────────────────────────────────

function Section({
  title,
  level,
  hint,
  children,
}: {
  title: string;
  level: 1 | 2 | 3;
  hint: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const badge =
    level === 1
      ? { label: t("profil.levels.level1"), cls: "bg-emerald-500/10 text-emerald-700" }
      : level === 2
        ? { label: t("profil.levels.level2"), cls: "bg-amber-500/10 text-amber-700" }
        : { label: t("profil.levels.level3"), cls: "bg-red-500/10 text-red-700" };
  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
      {hint && (
        <p className="mb-4 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 flex-none" /> {hint}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5 flex items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
        <span>{value}</span>
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function EditField({
  label,
  value,
  cta,
  onEdit,
}: {
  label: string;
  value: string;
  cta: string;
  onEdit: () => void;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5 flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
        <span>{value}</span>
        <button onClick={onEdit} className="text-xs font-semibold text-primary hover:underline">
          {cta}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative flex items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2.5 text-sm sm:col-span-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 cursor-pointer rounded-full bg-muted transition-all checked:bg-primary"
      />
    </label>
  );
}
