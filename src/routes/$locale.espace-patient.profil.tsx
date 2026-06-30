// TODO Sprint 3-4 — Wire to API. Per §4.5 / §4.7 (3-level edit rights).
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IdCard,
  MapPin,
  HeartPulse,
  Bell,
  Info,
  AlertTriangle,
  ShieldCheck,
  Check,
  Pencil,
  Globe,
  Languages,
  CalendarDays,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";
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

  const hasAddress = Boolean(loc.address);
  const hasEmergency = Boolean(emerg.name) && Boolean(emerg.phone);
  const checks = [hasAddress, hasEmergency];
  const done = checks.filter(Boolean).length;
  const completion = Math.round(((checks.length + done) / (checks.length * 2)) * 100); // identity always done
  const incomplete = done < checks.length;

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
    <div className="max-w-3xl space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-[image:var(--gradient-teal)] p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/25 backdrop-blur">
              AD
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                Aïssatou Diop
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("profil.v2.verified")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t("profil.v2.memberSince", { date: "2024" })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-none">
            <CompletionRing value={completion} />
          </div>
        </div>
      </section>

      {/* Quick glance */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickStat
          Icon={Globe}
          label={t("profil.v2.quickLocation")}
          value={`${loc.city}, ${loc.country.replace(/^\S+\s/, "")}`}
        />
        <QuickStat Icon={Languages} label={t("profil.v2.quickLanguage")} value={loc.accountLang} />
        <QuickStat
          Icon={ShieldCheck}
          label={t("profil.v2.quickAccount")}
          value={t("profil.v2.quickAccountValue")}
        />
      </div>

      {/* Setup checklist */}
      {incomplete && (
        <section className="overflow-hidden rounded-2xl border border-primary/25 bg-[color-mix(in_oklab,var(--primary)_6%,var(--card))] shadow-sm">
          <div className="flex items-start gap-3 border-b border-primary/15 px-5 py-4">
            <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-soft text-teal">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                {t("profil.v2.checklistTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("profil.v2.checklistSubtitle")}</p>
            </div>
            <span className="ml-auto flex-none rounded-full bg-teal-soft px-2.5 py-1 text-xs font-bold text-teal">
              {done}/{checks.length}
            </span>
          </div>
          <ul className="divide-y divide-border/50">
            <ChecklistItem done={hasAddress} label={t("profil.v2.checklistAddress")} targetId="sec-location" />
            <ChecklistItem
              done={hasEmergency}
              label={t("profil.v2.checklistEmergency")}
              targetId="sec-emergency"
            />
          </ul>
        </section>
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
        id="sec-location"
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
        id="sec-emergency"
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

      {/* Footer meta */}
      <p className="flex items-center gap-1.5 pl-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {t("profil.v2.lastUpdated", { date: "30/06/2026" })}
      </p>
    </div>
  );
}

// ── Quick stat ───────────────────────────────────────────────────────────────

function QuickStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof IdCard;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-soft text-teal">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Checklist item ───────────────────────────────────────────────────────────

function ChecklistItem({
  done,
  label,
  targetId,
}: {
  done: boolean;
  label: string;
  targetId: string;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span
        className={cn(
          "flex h-6 w-6 flex-none items-center justify-center rounded-full border transition-colors",
          done
            ? "border-transparent bg-teal text-teal-foreground"
            : "border-dashed border-primary/40 text-transparent",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span
        className={cn(
          "text-sm",
          done ? "text-muted-foreground line-through" : "font-medium text-foreground",
        )}
      >
        {label}
      </span>
      {!done && (
        <a
          href={`#${targetId}`}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-teal/40 px-3 py-1 text-xs font-semibold text-teal transition-colors hover:bg-teal-soft"
        >
          {t("profil.v2.jump")}
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      )}
    </li>
  );
}

// ── Completion ring ──────────────────────────────────────────────────────────

function CompletionRing({ value }: { value: number }) {
  const { t } = useTranslation();
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[88px] w-[88px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {value}%
        </span>
      </div>
      <div className="text-sm">
        <p className="font-semibold">{t("profil.v2.completeness")}</p>
        <p className="text-white/75">
          {value === 100 ? t("profil.v2.complete") : t("profil.v2.almostThere")}
        </p>
      </div>
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────

function Badge({ kind }: { kind: "support" | "direct" }) {
  const { t } = useTranslation();
  return kind === "support" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      <ShieldCheck className="h-3 w-3" />
      {t("profil.v2.badgeSupport")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-1 text-[11px] font-semibold text-teal-soft-foreground">
      <Check className="h-3 w-3" />
      {t("profil.v2.badgeDirect")}
    </span>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function SectionShell({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="group relative scroll-mt-20 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-[image:var(--gradient-teal)] opacity-0 transition-opacity group-hover:opacity-100" />
      {children}
    </section>
  );
}

function IconChip({ Icon }: { Icon: typeof IdCard }) {
  return (
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-soft text-teal">
      <Icon className="h-5 w-5" />
    </span>
  );
}

function Section({
  id,
  Icon,
  title,
  badge,
  note,
  optional,
  children,
}: {
  id?: string;
  Icon: typeof IdCard;
  title: string;
  badge?: "support" | "direct";
  note?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <SectionShell id={id}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <IconChip Icon={Icon} />
        <h2 className="text-base font-semibold">{title}</h2>
        {badge && <Badge kind={badge} />}
        {optional && <span className="text-xs text-muted-foreground">{optional}</span>}
      </div>
      {note && <p className="mb-3 pl-11 text-xs text-muted-foreground">{note}</p>}
      <div className={note ? "" : "mt-3"}>{children}</div>
    </SectionShell>
  );
}

function EditableSection<T extends Record<string, string>>({
  id,
  Icon,
  title,
  optional,
  data,
  onSave,
  render,
}: {
  id?: string;
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
    <SectionShell id={id}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <IconChip Icon={Icon} />
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
              <Pencil className="h-3.5 w-3.5" />
              {t("profil.v2.edit")}
            </Button>
          )}
        </div>
      </div>
      <div>{render(editing ? draft : data, editing, set)}</div>
    </SectionShell>
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
