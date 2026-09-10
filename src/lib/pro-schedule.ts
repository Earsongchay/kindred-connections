// TODO Sprint 4 — Replace with the practitioner scheduling API (SF « Planning & rendez-vous » v1.0).
// Prototype dataset. All dates are fixed ISO strings so SSR and client match.

export type ScheduleKind = "APPOINTMENT" | "EVENT" | "BLOCK";
export type AppointmentStatus = "planned" | "to-close" | "done" | "no-show" | "canceled";

export interface ScheduleLabel {
  id: string;
  name: { fr: string; en: string };
  /** CSS color used for the event chip on the calendar. */
  color: string;
  /** System labels (Consultation, Unavailable) cannot be deleted or renamed. */
  system?: boolean;
  /** Reserved patient label (Home visit): hidden from legend, selector and cap. */
  reserved?: boolean;
  /** Archived labels stay resolvable for existing events but leave the legend. */
  archived?: boolean;
}

export interface ScheduleLocation {
  id: string;
  name: string;
  city: string;
  /** IANA timezone of the venue (PL11 — local time of the location). */
  timezone: string;
  tzLabel: string;
  /** A teleconsultation "location" is bookable but has no address. */
  online?: boolean;
}

export interface EmergencyContact {
  name: string;
  relation: { fr: string; en: string };
  phone: string;
}

export interface ScheduleEntry {
  id: string;
  kind: ScheduleKind;
  title: string;
  /** Patient id (APPOINTMENT only). */
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  emergencyContact?: EmergencyContact;
  reason?: string;
  notes?: string;
  labelId: string;
  locationId: string;
  /** yyyy-mm-dd */
  date: string;
  /** HH:mm (venue local time, 24h) */
  start: string;
  end: string;
  /** PL4/PL5 — booked online by the patient, flagged "New" until opened. */
  bookedOnline?: boolean;
  seen?: boolean;
  /** BLOCK only — groups the days of a multi-day block (PL9). */
  groupId?: string;
  fullDay?: boolean;
  status?: AppointmentStatus;
}

/** Prototype "today" so the calendar renders identically on server and client. */
export const TODAY = "2026-08-19";

export const SCHEDULE_LOCATIONS: ScheduleLocation[] = [
  { id: "plateau", name: "Cabinet Plateau", city: "Dakar", timezone: "Africa/Dakar", tzLabel: "GMT+0 · Dakar" },
  {
    id: "principal",
    name: "Hôpital Principal",
    city: "Dakar",
    timezone: "Africa/Dakar",
    tzLabel: "GMT+0 · Dakar",
  },
  {
    id: "teleconsult",
    name: "Téléconsultation",
    city: "En ligne",
    timezone: "Africa/Dakar",
    tzLabel: "GMT+0 · Dakar",
    online: true,
  },
];

/** System / reserved labels (PL8, §7). */
export const LABEL_CONSULTATION = "consultation";
export const LABEL_UNAVAILABLE = "unavailable";
export const LABEL_HOME_VISIT = "home-visit";

export const DEFAULT_LABELS: ScheduleLabel[] = [
  {
    id: LABEL_CONSULTATION,
    name: { fr: "Consultation", en: "Consultation" },
    color: "#0ea5e9",
    system: true,
  },
  {
    id: LABEL_UNAVAILABLE,
    name: { fr: "Indisponible", en: "Unavailable" },
    color: "#64748b",
    system: true,
  },
  {
    id: LABEL_HOME_VISIT,
    name: { fr: "Visite à domicile", en: "Home visit" },
    color: "#f59e0b",
    reserved: true,
  },
  { id: "meeting", name: { fr: "Réunion", en: "Meeting" }, color: "#8b5cf6" },
  { id: "admin", name: { fr: "Administratif", en: "Admin" }, color: "#14b8a6" },
];

/** Palette size = cap of custom labels (§7 — 8 custom labels). */
export const LABEL_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#ef4444",
  "#10b981",
  "#6366f1",
  "#f97316",
  "#0891b2",
];

export const MAX_CUSTOM_LABELS = 8;

/** Consultation hours from the public profile (PL2 — single source, per location). */
export interface HourBand {
  /** 1 = Monday … 7 = Sunday */
  weekday: number;
  start: string;
  end: string;
  locationId: string;
}

export const CONSULTATION_HOURS: HourBand[] = [
  { weekday: 1, start: "08:00", end: "13:00", locationId: "plateau" },
  { weekday: 1, start: "15:00", end: "18:00", locationId: "principal" },
  { weekday: 2, start: "08:00", end: "12:30", locationId: "principal" },
  { weekday: 2, start: "14:00", end: "19:00", locationId: "plateau" },
  { weekday: 3, start: "09:00", end: "13:00", locationId: "plateau" },
  { weekday: 3, start: "16:00", end: "21:00", locationId: "teleconsult" },
  { weekday: 4, start: "08:00", end: "12:00", locationId: "principal" },
  { weekday: 4, start: "14:00", end: "18:00", locationId: "plateau" },
  { weekday: 5, start: "08:00", end: "13:00", locationId: "plateau" },
  { weekday: 5, start: "15:00", end: "17:30", locationId: "teleconsult" },
  { weekday: 6, start: "09:00", end: "12:00", locationId: "plateau" },
];

export const SCHEDULE_EVENTS: ScheduleEntry[] = [
  {
    id: "sch-1",
    kind: "APPOINTMENT",
    title: "Mariam Diallo",
    patientId: "mariam-diallo",
    patientName: "Mariam Diallo",
    patientPhone: "+221771234567",
    emergencyContact: {
      name: "Ousmane Diallo",
      relation: { fr: "Frère", en: "Brother" },
      phone: "+221775558899",
    },
    reason: "Consultation de suivi",
    labelId: LABEL_CONSULTATION,
    locationId: "plateau",
    date: "2026-08-19",
    start: "08:30",
    end: "09:00",
    notes: "Contrôle de la tension.",
    bookedOnline: true,
    seen: true,
    status: "to-close",
  },
  {
    id: "sch-2",
    kind: "APPOINTMENT",
    title: "Ousmane Sow",
    patientId: "ousmane-sow",
    patientName: "Ousmane Sow",
    patientPhone: "+221770112233",
    reason: "Suivi hypertension",
    labelId: LABEL_CONSULTATION,
    locationId: "teleconsult",
    date: "2026-08-19",
    start: "16:30",
    end: "17:00",
    bookedOnline: true,
    seen: false,
    notes:
      "Ma tension est remontée depuis une semaine.\nJe prends toujours le traitement de juin.",
    status: "planned",
  },
  {
    id: "sch-3",
    kind: "EVENT",
    title: "Réunion d'équipe",
    labelId: "meeting",
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
    patientPhone: "+221776654321",
    reason: "Téléconsultation",
    labelId: LABEL_CONSULTATION,
    locationId: "teleconsult",
    date: "2026-08-20",
    start: "09:15",
    end: "09:45",
    bookedOnline: true,
    seen: false,
    status: "planned",
  },
  {
    id: "sch-5",
    kind: "APPOINTMENT",
    title: "Ibrahima Bâ",
    patientId: "ibrahima-ba",
    patientName: "Ibrahima Bâ",
    patientPhone: "+221778889900",
    reason: "Lombalgie — contrôle",
    labelId: LABEL_HOME_VISIT,
    locationId: "plateau",
    date: "2026-08-21",
    start: "16:00",
    end: "16:30",
    status: "planned",
  },
  {
    id: "sch-6",
    kind: "BLOCK",
    title: "Congé",
    reason: "Congé",
    labelId: LABEL_UNAVAILABLE,
    locationId: "plateau",
    date: "2026-08-22",
    start: "00:00",
    end: "24:00",
    fullDay: true,
    groupId: "blk-demo",
  },
  {
    id: "sch-7",
    kind: "APPOINTMENT",
    title: "Fatou Ndiaye",
    patientId: "fatou-ndiaye",
    patientName: "Fatou Ndiaye",
    patientPhone: "+221773334455",
    reason: "Suivi grossesse",
    labelId: LABEL_CONSULTATION,
    locationId: "principal",
    date: "2026-08-24",
    start: "11:00",
    end: "11:30",
    bookedOnline: true,
    seen: false,
    status: "planned",
  },
  {
    id: "sch-8",
    kind: "EVENT",
    title: "Formation — échographie",
    labelId: "admin",
    locationId: "principal",
    date: "2026-08-25",
    start: "08:00",
    end: "12:00",
  },
  {
    id: "sch-9",
    kind: "APPOINTMENT",
    title: "Modou Cissé",
    patientId: "modou-cisse",
    patientName: "Modou Cissé",
    patientPhone: "+221771119988",
    reason: "Renouvellement d'ordonnance",
    labelId: LABEL_CONSULTATION,
    locationId: "plateau",
    date: "2026-08-27",
    start: "15:30",
    end: "16:00",
    status: "planned",
  },
  {
    id: "sch-10",
    kind: "APPOINTMENT",
    title: "Samba Gueye",
    patientId: "samba-gueye",
    patientName: "Samba Gueye",
    patientPhone: "+221774442211",
    reason: "Dermatite — suivi",
    labelId: LABEL_CONSULTATION,
    locationId: "teleconsult",
    date: "2026-09-02",
    start: "20:30",
    end: "21:00",
    bookedOnline: true,
    seen: false,
    status: "planned",
  },
];

export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86_400_000);
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

/** 1 = Monday … 7 = Sunday */
export function weekdayOf(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1;
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function hhmm(minutes: number): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(minutes / 60))}:${p(minutes % 60)}`;
}

/** 24h option list, 15-minute steps (PL14 — never AM/PM). */
export const TIME_OPTIONS: string[] = Array.from({ length: 96 }, (_, i) => hhmm(i * 15));
export const END_TIME_OPTIONS: string[] = [...TIME_OPTIONS.slice(1), "24:00"];

export function compareEntries(a: ScheduleEntry, b: ScheduleEntry): number {
  return a.date === b.date ? minutesOf(a.start) - minutesOf(b.start) : a.date < b.date ? -1 : 1;
}

/** Consultation-hour bands of a given day, optionally narrowed to one location. */
export function bandsFor(day: Date, locationId: string): HourBand[] {
  const wd = weekdayOf(day);
  return CONSULTATION_HOURS.filter(
    (b) => b.weekday === wd && (locationId === "all" || b.locationId === locationId),
  );
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** PL14 — anti-overlap check against appointments, events and blocks. */
export function findOverlaps(
  entries: ScheduleEntry[],
  date: string,
  start: string,
  end: string,
  ignoreId?: string,
): ScheduleEntry[] {
  const s = minutesOf(start);
  const e = end === "24:00" ? 1440 : minutesOf(end);
  return entries.filter(
    (x) =>
      x.id !== ignoreId &&
      x.date === date &&
      overlaps(s, e, minutesOf(x.start), x.end === "24:00" ? 1440 : minutesOf(x.end)),
  );
}

/** First free 30-minute slot of a day inside the hours envelope (PL13). */
export function firstFreeSlot(entries: ScheduleEntry[], day: Date, locationId: string) {
  const bands = bandsFor(day, locationId);
  const from = bands.length ? Math.min(...bands.map((b) => minutesOf(b.start))) : 9 * 60;
  const until = bands.length ? Math.max(...bands.map((b) => minutesOf(b.end))) : 18 * 60;
  for (let t = from; t + 30 <= Math.max(until, from + 30); t += 30) {
    if (findOverlaps(entries, ymd(day), hhmm(t), hhmm(t + 30)).length === 0) {
      return { start: hhmm(t), end: hhmm(t + 30) };
    }
  }
  return { start: hhmm(from), end: hhmm(from + 30) };
}
