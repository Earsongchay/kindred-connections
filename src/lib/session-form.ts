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

export const sessionForm = {
  getInscription(): InscriptionFormData | null {
    try {
      const raw = sessionStorage.getItem(KEYS.inscription);
      return raw ? (JSON.parse(raw) as InscriptionFormData) : null;
    } catch {
      return null;
    }
  },
  setInscription(data: InscriptionFormData): void {
    try {
      sessionStorage.setItem(KEYS.inscription, JSON.stringify(data));
    } catch {
      /* noop */
    }
  },
  clearInscription(): void {
    sessionStorage.removeItem(KEYS.inscription);
  },
  getEmailVerified(): boolean {
    return sessionStorage.getItem(KEYS.emailVerified) === "true";
  },
  setEmailVerified(value: boolean): void {
    sessionStorage.setItem(KEYS.emailVerified, String(value));
  },
  getProfile(): Record<string, string> | null {
    try {
      const raw = sessionStorage.getItem(KEYS.profile);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setProfile(data: Record<string, string>): void {
    try {
      sessionStorage.setItem(KEYS.profile, JSON.stringify(data));
    } catch {
      /* noop */
    }
  },
  getFirstName(): string | null {
    return sessionStorage.getItem(KEYS.firstName);
  },
  setFirstName(name: string): void {
    sessionStorage.setItem(KEYS.firstName, name);
  },
  isLangDetected(): boolean {
    return sessionStorage.getItem(KEYS.langDetected) === "true";
  },
  setLangDetected(): void {
    sessionStorage.setItem(KEYS.langDetected, "true");
  },
};
