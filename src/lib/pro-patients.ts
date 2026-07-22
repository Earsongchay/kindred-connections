// TODO Sprint 3-4 — Replace with real API data. Prototype dataset for the
// practitioner space (patients list + medical records).

export type Sex = "F" | "M";

export interface ProPatient {
  id: string;
  initials: string;
  name: string;
  age: number;
  sex: Sex;
  phone: string;
  lastVisit: { date: string; reasonFr: string; reasonEn: string } | null;
  nextAppt: { date: string; reasonFr: string; reasonEn: string } | null;
  documents: number;
  newThisMonth?: boolean;
  allergyFr?: string;
  allergyEn?: string;
  history: Consultation[];
}

export interface Consultation {
  date: string;
  reasonFr: string;
  reasonEn: string;
  diagnosisFr: string;
  diagnosisEn: string;
  notesFr: string;
  notesEn: string;
  prescriptions: string[];
}

export const PRO_PATIENTS: ProPatient[] = [
  {
    id: "mariam-diallo",
    initials: "MD",
    name: "Mariam Diallo",
    age: 34,
    sex: "F",
    phone: "+221 77 123 45 67",
    lastVisit: { date: "02 juil. 2026", reasonFr: "Consultation générale", reasonEn: "General consultation" },
    nextAppt: { date: "15 juil. 2026", reasonFr: "Contrôle", reasonEn: "Check-up" },
    documents: 3,
    newThisMonth: true,
    allergyFr: "Pénicilline",
    allergyEn: "Penicillin",
    history: [
      {
        date: "02 juil. 2026",
        reasonFr: "Consultation générale",
        reasonEn: "General consultation",
        diagnosisFr: "Rhinopharyngite aiguë",
        diagnosisEn: "Acute nasopharyngitis",
        notesFr: "État général conservé. Fièvre à 38,2 °C, rhinorrhée. Auscultation libre.",
        notesEn: "General state preserved. Fever 38.2 °C, rhinorrhea. Clear auscultation.",
        prescriptions: ["Paracétamol 1 g × 3/j — 5 j", "Sérum physiologique — nez"],
      },
      {
        date: "12 mai 2026",
        reasonFr: "Suivi hypertension",
        reasonEn: "Hypertension follow-up",
        diagnosisFr: "HTA équilibrée",
        diagnosisEn: "Controlled hypertension",
        notesFr: "TA 130/80. Bonne observance. Poursuite du traitement.",
        notesEn: "BP 130/80. Good adherence. Treatment continued.",
        prescriptions: ["Amlodipine 5 mg — 3 mois"],
      },
    ],
  },
  {
    id: "ousmane-sow",
    initials: "OS",
    name: "Ousmane Sow",
    age: 52,
    sex: "M",
    phone: "+221 76 908 11 22",
    lastVisit: { date: "28 juin 2026", reasonFr: "Suivi hypertension", reasonEn: "Hypertension follow-up" },
    nextAppt: { date: "18 juil. 2026", reasonFr: "Suivi hypertension", reasonEn: "Hypertension follow-up" },
    documents: 1,
    history: [
      {
        date: "28 juin 2026",
        reasonFr: "Suivi hypertension",
        reasonEn: "Hypertension follow-up",
        diagnosisFr: "HTA équilibrée",
        diagnosisEn: "Controlled hypertension",
        notesFr: "TA 128/82. Traitement bien toléré.",
        notesEn: "BP 128/82. Treatment well tolerated.",
        prescriptions: ["Ramipril 5 mg — 3 mois"],
      },
    ],
  },
  {
    id: "awa-faye",
    initials: "AF",
    name: "Awa Faye",
    age: 29,
    sex: "F",
    phone: "+221 78 445 67 89",
    lastVisit: { date: "21 juin 2026", reasonFr: "Téléconsultation", reasonEn: "Telehealth" },
    nextAppt: { date: "22 juil. 2026", reasonFr: "Téléconsultation", reasonEn: "Telehealth" },
    documents: 1,
    newThisMonth: true,
    history: [
      {
        date: "21 juin 2026",
        reasonFr: "Téléconsultation",
        reasonEn: "Telehealth",
        diagnosisFr: "Migraine sans aura",
        diagnosisEn: "Migraine without aura",
        notesFr: "Céphalées récurrentes. Pas de signe de gravité.",
        notesEn: "Recurrent headaches. No warning signs.",
        prescriptions: ["Ibuprofène 400 mg — au besoin"],
      },
    ],
  },
  {
    id: "ibrahima-ba",
    initials: "IB",
    name: "Ibrahima Bâ",
    age: 41,
    sex: "M",
    phone: "+221 77 220 33 44",
    lastVisit: { date: "15 juin 2026", reasonFr: "Consultation générale", reasonEn: "General consultation" },
    nextAppt: null,
    documents: 2,
    history: [
      {
        date: "15 juin 2026",
        reasonFr: "Consultation générale",
        reasonEn: "General consultation",
        diagnosisFr: "Lombalgie commune",
        diagnosisEn: "Common low back pain",
        notesFr: "Douleur mécanique. Pas de déficit neurologique.",
        notesEn: "Mechanical pain. No neurological deficit.",
        prescriptions: ["Paracétamol 1 g × 3/j — 7 j", "Kinésithérapie — 10 séances"],
      },
    ],
  },
  {
    id: "fatou-ndiaye",
    initials: "FN",
    name: "Fatou Ndiaye",
    age: 38,
    sex: "F",
    phone: "+221 70 556 77 88",
    lastVisit: { date: "10 juin 2026", reasonFr: "Suivi grossesse", reasonEn: "Pregnancy follow-up" },
    nextAppt: { date: "24 juil. 2026", reasonFr: "Suivi grossesse", reasonEn: "Pregnancy follow-up" },
    documents: 1,
    history: [
      {
        date: "10 juin 2026",
        reasonFr: "Suivi grossesse",
        reasonEn: "Pregnancy follow-up",
        diagnosisFr: "Grossesse évolutive — 22 SA",
        diagnosisEn: "Ongoing pregnancy — 22 weeks",
        notesFr: "Bilan normal. Prochaine échographie planifiée.",
        notesEn: "Normal check-up. Next ultrasound scheduled.",
        prescriptions: ["Acide folique — poursuite", "Fer — 1/j"],
      },
    ],
  },
  {
    id: "modou-cisse",
    initials: "MC",
    name: "Modou Cissé",
    age: 63,
    sex: "M",
    phone: "+221 76 112 44 55",
    lastVisit: { date: "30 mai 2026", reasonFr: "Renouvellement", reasonEn: "Renewal" },
    nextAppt: null,
    documents: 1,
    history: [
      {
        date: "30 mai 2026",
        reasonFr: "Renouvellement",
        reasonEn: "Renewal",
        diagnosisFr: "Diabète type 2 équilibré",
        diagnosisEn: "Controlled type 2 diabetes",
        notesFr: "HbA1c 6,8 %. Renouvellement du traitement.",
        notesEn: "HbA1c 6.8%. Treatment renewed.",
        prescriptions: ["Metformine 1000 mg × 2/j — 3 mois"],
      },
    ],
  },
  {
    id: "rokhaya-diop",
    initials: "RD",
    name: "Rokhaya Diop",
    age: 47,
    sex: "F",
    phone: "+221 77 889 00 11",
    lastVisit: { date: "22 mai 2026", reasonFr: "Consultation générale", reasonEn: "General consultation" },
    nextAppt: null,
    documents: 0,
    history: [
      {
        date: "22 mai 2026",
        reasonFr: "Consultation générale",
        reasonEn: "General consultation",
        diagnosisFr: "Anémie ferriprive",
        diagnosisEn: "Iron-deficiency anemia",
        notesFr: "Asthénie. Bilan martial en cours.",
        notesEn: "Fatigue. Iron work-up ongoing.",
        prescriptions: ["Fer — 1/j — 3 mois"],
      },
    ],
  },
  {
    id: "samba-gueye",
    initials: "SG",
    name: "Samba Gueye",
    age: 36,
    sex: "M",
    phone: "+221 78 334 55 66",
    lastVisit: { date: "14 mai 2026", reasonFr: "Téléconsultation", reasonEn: "Telehealth" },
    nextAppt: null,
    documents: 2,
    history: [
      {
        date: "14 mai 2026",
        reasonFr: "Téléconsultation",
        reasonEn: "Telehealth",
        diagnosisFr: "Dermatite de contact",
        diagnosisEn: "Contact dermatitis",
        notesFr: "Éruption localisée. Éviction de l'allergène conseillée.",
        notesEn: "Localized rash. Allergen avoidance advised.",
        prescriptions: ["Crème corticoïde — 7 j"],
      },
    ],
  },
  {
    id: "khady-toure",
    initials: "KT",
    name: "Khady Touré",
    age: 25,
    sex: "F",
    phone: "+221 70 778 22 33",
    lastVisit: { date: "03 mai 2026", reasonFr: "Consultation générale", reasonEn: "General consultation" },
    nextAppt: null,
    documents: 0,
    history: [
      {
        date: "03 mai 2026",
        reasonFr: "Consultation générale",
        reasonEn: "General consultation",
        diagnosisFr: "Angine virale",
        diagnosisEn: "Viral sore throat",
        notesFr: "Repos et hydratation. Pas d'antibiotique.",
        notesEn: "Rest and hydration. No antibiotics.",
        prescriptions: ["Paracétamol 1 g × 3/j — 5 j"],
      },
    ],
  },
  {
    id: "aliou-ndao",
    initials: "AN",
    name: "Aliou Ndao",
    age: 58,
    sex: "M",
    phone: "+221 76 445 88 99",
    lastVisit: { date: "27 avr. 2026", reasonFr: "Suivi diabète", reasonEn: "Diabetes follow-up" },
    nextAppt: null,
    documents: 1,
    history: [
      {
        date: "27 avr. 2026",
        reasonFr: "Suivi diabète",
        reasonEn: "Diabetes follow-up",
        diagnosisFr: "Diabète type 2",
        diagnosisEn: "Type 2 diabetes",
        notesFr: "Glycémie à jeun élevée. Renfort des mesures hygiéno-diététiques.",
        notesEn: "High fasting glucose. Reinforced lifestyle measures.",
        prescriptions: ["Metformine 850 mg × 2/j — 3 mois"],
      },
    ],
  },
  {
    id: "mame-seck",
    initials: "MS",
    name: "Mame Seck",
    age: 31,
    sex: "F",
    phone: "+221 77 664 22 10",
    lastVisit: { date: "19 avr. 2026", reasonFr: "Consultation générale", reasonEn: "General consultation" },
    nextAppt: null,
    documents: 0,
    newThisMonth: true,
    history: [
      {
        date: "19 avr. 2026",
        reasonFr: "Consultation générale",
        reasonEn: "General consultation",
        diagnosisFr: "Gastro-entérite",
        diagnosisEn: "Gastroenteritis",
        notesFr: "Réhydratation. Évolution favorable.",
        notesEn: "Rehydration. Favorable outcome.",
        prescriptions: ["Soluté de réhydratation — 2 j"],
      },
    ],
  },
  {
    id: "babacar-dieng",
    initials: "BD",
    name: "Babacar Dieng",
    age: 44,
    sex: "M",
    phone: "+221 78 220 66 77",
    lastVisit: { date: "11 avr. 2026", reasonFr: "Suivi cardiologique", reasonEn: "Cardiology follow-up" },
    nextAppt: null,
    documents: 2,
    history: [
      {
        date: "11 avr. 2026",
        reasonFr: "Suivi cardiologique",
        reasonEn: "Cardiology follow-up",
        diagnosisFr: "Arythmie stable",
        diagnosisEn: "Stable arrhythmia",
        notesFr: "ECG stable. Poursuite de la surveillance.",
        notesEn: "Stable ECG. Continued monitoring.",
        prescriptions: ["Bisoprolol 2,5 mg — 3 mois"],
      },
    ],
  },
];

export const PRO_PATIENT_STATS = {
  total: 128,
  newThisMonth: 6,
  upcoming: 4,
};
