// TODO Sprint 4 — Replace with real practitioner directory API.
// Prototype dataset powering the public search results + doctor detail pages.

export interface DoctorSlot {
  day: { fr: string; en: string };
  times: string[];
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
}

export const DOCTORS: Doctor[] = [
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

export function searchDoctors(query: string, city: string): Doctor[] {
  const q = norm(query);
  const c = norm(city);
  return DOCTORS.filter((d) => {
    const haystack = norm(
      [d.name, d.specialty.fr, d.specialty.en, ...d.services.flatMap((s) => [s.fr, s.en])].join(" "),
    );
    const place = norm(`${d.city} ${d.country}`);
    return (!q || haystack.includes(q)) && (!c || place.includes(c));
  });
}
