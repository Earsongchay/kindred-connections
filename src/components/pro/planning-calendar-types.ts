import type { ScheduleEntry, ScheduleLabel } from "@/lib/pro-schedule";

export type PlanningCalendarView = "week" | "month" | "list";

export interface PlanningCalendarProps {
  entries: ScheduleEntry[];
  labels: ScheduleLabel[];
  locale: "fr" | "en";
  view: PlanningCalendarView;
  date: Date;
  onEventClick: (entry: ScheduleEntry) => void;
  onDateClick: (date: string, time?: string) => void;
}