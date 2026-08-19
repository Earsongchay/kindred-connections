// SSR-safe wrapper: FullCalendar v7 is loaded only in the browser.
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { PlanningCalendarProps } from "./planning-calendar-types";

const Impl = lazy(() => import("./planning-calendar.impl"));

function Skeleton() {
  return (
    <div className="h-[560px] animate-pulse rounded-2xl border border-border/60 bg-card shadow-sm" />
  );
}

export function PlanningCalendar(props: PlanningCalendarProps) {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <Suspense fallback={<Skeleton />}>
        <Impl {...props} />
      </Suspense>
    </ClientOnly>
  );
}
