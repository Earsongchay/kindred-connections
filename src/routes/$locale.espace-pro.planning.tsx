// TODO Sprint 4 — Wire to the scheduling API.
// Prototype practitioner planning — SF « Planning & rendez-vous (médecin) » v1.0.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n";
import { PRO_PATIENTS_ALL } from "@/lib/pro-patients";
import {
  CONSULTATION_HOURS,
  DEFAULT_LABELS,
  END_TIME_OPTIONS,
  LABEL_COLORS,
  LABEL_CONSULTATION,
  LABEL_HOME_VISIT,
  LABEL_UNAVAILABLE,
  MAX_CUSTOM_LABELS,
  SCHEDULE_EVENTS,
  SCHEDULE_LOCATIONS,
  TIME_OPTIONS,
  TODAY,
  addDays,
  bandsFor,
  compareEntries,
  daysBetween,
  findOverlaps,
  firstFreeSlot,
  hhmm,
  minutesOf,
  parseYmd,
  startOfMonthGrid,
  startOfWeek,
  ymd,
  type ScheduleEntry,
  type ScheduleLabel,
} from "@/lib/pro-schedule";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/espace-pro/planning")({
  head: () => ({
    meta: [
      { title: "Mon planning — FUENI" },
      {
        name: "description",
        content:
          "Gérez vos rendez-vous, évènements et indisponibilités : vues semaine, mois et agenda, étiquettes et disponibilités issues de vos horaires.",
      },
      { property: "og:title", content: "Mon planning — FUENI" },
      {
        property: "og:description",
        content: "Vue unique de votre activité : rendez-vous en ligne, évènements et indisponibilités.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProPlanningPage,
});

type View = "week" | "month" | "list";
type Tab = "APPOINTMENT" | "EVENT" | "BLOCK";
const LIST_BATCH = 30;

type FormState = {
  open: boolean;
  tab: Tab;
  editing: ScheduleEntry | null;
  date: string;
  start: string;
  end: string;
};

function ProPlanningPage() {
  const params = Route.useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const isEn = locale === "en";
  const intl = isEn ? "en-GB" : "fr-FR";
  const T = (fr: string, en: string) => (isEn ? en : fr);

  const [labels, setLabels] = useState<ScheduleLabel[]>(DEFAULT_LABELS);
  const [entries, setEntries] = useState<ScheduleEntry[]>(SCHEDULE_EVENTS);
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState<Date>(() => parseYmd(TODAY));
  const [locationId, setLocationId] = useState<string>("all");
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<ScheduleEntry | null>(null);
  const [listLimit, setListLimit] = useState(LIST_BATCH);
  const [fullDayPanel, setFullDayPanel] = useState(false);
  const [form, setForm] = useState<FormState>({
    open: false,
    tab: "APPOINTMENT",
    editing: null,
    date: TODAY,
    start: "09:00",
    end: "09:30",
  });

  const labelOf = (id: string): ScheduleLabel =>
    labels.find((l) => l.id === id) ?? labels[0]!;
  const locationOf = (id: string) => SCHEDULE_LOCATIONS.find((l) => l.id === id);
  const multiLocation = SCHEDULE_LOCATIONS.length > 1;

  const visible = useMemo(
    () =>
      entries
        .filter((e) => (locationId === "all" ? true : e.locationId === locationId))
        .filter((e) => {
          const l = labels.find((x) => x.id === e.labelId);
          // Archived / reserved labels are not filterable — always shown (PL8/PL16).
          if (!l || l.archived || l.reserved) return true;
          return !hidden.includes(e.labelId);
        })
        .sort(compareEntries),
    [entries, locationId, hidden, labels],
  );

  const byDay = (day: Date) => visible.filter((e) => e.date === ymd(day));

  const unseen = entries.filter((e) => e.bookedOnline && !e.seen);

  const upcoming = visible
    .filter((e) => e.kind === "APPOINTMENT" && e.date >= TODAY)
    .sort(compareEntries);
  const todayAppts = upcoming.filter((e) => e.date === TODAY);
  const in7 = upcoming.filter((e) => e.date > TODAY && e.date <= ymd(addDays(parseYmd(TODAY), 7)));
  const nextAppt = upcoming[0];

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonthGrid(cursor);
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(monthStart, i));

  /** PL18 — dynamic window: 06:00–21:00 floor, extended to hours + entries of the week. */
  const [gridFrom, gridTo] = useMemo(() => {
    let from = 6 * 60;
    let to = 21 * 60;
    for (const d of weekDays) {
      for (const b of bandsFor(d, locationId)) {
        from = Math.min(from, minutesOf(b.start));
        to = Math.max(to, minutesOf(b.end));
      }
      for (const e of byDay(d)) {
        from = Math.min(from, minutesOf(e.start));
        to = Math.max(to, e.end === "24:00" ? 1440 : minutesOf(e.end));
      }
    }
    return [Math.max(0, Math.floor(from / 60) * 60), Math.min(1440, Math.ceil(to / 60) * 60)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.getTime(), locationId, visible]);

  const gridHours = Array.from({ length: (gridTo - gridFrom) / 60 }, (_, i) => gridFrom / 60 + i);
  const PX_PER_MIN = 56 / 60;

  const shift = (dir: -1 | 1) => {
    setListLimit(LIST_BATCH);
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
    else if (view === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(addDays(cursor, dir));
  };

  const goToday = () => {
    setCursor(parseYmd(TODAY));
    setListLimit(LIST_BATCH);
  };

  const rangeLabel = () => {
    if (view === "month")
      return new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(cursor);
    if (view === "week") {
      const end = addDays(weekStart, 6);
      const f = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short" });
      return `${f.format(weekStart)} – ${f.format(end)} ${end.getFullYear()}`;
    }
    return `${T("À partir du", "Starting from")} ${new Intl.DateTimeFormat(intl, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(cursor)}`;
  };

  const listFrom = ymd(cursor) < TODAY ? TODAY : ymd(cursor);
  const listAll = visible.filter((e) => e.date >= listFrom);
  const listEntries = listAll.slice(0, listLimit);

  const openEntry = (e: ScheduleEntry) => {
    setSelected(e);
    if (e.bookedOnline && !e.seen) {
      setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, seen: true } : x)));
    }
  };

  const openCreate = (tab: Tab, date?: string, start?: string) => {
    const day = date ? parseYmd(date) : cursor;
    const slot = start
      ? { start, end: hhmm(Math.min(1440, minutesOf(start) + 30)) }
      : firstFreeSlot(entries, day, locationId);
    setForm({ open: true, tab, editing: null, date: date ?? ymd(day), start: slot.start, end: slot.end });
  };

  const openEdit = (e: ScheduleEntry) => {
    setForm({
      open: true,
      tab: e.kind === "BLOCK" ? "BLOCK" : e.kind === "EVENT" ? "EVENT" : "APPOINTMENT",
      editing: e,
      date: e.date,
      start: e.start,
      end: e.end,
    });
    setSelected(null);
  };

  const saveEntries = (list: ScheduleEntry[]) =>
    setEntries((prev) => [...prev, ...list].sort(compareEntries));

  const updateEntry = (e: ScheduleEntry) =>
    setEntries((prev) => prev.map((x) => (x.id === e.id ? e : x)).sort(compareEntries));

  const deleteEntry = (e: ScheduleEntry) => {
    setEntries((prev) =>
      e.groupId ? prev.filter((x) => x.groupId !== e.groupId) : prev.filter((x) => x.id !== e.id),
    );
    setSelected(null);
  };

  /* ---------------------------------------------------------------- labels */

  const legendLabels = labels.filter((l) => !l.archived && !l.reserved);
  const systemLabels = legendLabels.filter((l) => l.system);
  const customLabels = legendLabels.filter((l) => !l.system);

  const addLabel = (name: string): ScheduleLabel | null => {
    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    if (!name.trim()) return null;
    if (customLabels.length >= MAX_CUSTOM_LABELS) {
      toast.error(T(`Limite atteinte (8) — supprimez une étiquette pour en ajouter une autre.`, `Limit reached (8) — delete a label to add another.`));
      return null;
    }
    const clash = labels.some(
      (l) => !l.archived && (norm(l.name.fr) === norm(name) || norm(l.name.en) === norm(name)),
    );
    if (clash) {
      toast.error(T(`Une étiquette nommée « ${name} » existe déjà.`, `A label named "${name}" already exists.`));
      return null;
    }
    const color = LABEL_COLORS[customLabels.length % LABEL_COLORS.length]!;
    const label: ScheduleLabel = {
      id: `lbl-${Date.now()}`,
      name: { fr: name.trim(), en: name.trim() },
      color,
    };
    setLabels((prev) => [...prev, label]);
    toast.success(T("Étiquette créée.", "Label created."));
    return label;
  };

  const removeLabel = (l: ScheduleLabel) => {
    const used = entries.some((e) => e.labelId === l.id);
    if (used) {
      setLabels((prev) => prev.map((x) => (x.id === l.id ? { ...x, archived: true } : x)));
      toast.success(T("Étiquette retirée. Les évènements existants la conservent.", "Label removed. Existing events keep it."));
    } else {
      setLabels((prev) => prev.filter((x) => x.id !== l.id));
      toast.success(T("Étiquette supprimée.", "Label deleted."));
    }
    setHidden((prev) => prev.filter((x) => x !== l.id));
  };

  /* ------------------------------------------------------------------ ui */

  const stat = (Icon: typeof CalendarDays, label: string, value: string, hint?: string) => (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-bold">{value}</div>
          {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </div>
  );

  const EntryChip = ({ e, compact }: { e: ScheduleEntry; compact?: boolean }) => {
    const l = labelOf(e.labelId);
    const isBlock = e.kind === "BLOCK";
    return (
      <button
        type="button"
        onClick={() => openEntry(e)}
        style={{
          backgroundColor: isBlock ? undefined : `${l.color}1f`,
          borderColor: l.color,
          color: l.color,
          ...(isBlock
            ? {
                backgroundImage: `repeating-linear-gradient(45deg, ${l.color}26 0 6px, transparent 6px 12px)`,
              }
            : {}),
        }}
        className={cn(
          "relative w-full overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left text-[11px] font-semibold transition hover:brightness-95",
          compact && "truncate",
        )}
      >
        <span className="block truncate">
          {e.bookedOnline && !e.seen && (
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />
          )}
          {e.fullDay ? T("Journée", "All day") : e.start} {e.title}
        </span>
        {!compact && (
          <span className="block truncate text-[10px] font-medium opacity-80">{l.name[locale]}</span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{T("Mon planning", "My planning")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {T(
              "Vos rendez-vous, évènements et indisponibilités — heure locale du lieu.",
              "Your appointments, events and unavailabilities — local time of the location.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/$locale/espace-pro/profil-public"
            params={{ locale }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            <Settings2 className="h-4 w-4" /> {T("Modifier mes horaires", "Edit my hours")}
          </Link>
          <button
            type="button"
            onClick={() => openCreate("BLOCK")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            <CalendarOff className="h-4 w-4" /> {T("Bloquer un créneau", "Block a slot")}
          </button>
          <button
            type="button"
            onClick={() => openCreate("APPOINTMENT")}
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> {T("Ajouter au planning", "Add to planning")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(CalendarDays, T("Rendez-vous aujourd'hui", "Appointments today"), String(todayAppts.length))}
        {stat(Users, T("À venir (7 jours)", "Upcoming (7 days)"), String(in7.length))}
        {stat(
          CalendarClock,
          T("Prochain rendez-vous", "Next appointment"),
          nextAppt ? nextAppt.start : "—",
          nextAppt
            ? `${new Intl.DateTimeFormat(intl, { weekday: "short", day: "numeric", month: "short" }).format(
                parseYmd(nextAppt.date),
              )} · ${nextAppt.title}`
            : T("Rien de planifié", "Nothing scheduled"),
        )}
      </div>

      {/* New online appointments banner (PL5) */}
      {unseen.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="h-5 w-5 flex-none text-primary" />
          <p className="min-w-0 flex-1 text-sm font-medium">
            {isEn
              ? `${unseen.length} new online-booked appointment(s) to review.`
              : `${unseen.length} nouveau(x) rendez-vous pris en ligne à consulter.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setView("list");
              goToday();
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {T("Voir", "View")}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-muted"
          >
            {T("Aujourd'hui", "Today")}
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={T("Précédent", "Previous")}
              onClick={() => shift(-1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={T("Suivant", "Next")}
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
                  onClick={() => {
                    setView(v);
                    setListLimit(LIST_BATCH);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {v === "week"
                    ? T("Semaine", "Week")
                    : v === "month"
                      ? T("Mois", "Month")
                      : T("Agenda", "Listing")}
                </button>
              ))}
            </div>
            {multiLocation && (
              <select
                value={locationId}
                onChange={(ev) => setLocationId(ev.target.value)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium"
                aria-label={T("Lieu", "Location")}
              >
                <option value="all">{T("Tous les lieux", "All locations")}</option>
                {SCHEDULE_LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-5">
          {view === "week" && (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border/60">
                <div />
                {weekDays.map((d) => (
                  <div
                    key={`wh-${ymd(d)}`}
                    className={cn(
                      "px-1 py-2 text-center",
                      ymd(d) === TODAY && "bg-primary/5",
                    )}
                  >
                    <div className="text-[11px] uppercase text-muted-foreground">
                      {new Intl.DateTimeFormat(intl, { weekday: "short" }).format(d)}
                    </div>
                    <div
                      className={cn(
                        "mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-bold",
                        ymd(d) === TODAY && "bg-primary text-primary-foreground",
                      )}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="max-h-[640px] overflow-auto">
                <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                  <div>
                    {gridHours.map((h) => (
                      <div
                        key={`hr-${h}`}
                        className="h-14 border-b border-border/40 pr-2 pt-0.5 text-right text-[11px] text-muted-foreground"
                      >
                        {String(h).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>
                  {weekDays.map((d) => {
                    const bands = bandsFor(d, locationId);
                    const list = byDay(d);
                    return (
                      <div key={`col-${ymd(d)}`} className="relative border-l border-border/40">
                        {gridHours.map((h) => (
                          <button
                            key={`cell-${ymd(d)}-${h}`}
                            type="button"
                            onClick={() => openCreate("APPOINTMENT", ymd(d), hhmm(h * 60))}
                            aria-label={`${ymd(d)} ${h}:00`}
                            className="block h-14 w-full border-b border-border/40 transition hover:bg-primary/5"
                          />
                        ))}
                        {/* Bookable hour bands */}
                        {bands.map((b, i) => (
                          <div
                            key={`band-${ymd(d)}-${i}`}
                            className="pointer-events-none absolute inset-x-0 bg-emerald-500/10"
                            style={{
                              top: (minutesOf(b.start) - gridFrom) * PX_PER_MIN,
                              height: (minutesOf(b.end) - minutesOf(b.start)) * PX_PER_MIN,
                            }}
                          />
                        ))}
                        {/* Entries */}
                        {list.map((e) => {
                          const s = minutesOf(e.start);
                          const en = e.end === "24:00" ? 1440 : minutesOf(e.end);
                          return (
                            <div
                              key={e.id}
                              className="absolute inset-x-0.5"
                              style={{
                                top: (s - gridFrom) * PX_PER_MIN,
                                height: Math.max(22, (en - s) * PX_PER_MIN - 2),
                              }}
                            >
                              <div className="h-full">
                                <EntryChip e={e} compact />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === "month" && (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="grid grid-cols-7 border-b border-border/60">
                {monthDays.slice(0, 7).map((d) => (
                  <div
                    key={`mh-${ymd(d)}`}
                    className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {new Intl.DateTimeFormat(intl, { weekday: "short" }).format(d)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((d) => {
                  const inMonth = d.getMonth() === cursor.getMonth();
                  const isToday = ymd(d) === TODAY;
                  const list = byDay(d);
                  const appts = list.filter((e) => e.kind === "APPOINTMENT").length;
                  const blocked = list.some((e) => e.kind === "BLOCK");
                  return (
                    <div
                      key={ymd(d)}
                      className={cn(
                        "min-h-28 space-y-1 border-b border-l border-border/40 p-1.5",
                        !inMonth && "bg-muted/30 text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setCursor(d);
                            setView("week");
                          }}
                          className={cn(
                            "inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold",
                            isToday && "bg-primary text-primary-foreground",
                          )}
                        >
                          {d.getDate()}
                        </button>
                        <span className="flex items-center gap-1">
                          {appts > 0 && (
                            <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                              {appts}
                            </span>
                          )}
                          {blocked && <CalendarOff className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      </div>
                      {list.slice(0, 3).map((e) => (
                        <EntryChip key={e.id} e={e} compact />
                      ))}
                      {list.length > 3 && (
                        <div className="px-1 text-[10px] font-semibold text-muted-foreground">
                          +{list.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "list" && (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold capitalize">
                {rangeLabel()}
              </div>
              {listEntries.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {T("Aucune entrée à venir.", "Nothing scheduled ahead.")}
                </div>
              )}
              <ul className="divide-y divide-border/60">
                {listEntries.map((e) => {
                  const l = labelOf(e.labelId);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => openEntry(e)}
                        className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-muted/50"
                      >
                        <div className="w-28 flex-none">
                          <div className="text-xs uppercase text-muted-foreground">
                            {new Intl.DateTimeFormat(intl, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            }).format(parseYmd(e.date))}
                          </div>
                          <div className="text-sm font-semibold">
                            {e.fullDay ? T("Journée", "All day") : `${e.start}–${e.end}`}
                          </div>
                        </div>
                        <span className="h-8 w-1.5 flex-none rounded-full" style={{ backgroundColor: l.color }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{e.title}</span>
                            {e.bookedOnline && !e.seen && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                                {T("Nouveau", "New")}
                              </span>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {e.reason ?? l.name[locale]} · {locationOf(e.locationId)?.name}
                          </div>
                        </div>
                        <span
                          className="hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline"
                          style={{ backgroundColor: `${l.color}1f`, color: l.color }}
                        >
                          {l.name[locale]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {listAll.length > listEntries.length && (
                <div className="border-t border-border/60 p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setListLimit((n) => n + LIST_BATCH)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    {T("Charger plus", "Load more")} ({listAll.length - listEntries.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <DayAgenda
            entries={byDay(cursor)}
            labelOf={labelOf}
            locale={locale}
            isEn={isEn}
            onOpen={openEntry}
            onFull={() => setFullDayPanel(true)}
            title={new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long" }).format(cursor)}
          />

          <LabelLegend
            system={systemLabels}
            custom={customLabels}
            hidden={hidden}
            toggle={(id) =>
              setHidden((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
            }
            onCreate={addLabel}
            onDelete={removeLabel}
            locale={locale}
            isEn={isEn}
          />

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="text-sm font-bold">{T("Disponibilités", "Availability")}</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-3 w-6 rounded bg-emerald-500/25" />
                {T("Créneaux réservables", "Bookable slots")}
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="h-3 w-6 rounded border border-border"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(100,116,139,.35) 0 4px, transparent 4px 8px)",
                  }}
                />
                {T("Indisponible (bloqué)", "Unavailable (blocked)")}
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {T(
                "Les créneaux réservables suivent vos horaires de consultation.",
                "Bookable slots follow your consultation hours.",
              )}
            </p>
            <Link
              to="/$locale/espace-pro/profil-public"
              params={{ locale }}
              className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              {T("Modifier mes horaires", "Edit my hours")}
            </Link>
          </div>
        </aside>
      </div>

      {/* Full-day agenda */}
      <Dialog open={fullDayPanel} onOpenChange={setFullDayPanel}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {new Intl.DateTimeFormat(intl, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(cursor)}
            </DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {byDay(cursor).length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                {T("Rien de planifié ce jour.", "Nothing scheduled that day.")}
              </li>
            )}
            {byDay(cursor).map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFullDayPanel(false);
                    openEntry(e);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 p-3 text-left transition hover:bg-muted/50"
                >
                  <span
                    className="h-8 w-1.5 flex-none rounded-full"
                    style={{ backgroundColor: labelOf(e.labelId).color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {e.fullDay ? T("Journée entière", "All day") : `${e.start} – ${e.end}`} ·{" "}
                      {locationOf(e.locationId)?.name}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* Detail drawer */}
      <DetailDrawer
        entry={selected}
        onClose={() => setSelected(null)}
        labelOf={labelOf}
        locale={locale}
        isEn={isEn}
        intl={intl}
        entries={entries}
        onEdit={openEdit}
        onDelete={deleteEntry}
        onReschedule={(e, date, start, end) => {
          updateEntry({ ...e, date, start, end });
          setSelected(null);
          toast.success(T("Rendez-vous reprogrammé. Le patient est notifié.", "Appointment rescheduled. The patient is notified."));
        }}
        onCancel={(e) => {
          setEntries((prev) => prev.filter((x) => x.id !== e.id));
          setSelected(null);
          toast.success(T("Rendez-vous annulé. Le patient est notifié.", "Appointment canceled. The patient is notified."));
        }}
      />

      {/* Add / edit form */}
      {form.open && (
        <EntryForm
          state={form}
          onClose={() => setForm((f) => ({ ...f, open: false }))}
          entries={entries}
          labels={labels}
          locale={locale}
          isEn={isEn}
          locationId={locationId}
          onCreateLabel={addLabel}
          onSubmit={(list, mode) => {
            if (mode === "edit" && form.editing) {
              updateEntry({ ...form.editing, ...list[0]!, id: form.editing.id });
              toast.success(T("Modifications enregistrées.", "Changes saved."));
            } else {
              saveEntries(list);
              toast.success(
                list[0]!.kind === "BLOCK"
                  ? T("Créneau bloqué.", "Slot blocked.")
                  : list[0]!.kind === "APPOINTMENT"
                    ? T("Rendez-vous créé. Un e-mail de confirmation est envoyé au patient.", "Appointment created. A confirmation email will be sent to the patient.")
                    : T("Évènement créé.", "Event created."),
              );
            }
            setForm((f) => ({ ...f, open: false }));
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ parts */

function DayAgenda({
  entries,
  labelOf,
  locale,
  isEn,
  onOpen,
  onFull,
  title,
}: {
  entries: ScheduleEntry[];
  labelOf: (id: string) => ScheduleLabel;
  locale: Locale;
  isEn: boolean;
  onOpen: (e: ScheduleEntry) => void;
  onFull: () => void;
  title: string;
}) {
  const next = entries.slice(0, 3);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="text-sm font-bold capitalize">{title}</h3>
      <ul className="mt-3 space-y-2">
        {next.length === 0 && (
          <li className="text-xs text-muted-foreground">
            {isEn ? "Nothing scheduled." : "Rien de planifié."}
          </li>
        )}
        {next.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onOpen(e)}
              className="flex w-full items-start gap-2 rounded-xl p-2 text-left transition hover:bg-muted/60"
            >
              <span
                className="mt-1 h-2.5 w-2.5 flex-none rounded-full"
                style={{ backgroundColor: labelOf(e.labelId).color }}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{e.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {e.fullDay ? (isEn ? "All day" : "Journée entière") : `${e.start} – ${e.end}`} ·{" "}
                  {labelOf(e.labelId).name[locale]}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {entries.length > 0 && (
        <button
          type="button"
          onClick={onFull}
          className="mt-2 text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          {isEn ? `View full day (${entries.length})` : `Voir toute la journée (${entries.length})`}
        </button>
      )}
    </div>
  );
}

function LabelLegend({
  system,
  custom,
  hidden,
  toggle,
  onCreate,
  onDelete,
  locale,
  isEn,
}: {
  system: ScheduleLabel[];
  custom: ScheduleLabel[];
  hidden: string[];
  toggle: (id: string) => void;
  onCreate: (name: string) => ScheduleLabel | null;
  onDelete: (l: ScheduleLabel) => void;
  locale: Locale;
  isEn: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const atCap = custom.length >= MAX_CUSTOM_LABELS;

  const Row = ({ l, deletable }: { l: ScheduleLabel; deletable?: boolean }) => (
    <li>
      <div className="flex items-center gap-2">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={!hidden.includes(l.id)}
            onChange={() => toggle(l.id)}
            className="h-4 w-4 rounded border-border"
            style={{ accentColor: l.color }}
          />
          <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: l.color }} />
          <span className="truncate text-sm">{l.name[locale]}</span>
        </label>
        {deletable && (
          <button
            type="button"
            aria-label={isEn ? "Delete label" : "Supprimer l'étiquette"}
            onClick={() => setConfirmId(l.id)}
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {confirmId === l.id && (
        <div className="mt-1 rounded-xl border border-border bg-muted/40 p-2 text-xs">
          <p>
            {isEn
              ? `Delete "${l.name.en}"? Existing events keep their label.`
              : `Supprimer « ${l.name.fr} » ? Les évènements existants conservent leur étiquette.`}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onDelete(l);
                setConfirmId(null);
              }}
              className="rounded-full bg-destructive px-3 py-1 font-semibold text-destructive-foreground"
            >
              {isEn ? "Delete" : "Supprimer"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              className="rounded-full border border-border px-3 py-1 font-semibold"
            >
              {isEn ? "Cancel" : "Annuler"}
            </button>
          </div>
        </div>
      )}
    </li>
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="text-sm font-bold">{isEn ? "Labels" : "Étiquettes"}</h3>
      <ul className="mt-3 space-y-2">
        {system.map((l) => (
          <Row key={l.id} l={l} />
        ))}
        {custom.length > 0 && <li className="border-t border-border/50 pt-2" />}
        {custom.map((l) => (
          <Row key={l.id} l={l} deletable />
        ))}
      </ul>
      {creating ? (
        <div className="mt-3 space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEn ? "Label name" : "Nom de l'étiquette"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (onCreate(name)) {
                  setName("");
                  setCreating(false);
                }
              }}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              {isEn ? "Create" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
            >
              {isEn ? "Cancel" : "Annuler"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={atCap}
          onClick={() => setCreating(true)}
          title={atCap ? (isEn ? "Limit reached (8)" : "Limite atteinte (8)") : undefined}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> {isEn ? "New label" : "Nouvelle étiquette"}
        </button>
      )}
    </div>
  );
}

function KeyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2.5 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

function DetailDrawer({
  entry,
  onClose,
  labelOf,
  locale,
  isEn,
  intl,
  entries,
  onEdit,
  onDelete,
  onReschedule,
  onCancel,
}: {
  entry: ScheduleEntry | null;
  onClose: () => void;
  labelOf: (id: string) => ScheduleLabel;
  locale: Locale;
  isEn: boolean;
  intl: string;
  entries: ScheduleEntry[];
  onEdit: (e: ScheduleEntry) => void;
  onDelete: (e: ScheduleEntry) => void;
  onReschedule: (e: ScheduleEntry, date: string, start: string, end: string) => void;
  onCancel: (e: ScheduleEntry) => void;
}) {
  const T = (fr: string, en: string) => (isEn ? en : fr);
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel" | "delete">("view");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const lastId = useRef<string | null>(null);

  if (entry && lastId.current !== entry.id) {
    lastId.current = entry.id;
    setMode("view");
    setDate(entry.date);
    setStart(entry.start);
    setEnd(entry.end);
  }

  const location = entry ? SCHEDULE_LOCATIONS.find((l) => l.id === entry.locationId) : undefined;
  const label = entry ? labelOf(entry.labelId) : undefined;
  const isPatient = entry?.kind === "APPOINTMENT";
  const isBlock = entry?.kind === "BLOCK";

  const changed = !!entry && (date !== entry.date || start !== entry.start || end !== entry.end);
  const past = date < TODAY;
  const badOrder = minutesOf(end === "24:00" ? "23:59" : end) <= minutesOf(start);
  const clash = entry ? findOverlaps(entries, date, start, end, entry.id).length > 0 : false;
  const rescheduleError = past
    ? T("Impossible de planifier dans le passé.", "Cannot schedule in the past.")
    : badOrder
      ? T("L'heure de fin doit être après le début.", "End time must be after start time.")
      : clash
        ? T("Ce créneau en chevauche un autre (rendez-vous ou indisponibilité).", "This slot overlaps another one (appointment or unavailability).")
        : null;

  const groupDays = entry?.groupId
    ? entries.filter((x) => x.groupId === entry.groupId).sort(compareEntries)
    : [];

  return (
    <Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isBlock
              ? T("Indisponibilité", "Unavailability")
              : isPatient
                ? T("Détails du rendez-vous", "Appointment details")
                : T("Détails de l'évènement", "Event details")}
          </SheetTitle>
        </SheetHeader>
        {entry && label && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-border/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: `${label.color}1f`, color: label.color }}
                >
                  {label.name[locale]}
                </span>
                {entry.bookedOnline && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {T("Pris en ligne", "Booked online")}
                  </span>
                )}
                {entry.bookedOnline && !entry.seen && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                    {T("Nouveau", "New")}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold">{entry.title}</h3>
              {entry.reason && <p className="text-sm text-muted-foreground">{entry.reason}</p>}
            </div>

            <dl className="rounded-2xl border border-border/60 px-4">
              {entry.reason && <KeyRow label={T("Motif", "Reason")}>{entry.reason}</KeyRow>}
              <KeyRow label={T("Date & heure", "Date & time")}>
                <span className="capitalize">
                  {groupDays.length > 1
                    ? `${T("Du", "From")} ${new Intl.DateTimeFormat(intl, { day: "numeric", month: "short" }).format(parseYmd(groupDays[0]!.date))} ${T("au", "to")} ${new Intl.DateTimeFormat(intl, { day: "numeric", month: "short" }).format(parseYmd(groupDays[groupDays.length - 1]!.date))} (${groupDays.length} ${T("jours", "days")})`
                    : new Intl.DateTimeFormat(intl, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(parseYmd(entry.date))}
                </span>
                <br />
                {entry.fullDay ? T("Journée entière", "All day") : `${entry.start} → ${entry.end}`}
              </KeyRow>
              <KeyRow label={T("Lieu", "Location")}>
                {location?.name}
                <span className="block text-xs text-muted-foreground">
                  {location?.city} · {location?.tzLabel}
                </span>
              </KeyRow>
              {entry.patientPhone && (
                <KeyRow label={T("Téléphone patient", "Patient's phone")}>
                  <a href={`tel:${entry.patientPhone}`} className="text-primary hover:underline">
                    {entry.patientPhone}
                  </a>
                </KeyRow>
              )}
              {entry.emergencyContact && (
                <KeyRow label={T("Contact d'urgence", "Emergency contact")}>
                  {entry.emergencyContact.name} · {entry.emergencyContact.relation[locale]}
                  <br />
                  <a href={`tel:${entry.emergencyContact.phone}`} className="text-primary hover:underline">
                    {entry.emergencyContact.phone}
                  </a>
                </KeyRow>
              )}
            </dl>

            {entry.notes && (
              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {T("Notes du patient", "Patient's notes")}
                </div>
                <p className="mt-1 whitespace-pre-line text-sm">{entry.notes}</p>
              </div>
            )}

            {isPatient && entry.date >= TODAY && (
              <p className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
                {T(
                  "Vous pouvez modifier ce rendez-vous à tout moment ; le patient est notifié. (Lui : en ligne jusqu'à 2 h avant.)",
                  "You can modify this appointment at any time; the patient is notified. (Them: online up to 2h before.)",
                )}
              </p>
            )}

            {/* Actions */}
            {mode === "view" && (
              <div className="flex flex-wrap gap-2">
                {isPatient && (
                  <>
                    <Link
                      to="/$locale/espace-pro/dossiers"
                      params={{ locale }}
                      className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      <FileText className="h-4 w-4" /> {T("Documenter", "Document")}
                    </Link>
                    <Link
                      to="/$locale/espace-pro/dossiers"
                      params={{ locale }}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                    >
                      <FolderOpen className="h-4 w-4" /> {T("Voir le dossier", "View patient record")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMode("reschedule")}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                    >
                      <Clock className="h-4 w-4" /> {T("Reprogrammer", "Reschedule")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("cancel")}
                      className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" /> {T("Annuler", "Cancel")}
                    </button>
                  </>
                )}
                {!isPatient && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" /> {T("Modifier", "Edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("delete")}
                      className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />{" "}
                      {isBlock ? T("Débloquer", "Unblock") : T("Supprimer", "Delete")}
                    </button>
                  </>
                )}
              </div>
            )}

            {mode === "cancel" && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p>{T("Annuler ce rendez-vous ? Le patient sera notifié.", "Cancel this appointment? The patient will be notified.")}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onCancel(entry)}
                    className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
                  >
                    {T("Confirmer l'annulation", "Confirm cancellation")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    {T("Retour", "Back")}
                  </button>
                </div>
              </div>
            )}

            {mode === "delete" && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p>
                  {isBlock
                    ? T("Débloquer ce créneau ?", "Unblock this slot?")
                    : T("Supprimer cet évènement ?", "Delete this event?")}
                  {groupDays.length > 1 &&
                    ` ${T(`(${groupDays.length} jours)`, `(${groupDays.length} days)`)}`}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
                  >
                    {isBlock ? T("Débloquer", "Unblock") : T("Supprimer", "Delete")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    {T("Retour", "Back")}
                  </button>
                </div>
              </div>
            )}

            {mode === "reschedule" && (
              <div className="space-y-3 rounded-2xl border border-border/60 p-4">
                <p className="text-xs text-muted-foreground">
                  {T("Le patient sera notifié du changement.", "The patient will be notified of the change.")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={date}
                    min={TODAY}
                    onChange={(e) => setDate(e.target.value)}
                    className="col-span-3 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="col-span-1 rounded-xl border border-border bg-background px-2 py-2 text-sm"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="col-span-1 rounded-xl border border-border bg-background px-2 py-2 text-sm"
                  >
                    {END_TIME_OPTIONS.filter((t) => minutesOf(t === "24:00" ? "23:59" : t) > minutesOf(start)).map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </select>
                </div>
                {rescheduleError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> {rescheduleError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!changed || !!rescheduleError}
                    onClick={() => onReschedule(entry, date, start, end)}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {T("Confirmer", "Confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    {T("Retour", "Back")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EntryForm({
  state,
  onClose,
  onSubmit,
  entries,
  labels,
  locale,
  isEn,
  locationId,
  onCreateLabel,
}: {
  state: FormState;
  onClose: () => void;
  onSubmit: (list: ScheduleEntry[], mode: "create" | "edit") => void;
  entries: ScheduleEntry[];
  labels: ScheduleLabel[];
  locale: Locale;
  isEn: boolean;
  locationId: string;
  onCreateLabel: (name: string) => ScheduleLabel | null;
}) {
  const T = (fr: string, en: string) => (isEn ? en : fr);
  const editing = state.editing;
  const [tab, setTab] = useState<Tab>(state.tab);
  const [date, setDate] = useState(state.date);
  const [start, setStart] = useState(state.start);
  const [end, setEnd] = useState(state.end);
  const [place, setPlace] = useState(
    editing?.locationId ?? (locationId === "all" ? SCHEDULE_LOCATIONS[0]!.id : locationId),
  );
  // patient tab
  const [query, setQuery] = useState(editing?.patientName ?? "");
  const [patientId, setPatientId] = useState<string | null>(editing?.patientId ?? null);
  const [patientName, setPatientName] = useState(editing?.patientName ?? "");
  const [reason, setReason] = useState(editing?.reason ?? "");
  const [homeVisit, setHomeVisit] = useState(editing?.labelId === LABEL_HOME_VISIT);
  // event tab
  const [title, setTitle] = useState(editing?.kind === "EVENT" ? editing.title : "");
  const eventLabels = labels.filter((l) => !l.system && !l.reserved && !l.archived);
  const [labelId, setLabelId] = useState(
    editing?.kind === "EVENT" ? editing.labelId : (eventLabels[0]?.id ?? LABEL_CONSULTATION),
  );
  const [newLabel, setNewLabel] = useState("");
  const [showNewLabel, setShowNewLabel] = useState(false);
  // block tab
  const [fullDay, setFullDay] = useState(!!editing?.fullDay);
  const [multiDay, setMultiDay] = useState(false);
  const [until, setUntil] = useState(state.date);

  const effStart = fullDay && tab === "BLOCK" ? "00:00" : start;
  const effEnd = fullDay && tab === "BLOCK" ? "24:00" : end;

  const past = date < TODAY;
  const badOrder = minutesOf(effEnd === "24:00" ? "23:59" : effEnd) <= minutesOf(effStart);
  const clashes = findOverlaps(entries, date, effStart, effEnd, editing?.id);
  const rangeInvalid = tab === "BLOCK" && multiDay && daysBetween(date, until) < 0;
  const rangeTooLong = tab === "BLOCK" && multiDay && daysBetween(date, until) > 90;

  let error: string | null = null;
  if (past) error = T("Impossible de planifier dans le passé.", "Cannot schedule in the past.");
  else if (badOrder) error = T("L'heure de fin doit être après le début.", "End time must be after start time.");
  else if (tab !== "BLOCK" && clashes.length > 0)
    error = T(
      "Ce créneau en chevauche un autre (rendez-vous ou indisponibilité).",
      "This slot overlaps another one (appointment or unavailability).",
    );
  else if (rangeInvalid)
    error = T("La date de fin doit être postérieure ou égale à la date de début.", "End date must be after or equal to start date.");
  else if (rangeTooLong) error = T("Plage trop longue (90 jours maximum).", "Range too long (maximum 90 days).");

  const overlappedAppts = tab === "BLOCK" ? clashes.filter((c) => c.kind === "APPOINTMENT") : [];

  const missing =
    (tab === "APPOINTMENT" && !patientName.trim()) || (tab === "EVENT" && !title.trim());

  const filteredPatients = PRO_PATIENTS_ALL.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  ).slice(0, 6);

  const submit = () => {
    if (error || missing) return;
    const base = {
      locationId: place,
      date,
      start: effStart,
      end: effEnd,
    };
    if (tab === "APPOINTMENT") {
      const p = PRO_PATIENTS_ALL.find((x) => x.id === patientId);
      onSubmit(
        [
          {
            ...base,
            id: `sch-${Date.now()}`,
            kind: "APPOINTMENT",
            title: patientName,
            patientId: patientId ?? undefined,
            patientName,
            patientPhone: p?.phone,
            reason: reason || undefined,
            labelId: homeVisit ? LABEL_HOME_VISIT : LABEL_CONSULTATION,
          },
        ],
        editing ? "edit" : "create",
      );
      return;
    }
    if (tab === "EVENT") {
      onSubmit(
        [{ ...base, id: `sch-${Date.now()}`, kind: "EVENT", title: title.trim(), labelId }],
        editing ? "edit" : "create",
      );
      return;
    }
    const days = multiDay ? Math.max(0, daysBetween(date, until)) : 0;
    const groupId = `blk-${Date.now()}`;
    const list: ScheduleEntry[] = Array.from({ length: days + 1 }, (_, i) => ({
      ...base,
      date: ymd(addDays(parseYmd(date), i)),
      id: `blk-${Date.now()}-${i}`,
      kind: "BLOCK" as const,
      title: reason || T("Indisponible", "Unavailable"),
      reason: reason || undefined,
      labelId: LABEL_UNAVAILABLE,
      fullDay,
      groupId,
    }));
    onSubmit(list, editing ? "edit" : "create");
  };

  const field = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";
  const tabs: { id: Tab; label: string }[] = [
    { id: "APPOINTMENT", label: T("Rendez-vous patient", "Patient appointment") },
    { id: "EVENT", label: T("Évènement", "Event") },
    { id: "BLOCK", label: T("Indisponible", "Unavailable") },
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? T("Modifier", "Edit") : T("Ajouter au planning", "Add to planning")}
          </DialogTitle>
        </DialogHeader>

        {!editing && (
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-border p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {tab === "APPOINTMENT" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  {T("Patient", "Patient")} <span className="text-destructive">＊</span>
                </label>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPatientId(null);
                    setPatientName("");
                  }}
                  placeholder={T("Rechercher un patient…", "Search a patient…")}
                  className={field}
                />
                {patientName ? (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <User className="h-3.5 w-3.5" /> {patientName}
                    <button type="button" onClick={() => setPatientName("")} aria-label="clear">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  query.trim().length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border">
                      {filteredPatients.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setPatientId(p.id);
                              setPatientName(p.name);
                              setQuery(p.name);
                            }}
                            className="w-full px-3 py-2 text-left text-sm transition hover:bg-muted"
                          >
                            {p.name}
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setPatientId(null);
                            setPatientName(query.trim());
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-semibold text-primary transition hover:bg-muted"
                        >
                          + {T("Nouveau patient", "New patient")} « {query.trim()} »
                        </button>
                      </li>
                    </ul>
                  )
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">{T("Motif", "Reason")}</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className={field} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={homeVisit}
                  onChange={(e) => setHomeVisit(e.target.checked)}
                  className="h-4 w-4"
                />
                {T("Rendez-vous à domicile", "Home appointment")}
              </label>
            </>
          )}

          {tab === "EVENT" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  {T("Titre", "Title")} <span className="text-destructive">＊</span>
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">{T("Étiquette", "Label")}</label>
                <div className="flex flex-wrap gap-2">
                  {eventLabels.map((l) => (
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
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                        labelId !== l.id && "border-border text-muted-foreground",
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      {l.name[locale]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewLabel((v) => !v)}
                    className="rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold"
                  >
                    + {T("Nouvelle étiquette", "New label")}
                  </button>
                </div>
                {showNewLabel && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder={T("Nom", "Name")}
                      className={field}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const l = onCreateLabel(newLabel);
                        if (l) {
                          setLabelId(l.id);
                          setNewLabel("");
                          setShowNewLabel(false);
                        }
                      }}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      {T("Créer", "Create")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "BLOCK" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold">{T("Motif", "Reason")}</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={T("Congé, formation, pause déjeuner…", "Leave, training, lunch…")}
                  className={field}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fullDay}
                    onChange={(e) => setFullDay(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {T("Journée entière", "Full day")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={multiDay}
                    onChange={(e) => setMultiDay(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {T("Plusieurs jours", "Multiple days")}
                </label>
              </div>
              {multiDay && (
                <div>
                  <label className="mb-1 block text-xs font-semibold">{T("Jusqu'au", "Until")}</label>
                  <input
                    type="date"
                    value={until}
                    min={date}
                    onChange={(e) => setUntil(e.target.value)}
                    className={field}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {T("Un blocage est placé chaque jour de la plage.", "A block is placed each day of the range.")}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold">{T("Date", "Date")}</label>
              <input
                type="date"
                value={date}
                min={TODAY}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (e.target.value > until) setUntil(e.target.value);
                }}
                className={field}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">{T("Début", "Start")}</label>
              <select
                value={effStart}
                disabled={tab === "BLOCK" && fullDay}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (minutesOf(e.target.value) >= minutesOf(end))
                    setEnd(hhmm(Math.min(1425, minutesOf(e.target.value) + 30)));
                }}
                className={cn(field, "disabled:opacity-60")}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">{T("Fin", "End")}</label>
              <select
                value={effEnd}
                disabled={tab === "BLOCK" && fullDay}
                onChange={(e) => setEnd(e.target.value)}
                className={cn(field, "disabled:opacity-60")}
              >
                {END_TIME_OPTIONS.filter(
                  (t) => minutesOf(t === "24:00" ? "23:59" : t) > minutesOf(effStart),
                ).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {SCHEDULE_LOCATIONS.length > 1 && (
            <div>
              <label className="mb-1 block text-xs font-semibold">{T("Lieu", "Location")}</label>
              <select value={place} onChange={(e) => setPlace(e.target.value)} className={field}>
                {SCHEDULE_LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
          {!error && tab === "BLOCK" && overlappedAppts.length > 0 && (
            <p className="flex items-start gap-1.5 rounded-xl bg-amber-500/10 p-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
              {isEn
                ? `${overlappedAppts.length} patient appointment(s) overlap this slot. The block prevents new bookings but does not cancel them — to be managed individually.`
                : `${overlappedAppts.length} rendez-vous patient chevauche(nt) ce créneau. Le blocage empêche de nouvelles réservations mais ne les annule pas — à gérer individuellement.`}
            </p>
          )}
          {tab === "APPOINTMENT" && (
            <p className="text-xs text-muted-foreground">
              {T("Un e-mail de confirmation sera envoyé au patient.", "A confirmation email will be sent to the patient.")}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          >
            {T("Annuler", "Cancel")}
          </button>
          <button
            type="button"
            disabled={!!error || missing}
            onClick={submit}
            className="rounded-full bg-[image:var(--gradient-brand)] px-5 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editing ? T("Enregistrer", "Save") : T("Ajouter", "Add")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Unused import guard — keeps hours reference explicit for future API wiring. */
void CONSULTATION_HOURS;
void MapPin;
