// TODO Sprint 4 — Replace with the practitioner scheduling API.
// Prototype dataset. All dates are fixed ISO strings so SSR and client match.

export type ScheduleKind = "APPOINTMENT" | "EVENT";

export interface ScheduleLabel {
  id: string;
  name: { fr: string; en: string };
  /** CSS color used for the event chip on the calendar. */
  color: string;
  /** The default "Consultation" label cannot be deleted. */
  locked?: boolean;
}

export interface ScheduleLocation {
  id: string;
  name: string;
  city: string;
}

export interface ScheduleEvent {
  id: string;
  kind: ScheduleKind;
  title: string;
  /** Patient id (APPOINTMENT only). */
  patientId?: string;
  patientName?: string;
  reason?: string;
  notes?: string;
  labelId: string;
  locationId: string;
  /** yyyy-mm-dd */
  date: string;
  /** HH:mm (venue local time) */
  start: string;
  end: string;
}

/** Prototype "today" so the calendar renders identically on server and client. */
export const TODAY = "2026-08-19";

export const SCHEDULE_LOCATIONS: ScheduleLocation[] = [
  { id: "plateau", name: "Cabinet Plateau", city: "Dakar" },
  { id: "principal", name: "Hôpital Principal", city: "Dakar" },
  { id: "teleconsult", name: "Téléconsultation", city: "En ligne" },
];

export const DEFAULT_LABELS: ScheduleLabel[] = [
  { id: "consultation", name: { fr: "Consultation", en: "Consultation" }, color: "#0ea5e9", locked: true },
  { id: "online", name: { fr: "Consultation en ligne", en: "Online meeting" }, color: "#8b5cf6" },
  { id: "home", name: { fr: "Visite à domicile", en: "Home visit" }, color: "#f59e0b" },
  { id: "surgery", name: { fr: "Bloc opératoire", en: "Surgery" }, color: "#ef4444" },
  { id: "admin", name: { fr: "Administratif", en: "Admin" }, color: "#64748b" },
];

export const LABEL_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#64748b",
  "#6366f1",
];

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "sch-1",
    kind: "APPOINTMENT",
    title: "Mariam Diallo",
    patientId: "mariam-diallo",
    patientName: "Mariam Diallo",
    reason: "Consultation de suivi",
    labelId: "consultation",
    locationId: "plateau",
    date: "2026-08-19",
    start: "08:30",
    end: "09:00",
    notes: "Contrôle de la tension.",
  },
  {
    id: "sch-2",
    kind: "APPOINTMENT",
    title: "Ousmane Sow",
    patientId: "ousmane-sow",
    patientName: "Ousmane Sow",
    reason: "Suivi hypertension",
    labelId: "online",
    locationId: "teleconsult",
    date: "2026-08-19",
    start: "10:00",
    end: "10:30",
  },
  {
    id: "sch-3",
    kind: "EVENT",
    title: "Réunion d'équipe",
    labelId: "admin",
    locationId: "principal",
    date: "2026-08-19",
    start: "14:00",
    end: "15:00",
    notes: "Point hebdomadaire du service.",
  },
  {
    id: "sch-4",
    kind: "APPOINTMENT",
    title: "Awa Faye",
    patientId: "awa-faye",
    patientName: "Awa Faye",
    reason: "Téléconsultation",
    labelId: "online",
    locationId: "teleconsult",
    date: "2026-08-20",
    start: "09:15",
    end: "09:45",
  },
  {
    id: "sch-5",
    kind: "APPOINTMENT",
    title: "Ibrahima Bâ",
    patientId: "ibrahima-ba",
    patientName: "Ibrahima Bâ",
    reason: "Lombalgie — contrôle",
    labelId: "home",
    locationId: "plateau",
    date: "2026-08-21",
    start: "16:00",
    end: "16:30",
  },
  {
    id: "sch-6",
    kind: "APPOINTMENT",
    title: "Fatou Ndiaye",
    patientId: "fatou-ndiaye",
    patientName: "Fatou Ndiaye",
    reason: "Suivi grossesse",
    labelId: "consultation",
    locationId: "principal",
    date: "2026-08-24",
    start: "11:00",
    end: "11:30",
  },
  {
    id: "sch-7",
    kind: "EVENT",
    title: "Bloc — 2 interventions",
    labelId: "surgery",
    locationId: "principal",
    date: "2026-08-25",
    start: "08:00",
    end: "12:00",
  },
  {
    id: "sch-8",
    kind: "APPOINTMENT",
    title: "Modou Cissé",
    patientId: "modou-cisse",
    patientName: "Modou Cissé",
    reason: "Renouvellement",
    labelId: "consultation",
    locationId: "plateau",
    date: "2026-08-27",
    start: "15:30",
    end: "16:00",
  },
  {
    id: "sch-9",
    kind: "APPOINTMENT",
    title: "Samba Gueye",
    patientId: "samba-gueye",
    patientName: "Samba Gueye",
    reason: "Dermatite — suivi",
    labelId: "online",
    locationId: "teleconsult",
    date: "2026-09-02",
    start: "10:30",
    end: "11:00",
  },
];

export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Monday-first week start. */
export function startOfWeek(d: Date): Date {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7;
  return addDays(c, -day);
}

export function startOfMonthGrid(d: Date): Date {
  return startOfWeek(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function compareEvents(a: ScheduleEvent, b: ScheduleEvent): number {
  return a.date === b.date ? minutesOf(a.start) - minutesOf(b.start) : a.date < b.date ? -1 : 1;
}
