// TODO Sprint 3-4 — Wire to API. Per §4.5 / §4.7 (3-level edit rights).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IdCard, MapPin, HeartPulse, Bell, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sessionForm } from "@/lib/session-form";

export const Route = createFileRoute("/$locale/espace-patient/profil")({
  head: () => ({ meta: [{ title: "Mon profil — FUENI" }] }),
  component: Profil,
});

const COUNTRIES = [
  "🇸🇳 Sénégal",
  "🇨🇮 Côte d'Ivoire",
  "🇲🇱 Mali",
  "🇧🇯 Bénin",
  "🇹🇬 Togo",
  "🇧🇫 Burkina Faso",
  "🇳🇪 Niger",
  "🇨🇲 Cameroun",
  "🇨🇩 RDC",
];

type LocData = {
  country: string;
  region: string;
  city: string;
  accountLang: string;
  spokenLangs: string;
  address: string;
};

type EmergData = {
  name: string;
  relation: string;
  phone: string;
};

function Profil() {
  const { t } = useTranslation();

  const [loc, setLoc] = useState<LocData>({
    country: "🇸🇳 Sénégal",
    region: "Dakar",
    city: "Dakar",
    accountLang: "Français",
    spokenLangs: "Français",
    address: "",
  });
  const [emerg, setEmerg] = useState<EmergData>({ name: "", relation: "", phone: "" });
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  const incomplete = !loc.address || !emerg.name || !emerg.phone;

  const relations = [
    { value: "spouse", label: t("profil.fields.relationSpouse") },
    { value: "child", label: t("profil.fields.relationChild") },
    { value: "parent", label: t("profil.fields.relationParent") },
    { value: "friend", label: t("profil.fields.relationFriend") },
    { value: "other", label: t("profil.fields.relationOther") },
  ];
  const relationLabel =
    relations.find((r) => r.value === emerg.relation)?.label ?? t("profil.v2.notProvided");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("profil.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("profil.subtitle", "Consultez et mettez à jour vos informations personnelles.")}
        </p>
      </header>

      {incomplete && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal/30 bg-teal-soft px-5 py-4">
          <Info className="h-5 w-5 flex-none text-teal" />
          <span className="text-sm font-medium text-teal-soft-foreground">{t("profil.v2.banner")}</span>
        </div>
      )}

      {/* 1 — Identité (lecture seule) */}
      <Section
        Icon={IdCard}
        title={t("profil.v2.secIdentity")}
        badge="support"
        note={t("profil.v2.identityNote")}
      >
        <ReadRow label={t("profil.fields.firstName")} value="Aïssatou" first />
        <ReadRow label={t("profil.fields.lastName")} value="Diop" />
        <ReadRow label={t("profil.fields.dob")} value="02/05/1990" />
        <ReadRow label={t("profil.fields.sex")} value={t("profil.fields.sexFemale")} />
      </Section>

      {/* 2 — Localisation & langue */}
      <EditableSection
        Icon={MapPin}
        title={t("profil.v2.secLocation")}
        data={loc}
        onSave={(next) => {
          setLoc(next);
          sessionForm.setProfile({ address: next.address });
        }}
        render={(draft, editing, set) => (
          <>
            <FieldRow label={t("profil.v2.countryService")} first>
              {editing ? (
                <SelectInput
                  value={draft.country}
                  onChange={(v) => set({ country: v })}
                  options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                />
              ) : (
                <Value>{draft.country}</Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.v2.region")}>
              {editing ? (
                <Input value={draft.region} onChange={(e) => set({ region: e.target.value })} />
              ) : (
                <Value>{draft.region}</Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.v2.cityLabel")}>
              {editing ? (
                <Input value={draft.city} onChange={(e) => set({ city: e.target.value })} />
              ) : (
                <Value>{draft.city}</Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.v2.accountLang")}>
              {editing ? (
                <SelectInput
                  value={draft.accountLang}
                  onChange={(v) => set({ accountLang: v })}
                  options={[
                    { value: "Français", label: t("profil.fields.langFr") },
                    { value: "English", label: t("profil.fields.langEn") },
                  ]}
                />
              ) : (
                <Value>{draft.accountLang}</Value>
              )}
            </FieldRow>
            <FieldRow
              label={t("profil.v2.spokenLangs")}
              optional={t("profil.v2.optional")}
              hint={t("profil.v2.spokenHint")}
            >
              {editing ? (
                <Input
                  value={draft.spokenLangs}
                  onChange={(e) => set({ spokenLangs: e.target.value })}
                />
              ) : (
                <Value>{draft.spokenLangs}</Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.fields.address")}>
              {editing ? (
                <Input
                  placeholder={t("profil.v2.addressPh")}
                  value={draft.address}
                  onChange={(e) => set({ address: e.target.value })}
                />
              ) : (
                <Value muted={!draft.address}>
                  {draft.address || t("profil.v2.notProvided")}
                </Value>
              )}
            </FieldRow>
          </>
        )}
      />

      {/* 3 — Contact d'urgence */}
      <EditableSection
        Icon={HeartPulse}
        title={t("profil.v2.secEmergency")}
        optional={t("profil.v2.optional")}
        data={emerg}
        onSave={setEmerg}
        render={(draft, editing, set) => (
          <>
            <FieldRow label={t("profil.fields.emergencyName")} first>
              {editing ? (
                <Input
                  placeholder={t("profil.fields.emergencyNamePlaceholder")}
                  value={draft.name}
                  onChange={(e) => set({ name: e.target.value })}
                />
              ) : (
                <Value muted={!draft.name}>{draft.name || t("profil.v2.notProvided")}</Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.fields.emergencyRelation")}>
              {editing ? (
                <SelectInput
                  value={draft.relation}
                  onChange={(v) => set({ relation: v })}
                  placeholder={t("profil.v2.relationChoose")}
                  options={relations}
                />
              ) : (
                <Value muted={!draft.relation}>
                  {draft.relation ? relationLabel : t("profil.v2.notProvided")}
                </Value>
              )}
            </FieldRow>
            <FieldRow label={t("profil.fields.emergencyPhone")}>
              {editing ? (
                <Input
                  placeholder={t("profil.v2.emergencyPhonePh")}
                  value={draft.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                />
              ) : (
                <Value muted={!draft.phone}>{draft.phone || t("profil.v2.notProvided")}</Value>
              )}
            </FieldRow>
          </>
        )}
      />

      {/* 4 — Préférences de notification */}
      <Section Icon={Bell} title={t("profil.v2.secNotif")} badge="direct" note={t("profil.v2.notifNote")}>
        <ToggleRow label={t("profil.v2.notifSms")} checked={notifSms} onChange={setNotifSms} first />
        <ToggleRow label={t("profil.v2.notifEmail")} checked={notifEmail} onChange={setNotifEmail} />
        {!notifSms && !notifEmail && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-none text-amber-500" />
            {t("profil.v2.notifBothOff")}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────

function Badge({ kind }: { kind: "support" | "direct" }) {
  const { t } = useTranslation();
  return kind === "support" ? (
    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {t("profil.v2.badgeSupport")}
    </span>
  ) : (
    <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-semibold text-teal-soft-foreground">
      {t("profil.v2.badgeDirect")}
    </span>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function Section({
  Icon,
  title,
  badge,
  note,
  optional,
  children,
}: {
  Icon: typeof IdCard;
  title: string;
  badge?: "support" | "direct";
  note?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Icon className="h-5 w-5 text-teal" />
        <h2 className="text-base font-semibold">{title}</h2>
        {badge && <Badge kind={badge} />}
        {optional && <span className="text-xs text-muted-foreground">{optional}</span>}
      </div>
      {note && <p className="mb-3 text-xs text-muted-foreground">{note}</p>}
      <div className={note ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function EditableSection<T extends Record<string, string>>({
  Icon,
  title,
  optional,
  data,
  onSave,
  render,
}: {
  Icon: typeof IdCard;
  title: string;
  optional?: string;
  data: T;
  onSave: (next: T) => void;
  render: (draft: T, editing: boolean, set: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(data);

  const start = () => {
    setDraft(data);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const save = () => {
    onSave(draft);
    setEditing(false);
  };
  const set = (patch: Partial<T>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Icon className="h-5 w-5 text-teal" />
        <h2 className="text-base font-semibold">{title}</h2>
        <Badge kind="direct" />
        {optional && <span className="text-xs text-muted-foreground">{optional}</span>}
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={cancel}>
                {t("profil.v2.cancelBtn")}
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-teal text-teal-foreground hover:bg-teal/90"
                onClick={save}
              >
                {t("profil.v2.saveBtn")}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-teal/40 text-teal hover:bg-teal-soft hover:text-teal-soft-foreground"
              onClick={start}
            >
              {t("profil.v2.edit")}
            </Button>
          )}
        </div>
      </div>
      <div>{render(editing ? draft : data, editing, set)}</div>
    </section>
  );
}

// ── Rows ───────────────────────────────────────────────────────────────────

function rowCls(first?: boolean) {
  return cn(
    "grid grid-cols-1 gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-4",
    !first && "border-t border-border/50",
  );
}

function FieldRow({
  label,
  optional,
  hint,
  first,
  children,
}: {
  label: string;
  optional?: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={rowCls(first)}>
      <div className="text-sm text-muted-foreground">
        {label} {optional && <span className="text-xs text-muted-foreground/70">{optional}</span>}
      </div>
      <div>
        {children}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function ReadRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className={rowCls(first)}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Value({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={cn("text-sm font-semibold", muted ? "italic text-muted-foreground/70" : "text-foreground")}>
      {children}
    </span>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  first,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  first?: boolean;
}) {
  return (
    <label className={cn(rowCls(first), "cursor-pointer sm:grid-cols-[1fr_auto]")}>
      <span className="text-sm text-foreground">{label}</span>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-teal" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
