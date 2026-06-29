import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export function validatePhone(phone: string, countryCode: string): boolean {
  if (!countryCode || countryCode === "OTHER") {
    return phone.replace(/[\s-]/g, "").length >= 6;
  }
  try {
    return isValidPhoneNumber(phone, countryCode as CountryCode);
  } catch {
    return false;
  }
}
