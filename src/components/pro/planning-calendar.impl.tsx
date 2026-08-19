// FullCalendar v7 — browser-only implementation. Loaded lazily from
// PlanningCalendar.tsx behind <ClientOnly> so SSR never evaluates it.
import { useEffect, useMemo, useRef } from "react";
import { Calendar, type CalendarRef, type EventClickInfo } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import listPlugin from "@fullcalendar/react/list";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import frLocale from "@fullcalendar/react/locales/fr";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import type { PlanningCalendarProps } from "./planning-calendar-types";

const VIEW_MAP = {
  week: "timeGridWeek",
  month: "dayGridMonth",
  list: "listMonth",
} as const;

export default function PlanningCalendarImpl({
  events,
  view,
  date,
  locale,
  onEventClick,
  onDateClick,
}: PlanningCalendarProps) {
  const ref = useRef<CalendarRef>(null);
  const plugins = useMemo(
    () => [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, classicThemePlugin],
    [],
  );

  useEffect(() => {
    ref.current?.getApi().changeView(VIEW_MAP[view]);
  }, [view]);

  useEffect(() => {
    ref.current?.getApi().gotoDate(date);
  }, [date]);

  return (
    <div className="fueni-calendar overflow-hidden rounded-2xl border border-border/60 bg-card p-2 shadow-sm sm:p-3">
      <Calendar
        ref={ref}
        plugins={plugins}
        initialView={VIEW_MAP[view]}
        initialDate={date}
        locale={locale === "fr" ? frLocale : undefined}
        headerToolbar={false}
        height="auto"
        firstDay={1}
        allDaySlot={false}
        nowIndicator
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        expandRows
        dayMaxEvents={3}
        events={events}
        eventClick={(info: EventClickInfo) => onEventClick(String(info.event.id))}
        dateClick={onDateClick ? (info) => onDateClick(info.dateStr.slice(0, 10)) : undefined}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit" }}
        noEventsText={locale === "fr" ? "Aucun évènement sur cette période." : "No events in this period."}
      />
    </div>
  );
}
