// TODO Sprint 4 — Wire to the scheduling API. Prototype practitioner schedule.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Tag,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { PRO_PATIENTS } from "@/lib/pro-patients";
import {
  DEFAULT_LABELS,
  LABEL_COLORS,
  SCHEDULE_EVENTS,
  SCHEDULE_LOCATIONS,
  TODAY,
  addDays,
  compareEvents,
  minutesOf,
  parseYmd,
  startOfMonthGrid,
  startOfWeek,
  ymd,
  type ScheduleEvent,
  type ScheduleLabel,
} from "@/lib/pro-schedule";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PlanningCalendar } from "@/components/pro/PlanningCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro/planning")({
  head: () => ({ meta: [{ title: "Mon planning — FUENI" }] }),
  component: ProPlanningPage,
});

type View = "week" | "month" | "list";

const DAY_START = 7 * 60;
const DAY_END = 20 * 60;
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START / 60 + i);

function ProPlanningPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const intl = isEn ? "en-GB" : "fr-FR";

  const [labels, setLabels] = useState<ScheduleLabel[]>(DEFAULT_LABELS);
  const [events, setEvents] = useState<ScheduleEvent[]>(SCHEDULE_EVENTS);
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState<Date>(() => parseYmd(TODAY));
  const [locationId, setLocationId] = useState<string>("all");
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [selected, setSelected] = useState<ScheduleEvent | null>(null);
  const [creating, setCreating] = useState<null | "APPOINTMENT" | "EVENT">(null);
  const [labelManager, setLabelManager] = useState(false);

  const labelOf = (id: string) => labels.find((l) => l.id === id) ?? labels[0];
  const locationOf = (id: string) => SCHEDULE_LOCATIONS.find((l) => l.id === id);

  const visible = useMemo(
    () =>
      events
        .filter((e) => (locationId === "all" ? true : e.locationId === locationId))
        .filter((e) => (activeLabels.length === 0 ? true : activeLabels.includes(e.labelId)))
        .sort(compareEvents),
    [events, locationId, activeLabels],
  );

  const calendarEvents = useMemo(
    () =>
      visible.map((e) => ({
        id: e.id,
        title: e.title,
        start: `${e.date}T${e.start}`,
        end: `${e.date}T${e.end}`,
        color: labelOf(e.labelId).color,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, labels],
  );

  // Stat cards
  const todayEvents = visible.filter((e) => e.date === TODAY);
  const in7 = visible.filter((e) => e.date > TODAY && e.date <= ymd(addDays(parseYmd(TODAY), 7)));
  const nextAppt = visible.find(
    (e) => e.date > TODAY || (e.date === TODAY && e.kind === "APPOINTMENT"),
  );

  const weekStart = startOfWeek(cursor);

  const shift = (dir: -1 | 1) => {
    if (view === "week") {
      setCursor(addDays(cursor, dir * 7));
    } else {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    }
  };

  const rangeLabel = () => {
    if (view === "week") {
      const end = addDays(weekStart, 6);
      const f = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short" });
      return `${f.format(weekStart)} – ${f.format(end)} ${end.getFullYear()}`;
    }
    return new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(cursor);
  };

  const addEvent = (e: ScheduleEvent) => setEvents((prev) => [...prev, e].sort(compareEvents));
  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const stat = (Icon: typeof CalendarDays, label: string, value: string, hint?: string) => (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="truncate text-xl font-bold">{value}</div>
          {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </div>
  );

  const EventChip = ({ e, compact }: { e: ScheduleEvent; compact?: boolean }) => {
    const l = labelOf(e.labelId);
    return (
      <button
        type="button"
        onClick={() => setSelected(e)}
        style={{ backgroundColor: `${l.color}1f`, borderColor: l.color, color: l.color }}
        className={cn(
          "w-full overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left text-[11px] font-semibold transition hover:brightness-95",
          compact && "truncate",
        )}
      >
        <span className="block truncate">
          {e.start} {e.title}
        </span>
        {!compact && (
          <span className="block truncate text-[10px] font-medium opacity-80">
            {l.name[locale]}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEn ? "My schedule" : "Mon planning"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEn
              ? "Appointments and personal events across your practice locations."
              : "Rendez-vous et évènements personnels sur vos différents lieux d'exercice."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCreating("APPOINTMENT")}
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> {isEn ? "New appointment" : "Nouveau rendez-vous"}
          </button>
          <button
            type="button"
            onClick={() => setCreating("EVENT")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> {isEn ? "New event" : "Nouvel évènement"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(
          CalendarDays,
          isEn ? "Appointments today" : "Rendez-vous aujourd'hui",
          String(todayEvents.filter((e) => e.kind === "APPOINTMENT").length),
        )}
        {stat(Users, isEn ? "Upcoming (7 days)" : "À venir (7 jours)", String(in7.length))}
        {stat(
          CalendarClock,
          isEn ? "Next appointment" : "Prochain rendez-vous",
          nextAppt ? nextAppt.start : "—",
          nextAppt
            ? `${new Intl.DateTimeFormat(intl, { weekday: "short", day: "numeric", month: "short" }).format(parseYmd(nextAppt.date))} · ${nextAppt.title}`
            : isEn
              ? "Nothing scheduled"
              : "Rien de planifié",
        )}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(parseYmd(TODAY))}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-muted"
          >
            {isEn ? "Today" : "Aujourd'hui"}
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isEn ? "Previous" : "Précédent"}
              onClick={() => shift(-1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={isEn ? "Next" : "Suivant"}
              onClick={() => shift(1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="min-w-40 px-1 text-sm font-semibold capitalize">{rangeLabel()}</div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border p-0.5">
              {(["week", "month", "list"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {v === "week"
                    ? isEn
                      ? "Week"
                      : "Semaine"
                    : v === "month"
                      ? isEn
                        ? "Month"
                        : "Mois"
                      : isEn
                        ? "List"
                        : "Liste"}
                </button>
              ))}
            </div>
            <select
              value={locationId}
              onChange={(ev) => setLocationId(ev.target.value)}
              className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium"
            >
              <option value="all">{isEn ? "All locations" : "Tous les lieux"}</option>
              {SCHEDULE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Label filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isEn ? "Labels" : "Étiquettes"}
          </span>
          {labels.map((l) => {
            const on = activeLabels.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  setActiveLabels((prev) => (on ? prev.filter((x) => x !== l.id) : [...prev, l.id]))
                }
                style={
                  on
                    ? { backgroundColor: `${l.color}22`, borderColor: l.color, color: l.color }
                    : undefined
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
                  !on && "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name[locale]}
              </button>
            );
          })}
          {activeLabels.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveLabels([])}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              {isEn ? "Clear" : "Effacer"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setLabelManager(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:bg-muted"
          >
            <Tag className="h-3.5 w-3.5" /> {isEn ? "Manage labels" : "Gérer les étiquettes"}
          </button>
        </div>
      </div>

      {/* Views */}
      {/* FullCalendar v7 */}
      <PlanningCalendar
        events={calendarEvents}
        view={view}
        date={ymd(cursor)}
        locale={isEn ? "en" : "fr"}
        onEventClick={(id) => setSelected(events.find((e) => e.id === id) ?? null)}
      />

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{isEn ? "Appointment details" : "Détails du rendez-vous"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${labelOf(selected.labelId).color}1f`,
                      color: labelOf(selected.labelId).color,
                    }}
                  >
                    {labelOf(selected.labelId).name[locale]}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {selected.kind === "APPOINTMENT"
                      ? isEn
                        ? "Patient appointment"
                        : "Rendez-vous patient"
                      : isEn
                        ? "Event"
                        : "Évènement"}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{selected.title}</h3>
                {selected.reason && (
                  <p className="text-sm text-muted-foreground">{selected.reason}</p>
                )}
              </div>

              <dl className="space-y-3 text-sm">
                <Row Icon={CalendarDays} label={isEn ? "Date" : "Date"}>
                  {new Intl.DateTimeFormat(intl, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(parseYmd(selected.date))}
                </Row>
                <Row Icon={Clock} label={isEn ? "Time" : "Horaire"}>
                  {selected.start} – {selected.end}
                </Row>
                <Row Icon={MapPin} label={isEn ? "Location" : "Lieu"}>
                  {locationOf(selected.locationId)?.name} · {locationOf(selected.locationId)?.city}
                </Row>
                {selected.patientName && (
                  <Row Icon={User} label={isEn ? "Patient" : "Patient"}>
                    {selected.patientName}
                  </Row>
                )}
              </dl>

              {selected.notes && (
                <div className="rounded-2xl bg-muted/50 p-4 text-sm whitespace-pre-line">
                  {selected.notes}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  removeEvent(selected.id);
                  setSelected(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> {isEn ? "Delete" : "Supprimer"}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create dialog */}
      <CreateDialog
        kind={creating}
        onClose={() => setCreating(null)}
        onCreate={addEvent}
        labels={labels}
        locale={locale}
        isEn={isEn}
        onManageLabels={() => setLabelManager(true)}
      />

      {/* Label manager */}
      <LabelManager
        open={labelManager}
        onClose={() => setLabelManager(false)}
        labels={labels}
        setLabels={setLabels}
        locale={locale}
        isEn={isEn}
      />
    </div>
  );
}

function Row({
  Icon,
  label,
  children,
}: {
  Icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}

function CreateDialog({
  kind,
  onClose,
  onCreate,
  labels,
  locale,
  isEn,
  onManageLabels,
}: {
  kind: null | "APPOINTMENT" | "EVENT";
  onClose: () => void;
  onCreate: (e: ScheduleEvent) => void;
  labels: ScheduleLabel[];
  locale: Locale;
  isEn: boolean;
  onManageLabels: () => void;
}) {
  const [patientId, setPatientId] = useState(PRO_PATIENTS[0]!.id);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(TODAY);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("09:30");
  const [labelId, setLabelId] = useState(labels[0]!.id);
  const [locationId, setLocationId] = useState(SCHEDULE_LOCATIONS[0]!.id);
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!kind) return;
    const patient = PRO_PATIENTS.find((p) => p.id === patientId);
    onCreate({
      id: `sch-${Date.now()}`,
      kind,
      title:
        kind === "APPOINTMENT" ? (patient?.name ?? "") : title || (isEn ? "Event" : "Évènement"),
      patientId: kind === "APPOINTMENT" ? patientId : undefined,
      patientName: kind === "APPOINTMENT" ? patient?.name : undefined,
      reason: kind === "APPOINTMENT" ? reason : undefined,
      notes,
      labelId,
      locationId,
      date,
      start,
      end,
    });
    onClose();
  };

  const field = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {kind === "APPOINTMENT"
              ? isEn
                ? "New patient appointment"
                : "Nouveau rendez-vous patient"
              : isEn
                ? "New event"
                : "Nouvel évènement"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {kind === "APPOINTMENT" ? (
            <>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{isEn ? "Patient" : "Patient"}</span>
                <select
                  className={field}
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  {PRO_PATIENTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{isEn ? "Reason" : "Motif"}</span>
                <input
                  className={field}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isEn ? "Follow-up consultation" : "Consultation de suivi"}
                />
              </label>
            </>
          ) : (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{isEn ? "Title" : "Titre"}</span>
              <input
                className={field}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isEn ? "Team meeting" : "Réunion d'équipe"}
              />
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{isEn ? "Date" : "Date"}</span>
              <input
                type="date"
                className={field}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{isEn ? "Start" : "Début"}</span>
              <input
                type="time"
                className={field}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{isEn ? "End" : "Fin"}</span>
              <input
                type="time"
                className={field}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{isEn ? "Location" : "Lieu"}</span>
            <select
              className={field}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              {SCHEDULE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{isEn ? "Label" : "Étiquette"}</span>
              <button
                type="button"
                onClick={onManageLabels}
                className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
              >
                {isEn ? "Manage labels" : "Gérer les étiquettes"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLabelId(l.id)}
                  style={
                    labelId === l.id
                      ? { backgroundColor: `${l.color}22`, borderColor: l.color, color: l.color }
                      : undefined
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    labelId !== l.id && "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name[locale]}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{isEn ? "Notes" : "Notes"}</span>
            <textarea
              className={cn(field, "min-h-20")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              {isEn ? "Cancel" : "Annuler"}
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-full bg-[image:var(--gradient-brand)] px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              {isEn ? "Save" : "Enregistrer"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LabelManager({
  open,
  onClose,
  labels,
  setLabels,
  locale,
  isEn,
}: {
  open: boolean;
  onClose: () => void;
  labels: ScheduleLabel[];
  setLabels: React.Dispatch<React.SetStateAction<ScheduleLabel[]>>;
  locale: Locale;
  isEn: boolean;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[4]!);

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLabels((prev) => [
      ...prev,
      { id: `label-${Date.now()}`, name: { fr: trimmed, en: trimmed }, color },
    ]);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEn ? "Labels" : "Étiquettes"}</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2">
          {labels.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2 text-sm"
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="flex-1 font-medium">{l.name[locale]}</span>
              {l.locked ? (
                <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                  {isEn ? "Default" : "Par défaut"}
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={isEn ? "Delete label" : "Supprimer l'étiquette"}
                  onClick={() => setLabels((prev) => prev.filter((x) => x.id !== l.id))}
                  className="text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-border/60 pt-4">
          <div className="text-sm font-semibold">{isEn ? "New label" : "Nouvelle étiquette"}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEn ? "e.g. Home visit" : "ex. Visite à domicile"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {LABEL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "h-7 w-7 rounded-full ring-offset-2 transition",
                  color === c && "ring-2 ring-foreground",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={create}
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> {isEn ? "Add label" : "Ajouter"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
