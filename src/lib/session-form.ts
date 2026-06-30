// NOTE: Req 35.7 requires encryption before production.
export interface InscriptionFormData {
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  email: string;
  phone: string;
  countryCode: string;
}

const KEYS = {
  inscription: "fueni_inscription_form",
  emailVerified: "fueni_email_verified",
  profile: "fueni_profile",
  firstName: "fueni_user_firstname",
  langDetected: "fueni_lang_detected",
} as const;

// SSR-safe accessor — sessionStorage only exists in the browser.
function store(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const sessionForm = {
  getInscription(): InscriptionFormData | null {
    try {
      const raw = store()?.getItem(KEYS.inscription);
      return raw ? (JSON.parse(raw) as InscriptionFormData) : null;
    } catch {
      return null;
    }
  },
  setInscription(data: InscriptionFormData): void {
    try {
      store()?.setItem(KEYS.inscription, JSON.stringify(data));
    } catch {
      /* noop */
    }
  },
  clearInscription(): void {
    store()?.removeItem(KEYS.inscription);
  },
  getEmailVerified(): boolean {
    return store()?.getItem(KEYS.emailVerified) === "true";
  },
  setEmailVerified(value: boolean): void {
    store()?.setItem(KEYS.emailVerified, String(value));
  },
  getProfile(): Record<string, string> | null {
    try {
      const raw = store()?.getItem(KEYS.profile);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setProfile(data: Record<string, string>): void {
    try {
      store()?.setItem(KEYS.profile, JSON.stringify(data));
    } catch {
      /* noop */
    }
  },
  getFirstName(): string | null {
    return store()?.getItem(KEYS.firstName) ?? null;
  },
  setFirstName(name: string): void {
    store()?.setItem(KEYS.firstName, name);
  },
  isLangDetected(): boolean {
    return store()?.getItem(KEYS.langDetected) === "true";
  },
  setLangDetected(): void {
    store()?.setItem(KEYS.langDetected, "true");
  },
};
