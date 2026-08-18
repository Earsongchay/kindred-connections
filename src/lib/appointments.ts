// TODO Sprint 4 — Replace with the appointments API (SF « Mes rendez-vous » v1.0).
// Prototype dataset. Dates are fixed ISO strings so SSR and client render identically.

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  initials: string;
  specialty: { fr: string; en: string };
  /** Local time at the venue, ISO without zone: yyyy-mm-ddThh:mm */
  startsAt: string;
  durationMin: number;
  /** IANA timezone of the venue. */
  timezone: string;
  tzLabel: string;
  placeName: string;
  address: string;
  /** Mandatory on a bookable place (PP19) — may be empty on legacy rows. */
  phone: string;
  reason: { fr: string; en: string };
  fee: string;
  /** Free text typed at booking, max 500 chars, line breaks preserved. */
  notes: string;
  status: AppointmentStatus;
}

/** Modification window before the appointment (MVP: 2 h, global — MR1). */
export const CUTOFF_HOURS = 2;

export const APPOINTMENTS: Appointment[] = [
  {
    id: "rdv-10241",
    doctorId: "dr-aboubacar-diallo",
    doctorName: "Dr Aboubacar Diallo",
    initials: "AD",
    specialty: { fr: "Cardiologie", en: "Cardiology" },
    startsAt: "2026-09-04T10:30",
    durationMin: 30,
    timezone: "Africa/Dakar",
    tzLabel: "GMT+0 · Dakar",
    placeName: "Cabinet Plateau",
    address: "12 avenue Léopold Sédar Senghor, Plateau, Dakar",
    phone: "+221338211234",
    reason: { fr: "Consultation de suivi", en: "Follow-up consultation" },
    fee: "25 000 XOF",
    notes:
      "Tension un peu haute depuis deux semaines.\nJe prends toujours le traitement prescrit en juin.",
    status: "CONFIRMED",
  },
  {
    id: "rdv-10238",
    doctorId: "dr-mamadou-diallo",
    doctorName: "Dr Mamadou Diallo",
    initials: "MD",
    specialty: { fr: "Médecine générale", en: "General medicine" },
    startsAt: "2026-08-19T08:15",
    durationMin: 20,
    timezone: "Africa/Dakar",
    tzLabel: "GMT+0 · Dakar",
    placeName: "Hôpital Principal — Consultations externes",
    address: "1 avenue Nelson Mandela, Dakar",
    phone: "+221338391050",
    reason: { fr: "Première consultation", en: "First consultation" },
    fee: "15 000 XOF",
    notes: "",
    status: "CONFIRMED",
  },
  {
    id: "rdv-10190",
    doctorId: "dr-fatou-kone",
    doctorName: "Dr Fatou Koné",
    initials: "FK",
    specialty: { fr: "Dermatologie", en: "Dermatology" },
    startsAt: "2026-07-22T15:00",
    durationMin: 30,
    timezone: "Africa/Abidjan",
    tzLabel: "GMT+0 · Abidjan",
    placeName: "Clinique Sainte-Anne",
    address: "Boulevard de Marseille, Abidjan",
    phone: "+2252720301122",
    reason: { fr: "Contrôle annuel", en: "Annual check-up" },
    fee: "20 000 XOF",
    notes: "",
    status: "COMPLETED",
  },
  {
    id: "rdv-10155",
    doctorId: "dr-awa-ba",
    doctorName: "Dr Awa Ba",
    initials: "AB",
    specialty: { fr: "Gynécologie", en: "Gynaecology" },
    startsAt: "2026-06-11T09:00",
    durationMin: 30,
    timezone: "Africa/Dakar",
    tzLabel: "GMT+0 · Dakar",
    placeName: "Cabinet Point E",
    address: "Rue de Diourbel, Point E, Dakar",
    phone: "+221338250099",
    reason: { fr: "Consultation de suivi", en: "Follow-up consultation" },
    fee: "20 000 XOF",
    notes: "Rendez-vous décalé une première fois pour raison professionnelle.",
    status: "CANCELLED",
  },
];

export function endOf(a: Appointment): Date {
  const d = new Date(`${a.startsAt}:00`);
  return new Date(d.getTime() + a.durationMin * 60_000);
}

export function startOf(a: Appointment): Date {
  return new Date(`${a.startsAt}:00`);
}

/** MR1 — online reschedule/cancel allowed until CUTOFF_HOURS before the start. */
export function isWithinCutoff(a: Appointment, now: Date): boolean {
  return startOf(a).getTime() - now.getTime() > CUTOFF_HOURS * 3_600_000;
}

export function formatDateTime(a: Appointment, locale: string): string {
  const d = startOf(a);
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** MR5 — .ics export converts the venue local time to UTC. */
export function buildIcs(a: Appointment, locale: "fr" | "en"): string {
  const toUtc = (d: Date) => {
    const utc = new Date(
      Date.UTC(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        0,
      ),
    );
    // Venue offset is GMT+0 for the MVP launch countries.
    return `${utc.getUTCFullYear()}${pad(utc.getUTCMonth() + 1)}${pad(utc.getUTCDate())}T${pad(
      utc.getUTCHours(),
    )}${pad(utc.getUTCMinutes())}00Z`;
  };
  const summary = `${a.doctorName} — ${a.reason[locale]}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FUENI//Appointments//FR",
    "BEGIN:VEVENT",
    `UID:${a.id}@fueni.health`,
    `DTSTART:${toUtc(startOf(a))}`,
    `DTEND:${toUtc(endOf(a))}`,
    `SUMMARY:${summary}`,
    `LOCATION:${a.placeName}, ${a.address}`,
    `DESCRIPTION:${a.specialty[locale]} — ${a.fee}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
