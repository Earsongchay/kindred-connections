// TODO Sprint 3-4 — Replace mock data with the booking API (SF « Mes rendez-vous » v1.0).

export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Appointment {
  id: string;
  doctorSlug: string;
  doctorName: string;
  specialtyFr: string;
  specialtyEn: string;
  /** ISO instant of the appointment start. */
  startsAt: string;
  /** IANA timezone of the location. */
  timezone: string;
  timezoneLabel: string;
  locationName: string;
  address: string;
  /** Mandatory on a bookable location (PP19) — denormalised on the appointment. */
  phone: string;
  reasonFr: string;
  reasonEn: string;
  durationMinutes: number;
  fee: string;
  /** Free text captured at booking (≤ 500 chars). */
  patientNote?: string;
  status: AppointmentStatus;
}

/** MR1 — global modification window in MVP (per-doctor post-MVP). */
export const MODIFY_WINDOW_HOURS = 2;

export function isWithinModifyWindow(startsAt: string, now: Date = new Date()): boolean {
  const diffMs = new Date(startsAt).getTime() - now.getTime();
  return diffMs > MODIFY_WINDOW_HOURS * 3600 * 1000;
}

export function formatDateTime(startsAt: string, timeZone: string, en: boolean) {
  const d = new Date(startsAt);
  const loc = en ? "en-GB" : "fr-FR";
  const day = new Intl.DateTimeFormat(loc, { day: "2-digit", timeZone }).format(d);
  const month = new Intl.DateTimeFormat(loc, { month: "short", timeZone }).format(d);
  const time = new Intl.DateTimeFormat(loc, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    hour12: en,
  }).format(d);
  const full = new Intl.DateTimeFormat(loc, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    hour12: en,
  }).format(d);
  return { day, month: month.replace(".", "").toUpperCase(), time, full };
}

function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** MR5 — .ics always exported in UTC so the instant is correct in any timezone. */
export function buildIcs(a: Appointment, en: boolean): string {
  const start = new Date(a.startsAt);
  const end = new Date(start.getTime() + a.durationMinutes * 60000);
  const summary = `${en ? "Appointment" : "Rendez-vous"} — ${a.doctorName}`;
  const description = [en ? a.reasonEn : a.reasonFr, a.phone].filter(Boolean).join(" · ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FUENI//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${a.id}@fueni`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${a.locationName}, ${a.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function inHours(h: number): string {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}

export const APPOINTMENTS: Appointment[] = [
  {
    id: "rdv-1042",
    doctorSlug: "amina-sow",
    doctorName: "Dr Amina Sow",
    specialtyFr: "Cardiologie",
    specialtyEn: "Cardiology",
    startsAt: inHours(72),
    timezone: "Africa/Dakar",
    timezoneLabel: "GMT (UTC+0)",
    locationName: "Cabinet Médical Plateau",
    address: "12 rue Carnot, Plateau, Dakar, Sénégal",
    phone: "+221 33 842 15 20",
    reasonFr: "Consultation générale",
    reasonEn: "General consultation",
    durationMinutes: 30,
    fee: "15 000 FCFA",
    patientNote:
      "Douleurs thoraciques légères depuis deux semaines, surtout à l'effort.\nJe prends de l'amlodipine 5 mg depuis 6 mois.",
    status: "CONFIRMED",
  },
  {
    id: "rdv-1043",
    doctorSlug: "fatou-keita",
    doctorName: "Dr Fatou Keïta",
    specialtyFr: "Médecine générale",
    specialtyEn: "General medicine",
    // Inside the 2 h window — actions disabled, never hidden (MR1).
    startsAt: inHours(1.2),
    timezone: "Africa/Abidjan",
    timezoneLabel: "GMT (UTC+0)",
    locationName: "Clinique Pasteur",
    address: "Boulevard de la République, Abidjan, Côte d'Ivoire",
    phone: "+225 27 20 31 44",
    reasonFr: "Suivi / renouvellement",
    reasonEn: "Follow-up / renewal",
    durationMinutes: 20,
    fee: "10 000 FCFA",
    status: "CONFIRMED",
  },
  {
    id: "rdv-0987",
    doctorSlug: "kwame-mensah",
    doctorName: "Dr Kwame Mensah",
    specialtyFr: "Dermatologie",
    specialtyEn: "Dermatology",
    startsAt: inHours(-24 * 21),
    timezone: "Africa/Accra",
    timezoneLabel: "GMT (UTC+0)",
    locationName: "Clinique Le Baobab",
    address: "15 Independence Ave, Accra, Ghana",
    phone: "+233 30 276 11 08",
    reasonFr: "Consultation spécialisée",
    reasonEn: "Specialist consultation",
    durationMinutes: 40,
    fee: "20 000 FCFA",
    status: "COMPLETED",
  },
  {
    id: "rdv-0954",
    doctorSlug: "jean-mbala",
    doctorName: "Dr Jean Mbala",
    specialtyFr: "Pédiatrie",
    specialtyEn: "Paediatrics",
    startsAt: inHours(-24 * 40),
    timezone: "Africa/Douala",
    timezoneLabel: "WAT (UTC+1)",
    locationName: "Cabinet Bonapriso",
    address: "Rue Njo-Njo, Bonapriso, Douala, Cameroun",
    phone: "+237 233 42 66 90",
    reasonFr: "Consultation générale",
    reasonEn: "General consultation",
    durationMinutes: 30,
    fee: "12 000 FCFA",
    patientNote: "Rendez-vous annulé pour cause de déplacement professionnel.",
    status: "CANCELLED",
  },
];
