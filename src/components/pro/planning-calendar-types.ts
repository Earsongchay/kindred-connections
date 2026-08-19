// Shared, browser-safe types for the practitioner planning calendar.
export type PlanningView = "week" | "month" | "list";

export interface PlanningCalendarEvent {
  id: string;
  title: string;
  /** ISO local datetime, e.g. 2026-08-19T08:30 */
  start: string;
  end: string;
  color: string;
}

export interface PlanningCalendarProps {
  events: PlanningCalendarEvent[];
  view: PlanningView;
  /** yyyy-mm-dd */
  date: string;
  locale: "fr" | "en";
  onEventClick: (id: string) => void;
  onDateClick?: (ymd: string) => void;
}
