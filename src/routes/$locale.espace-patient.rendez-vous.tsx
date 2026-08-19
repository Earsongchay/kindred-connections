// SF « Mes rendez-vous » v1.0 — écran 08-patient-mes-rdv.
// TODO Sprint 4 — Wire to the appointments API (states, slot release, notifications).
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Stethoscope,
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
import { BookingDialog } from "@/components/site/BookingDialog";
import { getDoctor } from "@/lib/doctors";
import {
  APPOINTMENTS,
  buildIcs,
  formatDateTime,
  isWithinCutoff,
  startOf,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-patient/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Mes rendez-vous — FUENI" },
      {
        name: "description",
        content:
          "Consultez, reportez ou annulez vos rendez-vous FUENI depuis votre espace patient.",
      },
      { property: "og:title", content: "Mes rendez-vous — FUENI" },
      {
        property: "og:description",
        content: "Gérez vos rendez-vous médicaux FUENI en toute autonomie",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppointmentsPage,
});

type TabKey = "upcoming" | "past" | "cancelled";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-muted text-muted-foreground",
};

function AppointmentsPage() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const en = locale === "en";

  const [tab, setTab] = useState<TabKey>("upcoming");
  const [items, setItems] = useState<Appointment[]>(APPOINTMENTS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  // Computed after hydration only — keeps SSR and client markup identical.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const reference = now ?? new Date("2026-08-18T00:00:00");

  const groups = useMemo(() => {
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const cancelled: Appointment[] = [];
    for (const a of items) {
      if (a.status === "CANCELLED") cancelled.push(a);
      else if (a.status === "COMPLETED" || startOf(a).getTime() < reference.getTime()) past.push(a);
      else upcoming.push(a);
    }
    const byDate = (x: Appointment, y: Appointment) =>
      startOf(x).getTime() - startOf(y).getTime();
    upcoming.sort(byDate);
    past.sort((x, y) => -byDate(x, y));
    cancelled.sort((x, y) => -byDate(x, y));
    return { upcoming, past, cancelled };
  }, [items, reference]);

  const selected = items.find((a) => a.id === openId) ?? null;
  const rescheduleDoctor = rescheduleId
    ? getDoctor(items.find((a) => a.id === rescheduleId)?.doctorId ?? "")
    : undefined;

  const modifiable = selected
    ? selected.status === "CO
N   FIRMED" && groups.upcoming.includes(selected)
   
    : false;
  const withinCutoff = selected && now ? isWithinCutoff(selected, now) : false;
  const canModify = modifiable && withinCutoff;

  const downloadIcs = (a: Appointment) => {
    const blob = new Blob([buildIcs(a, locale)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${a.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cancelAppointment = () => {
    if (!selected) return;
    // MR4 — server releases the slot and notifies the practitioner.
    setItems((list) =>
      list.map((a) => (a.id === selected.id ? { ...a, status: "CANCELLED" as const } : a)),
    );
    setConfirmCancel(false);
    setOpenId(null);
    setTab("cancelled");
  };

  const tabs: { key: TabKey; count: number }[] = [
    { key: "upcoming", count: groups.upcoming.length },
    { key: "past", count: groups.past.length },
    { key: "cancelled", count: groups.cancelled.length },
  ];

  const list = groups[tab];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("appts.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("appts.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/$locale/recherche" params={{ locale }} search={{ q: "", city: "", type: "" }}>
            <Plus className="h-4 w-4" /> {t("appts.book")}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-1">
        {tabs.map(({ key, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t(`appts.tabs.${key}`)}
            <span
              className={cn(
                "ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                tab === key ? "bg-white/20" : "bg-muted-foreground/10",
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">{t(`appts.empty.${tab}`)}</p>
          <Button
              asChild variant="outlin
e             " className="mt-4">
             
            
            <Link
              to="/$locale/recherche"
              params={{ locale }}
              search={{ q: "", city: "", type: "" }}
            >
              {t("appts.empty.cta")}
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOpenId(a.id)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{a.doctorName}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      {t(`appts.status.${a.status}`)}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-muted-foreground">
                    {a.specialty[locale]}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(a, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {a.placeName}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Detail drawer — carries every action (MR6). */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{t("appts.detail.title")}</SheetTitle>
                <SheetDescription>{selected.reason[locale]}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-card p-4">
                <Row icon={Stethoscope} label={t("appts.detail.doctor")}>
                  <div className="font-medium text-foreground">{selected.doctorName}</div>
                  <div className="text-muted-foreground">{selected.specialty[locale]}</div>
                </Row>
                <Row icon={CalendarDays} label={t("appts.detail.when")}>
                  <div className="font-medium text-foreground">
                    {formatDateTime(selected, locale)}
                  </div>
                  <div className="text-muted-foreground">{selected.tzLabel}</div>
                </Row>
                <Row icon={MapPin} label={t("appts.detail.place")}>
                  <div className="font-medium text-foreground">{selected.placeName}</div>
                  <div className="text-muted-foreground">{selected.address}</div>
                </Row>
                {selected.phone && (
                  <Row icon={Phone} label={t("appts.detail.phone")}>
                    <a
                      href={`tel:${selected.phone}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {selected.phone}
                    </a>
                  </Row>
                )}
                <Row icon={Clock} label={t("appts.detail.reason")}>
                  <div className="font-medium text-foreground">{selected.reason[locale]}</div>
                  <div className="text-muted-foreground">
                    {t("appts.detail.duration", { count: selected.durationMin })}
                  </div>
                </Row>
              </div>

              {/* Patient notes — full-width block, outside the card (MR6b). */}
              {selected.notes.trim() && (
                <div className="mt-4 rounded-2xl border border-border/60 bg-muted/40 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("appts.detail.notes")}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                    {selected.notes.slice(0, 500)}
                  </p>
                </div>
              )}

              {/* Fee — visually distinct */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                  {t("appts.detail.fee")}
                </span>
                <span className="text-sm text-foreground">
                  <strong>{selected.fee}</strong>{" "}
                  <span className="text-muted-foreground">— {t("appts.detail.feeNote")}</span>
                </span>
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                {modifiable ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => downloadIcs(selected)}
                    >
                      <CalendarPlus className="h-4 w-4" /> {t("appts.actions.calendar")}
                    </Button>
                    <Button
                      className="w-full justify-center"
                      disabled={!canModify}
                      title={canModify ? undefined : t("appts.lockedTooltip")}
                      onClick={() => {
                        setRescheduleId(selected.id);
                        setOpenId(null);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> {t("appts.actions.reschedule")}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={!canModify}
                      title={canModify ? undefined : t("appts.lockedTooltip")}
                      onClick={() => setConfirmCancel(true)}
                    >
                      <X className="h-4 w-4" /> {t("appts.actions.cancel")}
                    </Button>
                    {/* Uniform delay note on every upcoming appointment (MR3). */}
                    <p className="flex gap-2 pt-1 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
                      <sp
                     an>{t("appts.delayNote")
                     }</span>
                     
                    
                    </p>
                  </>
                ) : (
                  <Button asChild className="w-full justify-center">
                    <Link
                      to="/$locale/recherche"
                      params={{ locale }}
                      search={{ q: "", city: "", type: "" }}
                    >
                      <RotateCcw className="h-4 w-4" /> {t("appts.actions.rebook")}
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel confirmation */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("appts.cancelDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("appts.cancelDialog.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("appts.cancelDialog.keep")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("appts.cancelDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule = reopen the booking assistant for the same practitioner (MR2). */}
      {rescheduleDoctor && (
        <BookingDialog
          doctor={rescheduleDoctor}
          en={en}
          open={!!rescheduleId}
          onOpenChange={(o) => !o && setRescheduleId(null)}
        />
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
