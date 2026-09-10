import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { PlanningCalendarProps } from "./planning-calendar-types";

export function PlanningCalendar(props: PlanningCalendarProps) {
  const [Calendar, setCalendar] = useState<ComponentType<PlanningCalendarProps> | null>(null);

  useEffect(() => {
    let active = true;
    void import("./planning-calendar.impl").then((module) => {
      if (active) setCalendar(() => module.default);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Calendar) {
    return <div className="h-[620px] animate-pulse bg-muted/35" aria-label="Loading calendar" />;
  }

  return <Calendar {...props} />;
}