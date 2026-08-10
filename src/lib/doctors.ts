// TODO Sprint 4 — Replace with real practitioner directory API.
// Prototype dataset powering the public search results + doctor detail pages.

export interface DoctorSlot {
  day: { fr: string; en: string };
  times: string[];
}

export interface DoctorPractice {
  name: string;
  kind: { fr: string; en: string };
  address: string;
}

export interface DoctorHours {
  day: { fr: string; en: string };
  ranges: string[]; // empty = closed
}

export interface DoctorPrice {
  label: { fr: string; en: string };
  duration: number; // minutes
  amount: string;
}

export interface DoctorMilestone {
  year: string;
  label: { fr: string; en: string };
}

export interface DoctorLegal {
  licenseNumber: string;
  board: { fr: string; en: string };
}

export interface Doctor {
  id: string;
  name: string;
  initials: string;
  specialty: { fr: string; en: string };
  city: string;
  country: string;
  address: string;
  languages: string[];
  rating: number;
  reviews: number;
  fee: string;
  teleconsultation: boolean;
  verified: boolean;
  experience: number;
  bio: { fr: string; en: string };
  services: { fr: string; en: string }[];
  slots: DoctorSlot[];
  expertise: { fr: string; en: string }[];
  practices: DoctorPractice[];
  accessibility: { fr: string; en: string }[];
  hours: DoctorHours[];
  timezone: string;
  prices: DoctorPrice[];
  education: DoctorMilestone[];
  legal: DoctorLegal;
}

type RawDoctor = Omit<
  Doctor,
  "expertise" | "practices" | "accessibility" | "hours" | "timezone" | "prices" | "education" | "legal"
> &
  Partial<Doctor>;

const WEEK: { day: { fr: string; en: string }; ranges: string[] }[] = [
  { day: { fr: "Lundi", en: "Monday" }, ranges: ["09:00–13:00", "15:00–18:00"] },
  { day: { fr: "Mardi", en: "Tuesday" }, ranges: ["09:00–13:00", "15:00–18:00"] },
  { day: { fr: "Mercredi", en: "Wednesday" }, ranges: ["09:00–13:00"] },
  { day: { fr: "Jeudi", en: "Thursday" }, ranges: ["09:00–13:00", "15:00–18:00"] },
  { day: { fr: "Vendredi", en: "Friday" }, ranges: ["09:00–13:00"] },
  { day: { fr: "Samedi", en: "Saturday" }, ranges: [] },
  { day: { fr: "Dimanche", en: "Sunday" }, ranges: [] },
];

const ACCESSIBILITY = [
  { fr: "Accès fauteuil roulant", en: "Wheelchair access" },
  { fr: "Parking à proximité", en: "Parking nearby" },
];

function withDefaults(d: RawDoctor): Doctor {
  const startYear = new Date().getFullYear() - d.experience;
  return {
    ...d,
    expertise: d.expertise ?? [
      d.specialty,
      { fr: "Suivi des maladies chroniques", en: "Chronic disease follow-up" },
      { fr: "Médecine préventive et dépistage", en: "Preventive medicine & screening" },
      { fr: "Vaccination", en: "Vaccination" },
    ],
    practices:
      d.practices ?? [
        {
          name: d.address.split(",")[0]!.trim(),
          kind: { fr: "Cabinet privé", en: "Private practice" },
          address: `${d.address}, ${d.city}, ${d.country}`,
        },
      ],
    accessibility: d.accessibility ?? ACCESSIBILITY,
    hours: d.hours ?? WEEK,
    timezone: d.timezone ?? "WAT (UTC+1)",
    prices:
      d.prices ?? [
        { label: { fr: "Consultation générale", en: "General consultation" }, duration: 30, amount: d.fee },
        { label: { fr: "Suivi / renouvellement", en: "Follow-up / renewal" }, duration: 20, amount: d.fee },
      ],
    education:
      d.education ?? [
        { year: String(startYear), label: { fr: "Doctorat en médecine", en: "Doctor of Medicine" } },
        {
          year: String(startYear + 3),
          label: { fr: `Assistant hospitalier — ${d.city}`, en: `Hospital registrar — ${d.city}` },
        },
        {
          year: String(startYear + 5),
          label: { fr: `Cabinet privé — ${d.city}`, en: `Private practice — ${d.city}` },
        },
      ],
    legal:
      d.legal ?? {
        licenseNumber: `ONM-2024-00${(d.reviews % 900) + 100}`,
        board: { fr: `Ordre des Médecins — ${d.country}`, en: `Medical Council — ${d.country}` },
      },
  };
}

const RAW_DOCTORS: RawDoctor[] = [
  {

    id: "amina-sow",
    name: "Dr Amina Sow",
    initials: "AS",
    specialty: { fr: "Médecine générale", en: "General medicine" },
    city: "Dakar",
    country: "Sénégal",
    address: "12 rue Carnot, Plateau, Dakar",
    languages: ["Français", "Wolof", "English"],
    rating: 4.9,
    reviews: 128,
    fee: "15 000 FCFA",
    teleconsultation: true,
    verified: true,
    experience: 12,
    bio: {
      fr: "Médecin généraliste installée à Dakar depuis 2014, spécialisée dans le suivi des maladies chroniques et la médecine familiale.",
      en: "General practitioner based in Dakar since 2014, focused on chronic disease follow-up and family medicine.",
    },
    services: [
      { fr: "Consultation générale", en: "General consultation" },
      { fr: "Suivi hypertension & diabète", en: "Hypertension & diabetes follow-up" },
      { fr: "Certificats médicaux", en: "Medical certificates" },
    ],
    slots: [
      { day: { fr: "Aujourd'hui", en: "Today" }, times: ["14:30", "15:00", "16:30"] },
      { day: { fr: "Demain", en: "Tomorrow" }, times: ["09:00", "10:30", "11:00", "15:30"] },
    ],
  },
  {
    id: "kwame-mensah",
    name: "Dr Kwame Mensah",
    initials: "KM",
    specialty: { fr: "Cardiologie", en: "Cardiology" },
    city: "Abidjan",
    country: "Côte d'Ivoire",
    address: "Clinique des Deux Plateaux, Abidjan",
    languages: ["Français", "English"],
    rating: 4.8,
    reviews: 94,
    fee: "25 000 FCFA",
    teleconsultation: true,
    verified: true,
    experience: 18,
    bio: {
      fr: "Cardiologue interventionnel, prise en charge de l'insuffisance cardiaque et de l'hypertension artérielle résistante.",
      en: "Interventional cardiologist managing heart failure and resistant hypertension.",
    },
    services: [
      { fr: "Consultation cardiologique", en: "Cardiology consultation" },
      { fr: "Échographie cardiaque", en: "Cardiac ultrasound" },
      { fr: "Électrocardiogramme", en: "Electrocardiogram" },
    ],
    slots: [
      { day: { fr: "Demain", en: "Tomorrow" }, times: ["08:30", "09:15"] },
      { day: { fr: "Jeudi", en: "Thursday" }, times: ["10:00", "11:45", "16:00"] },
    ],
  },
  {
    id: "fatou-keita",
    name: "Dr Fatou Keïta",
    initials: "FK",
    specialty: { fr: "Pédiatrie", en: "Pediatrics" },
    city: "Bamako",
    country: "Mali",
    address: "Cabinet Hamdallaye ACI 2000, Bamako",
    languages: ["Français", "Bambara"],
    rating: 5,
    reviews: 61,
    fee: "12 000 FCFA",
    teleconsultation: false,
    verified: true,
    experience: 9,
    bio: {
      fr: "Pédiatre dédiée au suivi du nourrisson, à la vaccination et à la nutrition infantile.",
      en: "Pediatrician dedicated to infant follow-up, vaccination and child nutrition.",
    },
    services: [
      { fr: "Consultation pédiatrique", en: "Pediatric consultation" },
      { fr: "Vaccination", en: "Vaccination" },
      { fr: "Suivi de croissance", en: "Growth monitoring" },
    ],
    slots: [{ day: { fr: "Aujourd'hui", en: "Today" }, times: ["11:00", "12:00", "17:00"] }],
  },
  {
    id: "jean-mbala",
    name: "Dr Jean Mbala",
    initials: "JM",
    specialty: { fr: "Dermatologie", en: "Dermatology" },
    city: "Yaoundé",
    country: "Cameroun",
    address: "Centre médical Bastos, Yaoundé",
    languages: ["Français", "English"],
    rating: 4.7,
    reviews: 47,
    fee: "20 000 FCFA",
    teleconsultation: true,
    verified: true,
    experience: 14,
    bio: {
      fr: "Dermatologue, prise en charge de l'acné, de l'eczéma et des dermatoses tropicales.",
      en: "Dermatologist treating acne, eczema and tropical skin conditions.",
    },
    services: [
      { fr: "Consultation dermatologique", en: "Dermatology consultation" },
      { fr: "Téléconsultation photo", en: "Photo teleconsultation" },
      { fr: "Petite chirurgie cutanée", en: "Minor skin surgery" },
    ],
    slots: [{ day: { fr: "Vendredi", en: "Friday" }, times: ["09:30", "14:00"] }],
  },
  {
    id: "nadia-benali",
    name: "Dr Nadia Benali",
    initials: "NB",
    specialty: { fr: "Gynécologie", en: "Gynecology" },
    city: "Cotonou",
    country: "Bénin",
    address: "Polyclinique Sainte-Marie, Cotonou",
    languages: ["Français"],
    rating: 4.9,
    reviews: 83,
    fee: "18 000 FCFA",
    teleconsultation: true,
    verified: true,
    experience: 11,
    bio: {
      fr: "Gynécologue-obstétricienne, suivi de grossesse et santé reproductive.",
      en: "Gynecologist-obstetrician, pregnancy follow-up and reproductive health.",
    },
    services: [
      { fr: "Suivi de grossesse", en: "Pregnancy follow-up" },
      { fr: "Échographie obstétricale", en: "Obstetric ultrasound" },
      { fr: "Contraception", en: "Contraception" },
    ],
    slots: [{ day: { fr: "Demain", en: "Tomorrow" }, times: ["10:00", "13:30", "16:15"] }],
  },
  {
    id: "paul-ndiaye",
    name: "Dr Paul Ndiaye",
    initials: "PN",
    specialty: { fr: "Médecine générale", en: "General medicine" },
    city: "Dakar",
    country: "Sénégal",
    address: "Almadies, Dakar",
    languages: ["Français", "Wolof"],
    rating: 4.6,
    reviews: 39,
    fee: "13 000 FCFA",
    teleconsultation: false,
    verified: false,
    experience: 6,
    bio: {
      fr: "Médecin généraliste, consultations de premier recours et bilans de santé.",
      en: "General practitioner offering primary care consultations and health check-ups.",
    },
    services: [
      { fr: "Consultation générale", en: "General consultation" },
      { fr: "Bilan de santé", en: "Health check-up" },
    ],
    slots: [{ day: { fr: "Aujourd'hui", en: "Today" }, times: ["18:00"] }],
  },
];

export const DOCTORS: Doctor[] = RAW_DOCTORS.map(withDefaults);


export function getDoctor(id: string): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// SF Recherche v1.1 — synonym table so "cardio" matches "Cardiologie".
const SYNONYMS: Record<string, string[]> = {
  cardio: ["cardiologie", "cardiology"],
  coeur: ["cardiologie", "cardiology"],
  heart: ["cardiologie", "cardiology"],
  derma: ["dermatologie", "dermatology"],
  peau: ["dermatologie", "dermatology"],
  skin: ["dermatologie", "dermatology"],
  pedia: ["pediatrie", "pediatrics"],
  pediatre: ["pediatrie", "pediatrics"],
  enfant: ["pediatrie", "pediatrics"],
  kids: ["pediatrie", "pediatrics"],
  child: ["pediatrie", "pediatrics"],
  gyneco: ["gynecologie", "gynecology"],
  femme: ["gynecologie", "gynecology"],
  women: ["gynecologie", "gynecology"],
  generaliste: ["medecine generale", "general medicine"],
  gp: ["medecine generale", "general medicine"],
  omnipraticien: ["medecine generale", "general medicine"],
  family: ["medecine generale", "general medicine"],
};

function expandQuery(q: string): string[] {
  if (!q) return [];
  const terms = new Set<string>([q]);
  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (key.startsWith(q) || q.startsWith(key)) values.forEach((v) => terms.add(v));
  }
  return [...terms];
}

/** Single next availability, per spec ("prochaine dispo"). */
export function nextAvailability(d: Doctor): { day: { fr: string; en: string }; time: string } | null {
  const slot = d.slots.find((s) => s.times.length > 0);
  if (!slot) return null;
  return { day: slot.day, time: slot.times[0]! };
}

export function searchDoctors(query: string, city: string): Doctor[] {
  const q = norm(query);
  const c = norm(city);
  const terms = expandQuery(q);
  return DOCTORS.filter((d) => {
    const haystack = norm(
      [d.name, d.specialty.fr, d.specialty.en, ...d.services.flatMap((s) => [s.fr, s.en])].join(" "),
    );
    const place = norm(`${d.city} ${d.country}`);
    const matchesQuery = !q || terms.some((t) => haystack.includes(t));
    return matchesQuery && (!c || place.includes(c));
  });
}

