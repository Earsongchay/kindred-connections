export interface PwdRules {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
  noSpace: boolean;
}

export function evaluatePassword(password: string): PwdRules {
  return {
    length: password.length >= 8 && password.length <= 128,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9\s]/.test(password),
    noSpace: password.length > 0 && !/\s/.test(password),
  };
}

export function scorePassword(rules: PwdRules): number {
  return Object.values(rules).filter(Boolean).length;
}
