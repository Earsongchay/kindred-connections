import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { PlanningCalendarProps } from "./planning-calendar-types";

const viewNames = {
  week: "timeGridWeek",
  month: "dayGridMonth",
  list: "listMonth",
} as const;

export default function PlanningCalendarImpl({
  entries,
  labels,
  locale,
  view,
  date,
  onEventClick,
  onDateClick,
}: PlanningCalendarProps) {
  const labelMap = new Map(labels.map((label) => [label.id, label]));
  const events = entries.map((entry) => {
    const label = labelMap.get(entry.labelId);
    return {
      id: entry.id,
      title: entry.title,
      start: `${entry.date}T${entry.fullDay ? "00:00" : entry.start}`,
      end: `${entry.date}T${entry.fullDay ? "23:59" : entry.end}`,
      allDay: entry.fullDay,
      backgroundColor: label?.color,
      borderColor: label?.color,
      extendedProps: { entry },
    };
  });

  return (
    <div className="fueni-calendar">
      <FullCalendar
        key={`${view}-${date.toISOString()}`}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={viewNames[view]}
        initialDate={date}
        locale={locale}
        headerToolbar={false}
        firstDay={1}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        nowIndicator
        allDaySlot={false}
        dayMaxEvents={3}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        events={events}
        eventClick={(info) => onEventClick(info.event.extendedProps.entry)}
        dateClick={(info) => onDateClick(info.dateStr.slice(0, 10), info.dateStr.includes("T") ? info.dateStr.slice(11, 16) : undefined)}
      />
    </div>
  );
}