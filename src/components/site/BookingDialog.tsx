// TODO Sprint 4 — Submit the booking to the real appointment API.
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  PartyPopper,
  Stethoscope,
  User,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/lib/doctors";

type Mode = "office" | "video";

interface Props {
  doctor: Doctor;
  en: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselected slot when the user clicks a time chip. */
  initialSlot?: { day: string; time: string } | null;
}

interface Draft {
  mode: Mode;
  reason: string;
  priceIndex: number;
  day: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: Draft = {
  mode: "office",
  reason: "",
  priceIndex: 0,
  day: "",
  time: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

export function BookingDialog({ doctor, en, open, onOpenChange, initialSlot }: Props) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setDone(false);
    setSubmitting(false);
    setDraft({
      ...EMPTY,
      reason: en ? doctor.services[0]?.en ?? "" : doctor.services[0]?.fr ?? "",
      day: initialSlot?.day ?? "",
      time: initialSlot?.time ?? "",
    });
  }, [open, initialSlot, doctor, en]);

  const price = doctor.prices[draft.priceIndex];

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(draft.reason);
    if (step === 2) return Boolean(draft.day && draft.time);
    return (
      draft.firstName.trim().length > 1 &&
      draft.lastName.trim().length > 1 &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email) &&
      draft.phone.replace(/[\s-]/g, "").length >= 6
    );
  }, [step, draft]);

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  };

  const steps = en
    ? ["Reason", "Date & time", "Your details"]
    : ["Motif", "Date & heure", "Vos informations"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {/* Header */}
        <div className="bg-[image:var(--gradient-brand)] px-6 py-5 text-primary-foreground">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-bold text-primary-foreground">
              {en ? "Book an appointment" : "Prendre rendez-vous"}
            </DialogTitle>
            <p className="text-sm text-primary-foreground/85">
              {doctor.name} · {en ? doctor.specialty.en : doctor.specialty.fr}
            </p>
          </DialogHeader>
        </div>

        {done ? (
          <SuccessPanel
            en={en}
            doctor={doctor}
            draft={draft}
            price={price?.amount ?? doctor.fee}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            {/* Stepper */}
            <ol className="flex items-center gap-2 border-b border-border px-6 py-4">
              {steps.map((label, i) => {
                const index = i + 1;
                const active = step === index;
                const complete = step > index;
                return (
                  <li key={label} className="flex flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-bold transition-colors",
                        complete
                          ? "bg-primary text-primary-foreground"
                          : active
                            ? "bg-primary/15 text-brand-deep ring-2 ring-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {complete ? <Check className="h-3.5 w-3.5" /> : index}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate text-xs font-semibold sm:block",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                    {index < steps.length && (
                      <span
                        className={cn(
                          "h-px flex-1 rounded-full",
                          complete ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="px-6 py-6">
              {step === 1 && (
                <div className="space-y-6">
                  <Field label={en ? "Consultation type" : "Type de consultation"}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ChoiceCard
                        selected={draft.mode === "office"}
                        onClick={() => set("mode", "office")}
                        Icon={Building2}
                        title={en ? "At the practice" : "Au cabinet"}
                        subtitle={doctor.practices[0]?.name ?? doctor.city}
                      />
                      <ChoiceCard
                        selected={draft.mode === "video"}
                        onClick={() => set("mode", "video")}
                        disabled={!doctor.teleconsultation}
                        Icon={Video}
                        title={en ? "Teleconsultation" : "Téléconsultation"}
                        subtitle={
                          doctor.teleconsultation
                            ? en
                              ? "Secure video call"
                              : "Visio sécurisée"
                            : en
                              ? "Not available"
                              : "Non disponible"
                        }
                      />
                    </div>
                  </Field>

                  <Field label={en ? "Reason for the visit" : "Motif de consultation"}>
                    <div className="flex flex-wrap gap-2">
                      {doctor.services.map((s) => {
                        const value = en ? s.en : s.fr;
                        const selected = draft.reason === value;
                        return (
                          <button
                            key={s.fr}
                            type="button"
                            onClick={() => set("reason", value)}
                            className={cn(
                              "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                              selected
                                ? "border-primary bg-primary/10 text-brand-deep"
                                : "border-border hover:border-primary/50 hover:bg-muted",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label={en ? "Duration & fee" : "Durée & tarif"}>
                    <div className="space-y-2">
                      {doctor.prices.map((p, i) => (
                        <button
                          key={p.label.fr}
                          type="button"
                          onClick={() => set("priceIndex", i)}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                            draft.priceIndex === i
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted",
                          )}
                        >
                          <span>
                            <span className="block text-sm font-semibold">
                              {en ? p.label.en : p.label.fr}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> {p.duration} min
                            </span>
                          </span>
                          <span className="text-sm font-bold">{p.amount}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Field label={en ? "Pick a day" : "Choisissez un jour"}>
                    <div className="flex flex-wrap gap-2">
                      {doctor.slots.map((slot) => {
                        const value = en ? slot.day.en : slot.day.fr;
                        const selected = draft.day === value;
                        return (
                          <button
                            key={slot.day.fr}
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, day: value, time: "" }))}
                            className={cn(
                              "min-w-[7rem] rounded-2xl border px-4 py-3 text-left transition-colors",
                              selected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-muted",
                            )}
                          >
                            <span className="block text-sm font-semibold">{value}</span>
                            <span className="text-xs text-muted-foreground">
                              {slot.times.length} {en ? "slots" : "créneaux"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label={en ? "Available times" : "Créneaux disponibles"}>
                    {draft.day ? (
                      <div className="flex flex-wrap gap-2">
                        {(
                          doctor.slots.find((s) => (en ? s.day.en : s.day.fr) === draft.day)?.times ??
                          []
                        ).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => set("time", time)}
                            className={cn(
                              "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                              draft.time === time
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50 hover:bg-muted",
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                        {en ? "Select a day first." : "Sélectionnez d'abord un jour."}
                      </p>
                    )}
                  </Field>

                  <p className="text-xs text-muted-foreground">
                    {en ? "Local time at the practice" : "Heure locale du lieu"} · {doctor.timezone}
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-first">{en ? "First name" : "Prénom"}</Label>
                      <Input
                        id="bk-first"
                        value={draft.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-last">{en ? "Last name" : "Nom"}</Label>
                      <Input
                        id="bk-last"
                        value={draft.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-email">{en ? "Email" : "E-mail"}</Label>
                      <Input
                        id="bk-email"
                        type="email"
                        value={draft.email}
                        onChange={(e) => set("email", e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-phone">{en ? "Phone" : "Téléphone"}</Label>
                      <Input
                        id="bk-phone"
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        autoComplete="tel"
                        placeholder="+221 77 000 00 00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bk-notes">
                      {en ? "Note for the practitioner (optional)" : "Note pour le praticien (facultatif)"}
                    </Label>
                    <Textarea
                      id="bk-notes"
                      rows={3}
                      value={draft.notes}
                      onChange={(e) => set("notes", e.target.value)}
                    />
                  </div>

                  <Summary
                    en={en}
                    doctor={doctor}
                    draft={draft}
                    price={price?.amount ?? doctor.fee}
                    duration={price?.duration}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  {en ? "Back" : "Retour"}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {en ? "Free cancellation up to 24h before" : "Annulation gratuite jusqu'à 24h avant"}
                </span>
              )}
              <Button
                disabled={!canNext || submitting}
                onClick={() => (step === 3 ? submit() : setStep((s) => s + 1))}
                className="min-w-36 rounded-xl bg-[image:var(--gradient-brand)] font-semibold text-primary-foreground hover:opacity-95"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 3
                  ? en
                    ? "Confirm booking"
                    : "Confirmer le rendez-vous"
                  : en
                    ? "Continue"
                    : "Continuer"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  Icon,
  title,
  subtitle,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: typeof Video;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 flex-none place-items-center rounded-xl",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-brand-deep",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function Summary({
  en,
  doctor,
  draft,
  price,
  duration,
}: {
  en: boolean;
  doctor: Doctor;
  draft: Draft;
  price: string;
  duration?: number;
}) {
  const rows = [
    {
      Icon: Stethoscope,
      label: en ? "Reason" : "Motif",
      value: draft.reason,
    },
    {
      Icon: draft.mode === "video" ? Video : MapPin,
      label: en ? "Where" : "Lieu",
      value:
        draft.mode === "video"
          ? en
            ? "Teleconsultation"
            : "Téléconsultation"
          : (doctor.practices[0]?.address ?? doctor.address),
    },
    {
      Icon: Calendar,
      label: en ? "When" : "Quand",
      value: `${draft.day} · ${draft.time}${duration ? ` (${duration} min)` : ""}`,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-semibold">{en ? "Summary" : "Récapitulatif"}</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3 text-sm">
            <r.Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-deep" />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto text-right font-medium">{r.value}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 border-t border-border pt-2.5 text-sm">
          <User className="h-4 w-4 shrink-0 text-brand-deep" />
          <span className="text-muted-foreground">{en ? "Fee" : "Tarif"}</span>
          <span className="ml-auto font-bold">{price}</span>
        </li>
      </ul>
    </div>
  );
}

function SuccessPanel({
  en,
  doctor,
  draft,
  price,
  onClose,
}: {
  en: boolean;
  doctor: Doctor;
  draft: Draft;
  price: string;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-brand-deep">
        <PartyPopper className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-xl font-bold">
        {en ? "Appointment request sent" : "Demande de rendez-vous envoyée"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {en
          ? `${doctor.name} will confirm your slot shortly. A confirmation was sent to ${draft.email}.`
          : `${doctor.name} confirmera votre créneau sous peu. Une confirmation a été envoyée à ${draft.email}.`}
      </p>

      <div className="mt-6 text-left">
        <Summary en={en} doctor={doctor} draft={draft} price={price} />
      </div>

      <Button
        onClick={onClose}
        className="mt-6 h-11 w-full rounded-xl bg-[image:var(--gradient-brand)] font-semibold text-primary-foreground hover:opacity-95"
      >
        {en ? "Done" : "Terminer"}
      </Button>
    </div>
  );
}
