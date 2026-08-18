// TODO Sprint 3-4 — Wire to booking API. Pure UI prototype per SF « Mes rendez-vous » v1.0.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  Clock,
  Info,
  MapPin,
  MessageSquareText,
  Phone,
  PlusCircle,
  RotateCcw,
  Stethoscope,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  APPOINTMENTS,
  MODIFY_WINDOW_HOURS,
  formatDateTime,
  isWithinModifyWindow,
  buildIcs,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments";

export const Route = createFileRoute("/$locale/espace-patient/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Mes rendez-vous — FUENI" },
      {
        name: "description",
        content:
          "Consultez, reportez ou annulez vos rendez-vous médicaux FUENI et ajoutez-les à votre agenda.",
      },
      { property: "og:title", content: "Mes rendez-vous — FUENI" },
      {
        property: "og:description",
        content: "Gérez vos rendez-vous médicaux : à venir, passés et annulés.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppointmentsPage,
});

type TabId = "upcoming" | "past" | "cancelled";

function AppointmentsPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const en = locale === "en";
  const navigate = useNavigate();

  const [items, setItems] = useState<Appointment[]>(APPOINTMENTS);
  const [tab, setTab] = useState<TabId>("upcoming");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const now = new Date();

  const groups = useMemo(() => {
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const cancelled: Appointment[] = [];
    for (const a of items) {
      if (a.status === "CANCELLED") cancelled.push(a);
      else if (a.status === "COMPLETED" || new Date(a.startsAt) < now) past.push(a);
      else upcoming.push(a);
    }
    upcoming.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    past.sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
    cancelled.sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
    return { upcoming, past, cancelled };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "upcoming", label: en ? "Upcoming" : "À venir", count: groups.upcoming.length },
    { id: "past", label: en ? "Past" : "Passés", count: groups.past.length },
    { id: "cancelled", label: en ? "Cancelled" : "Annulés", count: groups.cancelled.length },
  ];

  const list = groups[tab];
  const active = items.find((a) => a.id === openId) ?? null;

  const statusChip = (a: Appointment) => {
    const s: AppointmentStatus =
      a.status === "CONFIRMED" && new Date(a.startsAt) < now ? "COMPLETED" : a.status;
    const map: Record<AppointmentStatus, { label: string; cls: string }> = {
      CONFIRMED: {
        label: en ? "Confirmed" : "Confirmé",
        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      },
      CANCELLED: {
        label: en ? "Cancelled" : "Annulé",
        cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      },
      COMPLETED: {
        label: en ? "Completed" : "Terminé",
        cls: "bg-muted text-muted-foreground",
      },
    };
    return map[s];
  };

  const downloadIcs = (a: Appointment) => {
    const blob = new Blob([buildIcs(a, en)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fueni-rdv-${a.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reschedule = (a: Appointment) => {
    // MR2 — reopen the booking assistant for the same doctor (reason & location prefilled).
    setOpenId(null);
    void navigate({
      to: "/$locale/medecin/$doctorId",
      params: { locale, doctorId: a.doctorSlug },
      search: { reschedule: a.id },
    });
  };

  const cancel = (id: string) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)));
    setConfirmCancel(null);
    setOpenId(null);
    setTab("cancelled");
  };

  const delayNote = en
    ? `You can change or cancel up to ${MODIFY_WINDOW_HOURS} h before the appointment. After that, contact the doctor.`
    : `Vous pouvez modifier ou annuler jusqu'à ${MODIFY_WINDOW_HOURS} h avant le rendez-vous. Au-delà, contactez le médecin.`;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {en ? "My appointments" : "Mes rendez-vous"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {en
                ? "View your appointments and manage them in a few clicks."
                : "Consultez vos rendez-vous et gérez-les en quelques clics."}
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/$locale/recherche" params={{ locale }} search={{ q: "", city: "", type: "" }}>
              <PlusCircle className="h-4 w-4" /> {en ? "Book an appointment" : "Prendre un RDV"}
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/70 p-1.5 backdrop-blur-xl">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                tab === tb.id
                  ? "bg-[image:var(--gradient-brand)] text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-pressed={tab === tb.id}
            >
              {tb.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                  tab === tb.id ? "bg-white/20" : "bg-muted text-muted-foreground",
                )}
              >
                {tb.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-10 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">
              {tab === "upcoming"
                ? en
                  ? "No upcoming appointment"
                  : "Aucun rendez-vous à venir"
                : tab === "past"
                  ? en
                    ? "No past appointment"
                    : "Aucun rendez-vous passé"
                  : en
                    ? "No cancelled appointment"
                    : "Aucun rendez-vous annulé"}
            </p>
            <Link
              to="/$locale/recherche"
              params={{ locale }}
              search={{ q: "", city: "", type: "" }}
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              {en ? "Book an appointment" : "Prendre un RDV"}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => {
              const chip = statusChip(a);
              const dt = formatDateTime(a.startsAt, a.timezone, en);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(a.id)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 text-left shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
                  >
                    <div className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-primary/10 text-primary">
                      <div className="text-center leading-tight">
                        <div className="text-xl font-bold">{dt.day}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide">
                          {dt.month}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{a.doctorName}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {en ? a.specialtyEn : a.specialtyFr}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {dt.time} · {a.timezoneLabel}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {a.locationName}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        chip.cls,
                      )}
                    >
                      {chip.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Detail drawer */}
        <Sheet open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {active && (
              <DetailBody
                a={active}
                en={en}
                now={now}
                delayNote={delayNote}
                onIcs={() => downloadIcs(active)}
                onReschedule={() => reschedule(active)}
                onCancel={() => setConfirmCancel(active.id)}
                rebookHref={
                  <Link
                    to="/$locale/medecin/$doctorId"
                    params={{ locale, doctorId: active.doctorSlug }}
                    search={{ reschedule: "" }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {en ? "Book again" : "Reprendre rendez-vous"}
                  </Link>
                }
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Cancel confirmation */}
        <AlertDialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {en ? "Cancel this appointment?" : "Annuler ce rendez-vous ?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {en
                  ? "The slot will be released and the doctor notified. This cannot be undone."
                  : "Le créneau sera libéré et le médecin notifié. Cette action est irréversible."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{en ? "Keep it" : "Conserver"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmCancel && cancel(confirmCancel)}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                {en ? "Cancel appointment" : "Annuler le RDV"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function Row({
  Icon,
  label,
  children,
}: {
  Icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 py-3 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

function DetailBody({
  a,
  en,
  now,
  delayNote,
  onIcs,
  onReschedule,
  onCancel,
  rebookHref,
}: {
  a: Appointment;
  en: boolean;
  now: Date;
  delayNote: string;
  onIcs: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  rebookHref: React.ReactNode;
}) {
  const dt = formatDateTime(a.startsAt, a.timezone, en);
  const isUpcoming = a.status === "CONFIRMED" && new Date(a.startsAt) >= now;
  const editable = isUpcoming && isWithinModifyWindow(a.startsAt, now);

  const lockedTip = en
    ? "Less than 2 h before the appointment — contact the doctor."
    : "Moins de 2 h avant le rendez-vous — contactez le médecin.";

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle>{en ? "Appointment details" : "Détail du rendez-vous"}</SheetTitle>
        <SheetDescription>
          {en
            ? "Everything about this appointment and the available actions."
            : "Toutes les informations et les actions disponibles."}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-6">
        <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-1">
          <Row Icon={Stethoscope} label={en ? "Doctor" : "Médecin"}>
            {a.doctorName}
            <div className="text-xs font-normal text-muted-foreground">
              {en ? a.specialtyEn : a.specialtyFr}
            </div>
          </Row>
          <Row Icon={CalendarDays} label={en ? "Date & time" : "Date & heure"}>
            {dt.full}
            <div className="text-xs font-normal text-muted-foreground">
              {en ? "Local time at the location" : "Heure locale du lieu"} · {a.timezoneLabel}
            </div>
          </Row>
          <Row Icon={MapPin} label={en ? "Location" : "Lieu"}>
            {a.locationName}
            <div className="text-xs font-normal text-muted-foreground">{a.address}</div>
          </Row>
          {a.phone && (
            <Row Icon={Phone} label={en ? "Location phone" : "Téléphone du lieu"}>
              <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                {a.phone}
              </a>
            </Row>
          )}
          <Row Icon={Clock} label={en ? "Reason" : "Motif"}>
            {en ? a.reasonEn : a.reasonFr}
            <div className="text-xs font-normal text-muted-foreground">
              {a.durationMinutes} min
            </div>
          </Row>
        </div>

        {/* Patient notes — full-width block, outside the card (MR6b) */}
        {a.patientNote?.trim() && (
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="h-4 w-4 text-primary" />
              {en ? "Notes for the doctor" : "Précisions pour le médecin"}
            </div>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {a.patientNote.slice(0, 500)}
            </p>
          </div>
        )}

        {/* Fee — visually distinct */}
        <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm">
          <Wallet className="mt-0.5 h-4 w-4 flex-none text-primary" />
          <p>
            <span className="font-semibold">{en ? "Fee" : "Tarif"} : {a.fee}</span>{" "}
            <span className="text-muted-foreground">
              — {en ? "to be paid on site" : "à régler sur place"}
            </span>
          </p>
        </div>

        {/* Actions */}
        {isUpcoming ? (
          <div className="space-y-2">
            <Button onClick={onIcs} variant="outline" className="w-full rounded-full">
              <CalendarPlus className="h-4 w-4" /> {en ? "Add to calendar" : "Ajouter au calendrier"}
            </Button>

            <ActionWithTip disabled={!editable} tip={lockedTip}>
              <Button
                onClick={onReschedule}
                disabled={!editable}
                className="w-full rounded-full bg-[image:var(--gradient-brand)] text-primary-foreground"
              >
                <RotateCcw className="h-4 w-4" /> {en ? "Reschedule" : "Reporter"}
              </Button>
            </ActionWithTip>

            <ActionWithTip disabled={!editable} tip={lockedTip}>
              <Button
                onClick={onCancel}
                disabled={!editable}
                variant="outline"
                className="w-full rounded-full border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
              >
                <X className="h-4 w-4" /> {en ? "Cancel" : "Annuler"}
              </Button>
            </ActionWithTip>

            <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              {editable ? (
                <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-500" />
              )}
              {delayNote}
            </p>
          </div>
        ) : (
          <div className="space-y-2">{rebookHref}</div>
        )}
      </div>
    </>
  );
}

function ActionWithTip({
  disabled,
  tip,
  children,
}: {
  disabled: boolean;
  tip: string;
  children: React.ReactNode;
}) {
  if (!disabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block cursor-not-allowed">{children}</span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
