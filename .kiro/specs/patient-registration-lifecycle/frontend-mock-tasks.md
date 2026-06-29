# Frontend Mock Tasks — Patient Registration Lifecycle

**Scope:** UI-only tasks that require no real backend or API. All flows use simulated state, localStorage/sessionStorage, or hardcoded mock logic.  
**References:** `NAZOUNKI_SF_PATIENT_REGISTRATION.docx.md` · `requirements.md`  
**Priority:** P0 = blocking correctness bug · P1 = spec-required missing feature · P2 = improvement

> **STATUS: ✅ ALL TASKS COMPLETED** — 2026-05-27
>
> Shared utilities created: `src/lib/password.ts` · `src/lib/phone-rules.ts` · `src/lib/session-form.ts` · `src/components/site/OtpVerificationModal.tsx`

---

## P0 — Correctness Bugs (Fix First)

### ✅ T01 · Emergency contact relationship options are wrong

**File:** `src/i18n/locales/fr.ts`, `src/i18n/locales/en.ts`, `src/routes/$locale.espace-patient.profil.tsx`  
**Spec:** §4.5 · Req 14.4

**Problem:** Current code renders `Mère · Père · Conjoint · Autre`.  
**Required:** `Conjoint · Enfant · Parent · Ami · Autre` (both docs agree).

**Fix:**

- Update `fr.ts` `profil.fields` relation keys: `relationSpouse`, `relationChild`, `relationParent`, `relationFriend`, `relationOther`
- Update `en.ts` with matching English labels
- Update the `<select>` in the profile route to use the corrected keys

---

### ✅ T02 · SMS OTP resend cooldown is 42 s instead of 60 s

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.2.1 · Req 9.5

**Problem:** Initial cooldown is hardcoded to `42` seconds.  
**Fix:** Change the initial resend countdown constant to `60` seconds.

---

### ✅ T03 · Forgot password — new password uses weak validation

**File:** `src/routes/$locale.mot-de-passe-oublie.tsx`  
**Spec:** §4.9.2 step 5 · Req 17.9

**Problem:** New password only checks `length ≥ 8`. Spec requires the same 6-rule policy as registration.

**Fix:**

- Reuse the password strength scoring logic from `$locale.inscription.tsx` (extract to a shared util `src/lib/password.ts`)
- Add the real-time rule checklist UI (same component as in inscription, Step 1)
- Block the "Reset" button if strength score < 6
- Add show/hide toggle

---

### ✅ T04 · Forgot password — confirmation field missing

**File:** `src/routes/$locale.mot-de-passe-oublie.tsx`  
**Spec:** §4.9.2 step 5 · Req 17.10

**Problem:** The reset form has one password field. Spec step 5 requires "Saisie du nouveau mot de passe + confirmation".

**Fix:**

- Add a `confirmPassword` field below the new password field
- Block submit if `confirmPassword !== password`
- Show inline error: "Les mots de passe ne correspondent pas."
- Add i18n keys `forgotPwd.newPwd.confirm` and `forgotPwd.newPwd.mismatch` to both locales

---

### ✅ T05 · Data export description says "PDF" instead of "JSON"

**File:** `src/routes/$locale.espace-patient.securite.tsx` (or its i18n key)  
**Spec:** §4.10 · Req 25.2

**Problem:** The export button description mentions PDF. Spec defines export as structured JSON.

**Fix:**

- Update the `securite.export.description` i18n key in `fr.ts` and `en.ts` to reference JSON, not PDF
- Button label can stay "Demander l'export" / "Request export"

---

## P1 — Missing Spec-Required Features

### ✅ T06 · SMS OTP — enforce 3-attempt limit with redirect

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.2.1 · Req 9.4, 9.16–9.18

**Problem:** Currently any 6-digit code except `"000000"` succeeds. The 3-attempt limit is not tracked.

**Mock implementation:**

- Add `attempts` counter in component state, starting at `0`
- On each incorrect code (simulate: codes other than `"123456"` fail):
  - Increment counter
  - Show inline message: `t("inscription.sms.error")` → "Code incorrect. Il vous reste {n} tentatives."
  - Replace `{n}` with `3 - attempts`
- On 3rd failure:
  - Show message: "Trop d'essais incorrects. Veuillez recommencer l'inscription."
  - After 2 seconds, navigate back to Step 1 and reset all form state
- Add i18n keys:
  - `inscription.sms.errorAttempts` = "Code incorrect. Il vous reste {count} tentatives."
  - `inscription.sms.tooManyAttempts` = "Trop d'essais incorrects. Veuillez recommencer l'inscription."

**Mock valid code:** `"123456"` always succeeds. Any other 6-digit code fails.

---

### ✅ T07 · SMS OTP — 5-minute expiry countdown + "code expiré" state

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.2.1 · Req 9.3, 9.19

**Problem:** There is no expiry indication. The spec states OTP is valid for 5 minutes.

**Mock implementation:**

- On entering Step 2, start a `useEffect` countdown from `300` seconds (5 min)
- Display remaining time below the OTP boxes: "Code valide encore {mm:ss}"
- When countdown reaches 0:
  - Disable all 6 input boxes
  - Clear any entered digits
  - Hide the "Code valide" label
  - Show message: "Votre code a expiré."
  - Show "Renvoyer le code" button immediately (no cooldown on expiry per spec)
  - Reset `attempts` counter to 0
- On resend: restart the 300 s countdown and the 60 s resend cooldown
- Add i18n keys:
  - `inscription.sms.expiredMessage` = "Votre code a expiré."
  - `inscription.sms.validFor` = "Code valide encore {time}"

---

### ✅ T08 · SMS OTP — resend rate limit UI (max 5 per hour)

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.2.1 · Req 9.6, 9.20

**Problem:** No resend limit is tracked or communicated.

**Mock implementation:**

- Add `resendCount` state, starting at `0`
- Each time the user clicks "Renvoyer le code", increment `resendCount`
- When `resendCount >= 5`:
  - Hide the resend button
  - Show message: "Vous avez demandé trop de renvois. Réessayez dans une heure."
  - (In mock: this state persists for the component's lifetime, no real 1-hour timer)
- Add i18n key: `inscription.sms.resendLimitReached` = "Vous avez demandé trop de renvois. Réessayez dans une heure."

---

### ✅ T09 · Form data preservation via sessionStorage ("Modifier mes informations")

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.2.1 · Req 35.1–35.6

**Problem:** Clicking "Modifier mes informations" navigates back to Step 1, but all form data is lost because state is in `useState`.

**Implementation:**

- Create a helper `src/lib/session-form.ts` with typed `get` / `set` / `clear` functions wrapping `sessionStorage`
- Key: `"fueni_inscription_form"`
- On every field change in Step 1, write the current form state to `sessionStorage` (exclude password field — Req 35.6)
- On Step 1 mount, read `sessionStorage` and pre-fill fields if data is present
- On "Modifier mes informations" click in Step 2: go back to Step 1 (phone country and number pre-filled)
- After successful Step 3 completion, call `sessionStorage.removeItem("fueni_inscription_form")`
- Serialize as JSON; no encryption needed for mock (note in code that Req 35.7 requires encryption before production)
- Fields to persist: `firstName`, `lastName`, `dob`, `sex`, `email`, `phone`, `countryCode` (NOT `password`, NOT `cgu`/`rgpd` checkboxes)

---

### ✅ T10 · Phone validation: per-country digit rules (client-side, no library)

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** Req 34 · §4.1.4 field 6b

**Problem:** Current regex `/^[0-9\s]{6,}$/` accepts any 6+ digit string. The spec defines exact digit counts per country.

**Mock implementation (no libphonenumber needed):**

Create `src/lib/phone-rules.ts`:

```ts
export const PHONE_RULES: Record<string, { digits: number; prefix: string }> = {
  SN: { digits: 8, prefix: "+221" }, // Sénégal
  CI: { digits: 8, prefix: "+225" }, // Côte d'Ivoire
  ML: { digits: 8, prefix: "+223" }, // Mali
  BJ: { digits: 8, prefix: "+229" }, // Bénin
  TG: { digits: 8, prefix: "+228" }, // Togo
  BF: { digits: 8, prefix: "+226" }, // Burkina Faso
  NE: { digits: 8, prefix: "+227" }, // Niger
  CM: { digits: 9, prefix: "+237" }, // Cameroun
  CD: { digits: 9, prefix: "+243" }, // RDC
};
```

- Strip spaces/dashes from input before validation
- Check `digits stripped === PHONE_RULES[selectedCountry].digits`
- On mismatch: "Numéro invalide pour le pays sélectionné."
- Update the country selector to store a 2-letter country code alongside the dial code

---

### ✅ T11 · Base profile — "Autre" free-text option in city dropdown

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.3.2 · Req 11.7

**Problem:** The city dropdown has no "Autre" fallback option for unlisted cities.

**Implementation:**

- Add `"Autre"` as the last option in every city list (all 9 countries)
- When "Autre" is selected, show a text input below the dropdown: placeholder "Précisez votre ville"
- This text input value is used as the city when submitting the Base Profile
- Required: if "Autre" selected, the text input must be non-empty
- Add i18n key: `inscription.profile.cityOther` = "Précisez votre ville"

---

### ✅ T12 · Browser language detection (client-side)

**File:** `src/routes/$locale.tsx`  
**Spec:** Req 26.3–26.4

**Problem:** TODO comment in `$locale.tsx`: "Sprint 2 — Detect browser language". Language always defaults to `fr`.

**Implementation (client-side only, no SSR change needed for mock):**

- In `$locale.tsx` or in a `useEffect` on the locale route, check `navigator.language` on first visit
- If `navigator.language` starts with `"en"` and the current URL locale is the default `"fr"`, redirect to `"en"`
- Only redirect on first visit: use `sessionStorage.getItem("fueni_lang_detected")` flag to avoid redirect loops
- Set the flag after redirect so it only triggers once per session

---

### ✅ T13 · Email verified local state (banner dismisses after mock verification)

**File:** `src/routes/$locale.espace-patient.index.tsx`, `src/routes/$locale.espace-patient.tsx`  
**Spec:** §4.2.2 · Req 10.9, 10.16

**Problem:** The email verification modal closes but the banner never disappears — `email_verified` is never tracked in state.

**Implementation:**

- Add `emailVerified` to a shared state (use React context or a simple `sessionStorage` flag `"fueni_email_verified"`)
- Dashboard layout (`$locale.espace-patient.tsx`) reads this flag on mount
- When the OTP modal succeeds (any 6-digit code after mock validation), set `emailVerified = true` and store in `sessionStorage`
- When `emailVerified === true`, do NOT render the banner
- Also hide the banner in subsequent visits within the same session

---

### ✅ T14 · Email OTP modal — 3-attempt enforcement + rate limit UI

**File:** `src/routes/$locale.espace-patient.index.tsx`  
**Spec:** §4.2.2 · Req 10.6, 10.17–10.18

**Problem:** The email OTP modal accepts any 6 digits and has no attempt tracking.

**Mock implementation:**

- Add `attempts` state in `EmailOtpModal`
- Mock valid code: `"654321"`
- On wrong code: "Code incorrect. Il vous reste {n} tentatives."
- On 3rd failure: "Trop d'essais incorrects. Réessayez plus tard." — disable inputs, show only "Plus tard" button
- Resend button: appears after 120 s (start countdown on modal open)
- Add `resendCount` — after 5 resends show: "Vous avez demandé trop de renvois. Réessayez dans une heure."

---

### ✅ T15 · CAPTCHA failure UI state (simulated)

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.1.6 · Req 7.4–7.5

**Problem:** Cloudflare Turnstile is not integrated. The spec says 3 consecutive CAPTCHA failures block the form for 15 minutes.

**Mock implementation (no Turnstile SDK yet):**

- Add a hidden dev-only "Simulate CAPTCHA failure" button
- Track `captchaFailures` counter in state
- On 3rd simulated failure:
  - Show error banner: "Vérification de sécurité échouée. Veuillez réessayer plus tard."
  - Disable the submit button
  - Start a 15-minute countdown timer (display: "Formulaire disponible dans {mm:ss}")
  - Re-enable form when countdown reaches 0
- This mock is replaced by real Turnstile integration in Sprint 3

---

### ✅ T16 · Profile completion percentage — calculate from actual fields

**File:** `src/routes/$locale.espace-patient.index.tsx`, `src/routes/$locale.espace-patient.profil.tsx`  
**Spec:** §4.5 · Req 14.9

**Problem:** Profile completion is hardcoded at 40%.

**Implementation:**

- Define the optional fields that contribute to completion (based on §6.3):
  - Address (1 point)
  - Postal code (1 point)
  - Emergency contact name (1 point)
  - Emergency contact phone (1 point)
  - Emergency contact relation (1 point)
- Total: 5 optional fields → each = 20%
- Base profile fields (country, city, language) are always complete (account is ACTIVE) → not counted here
- Store the profile form state in `sessionStorage` (key: `"fueni_profile"`) so the dashboard can read it
- When profile is saved, update `sessionStorage` and recompute the percentage
- Dashboard reads from `sessionStorage` to display the correct %

---

### ✅ T17 · Profile Level 2 "Modify" → mock OTP modal

**File:** `src/routes/$locale.espace-patient.profil.tsx`  
**Spec:** §4.7 · Req 15.5–15.6

**Problem:** Clicking "Modify" on email, phone, or password fields does nothing.

**Mock implementation:**

- Create a reusable `<OtpVerificationModal>` component in `src/components/site/`
- Each Level 2 field "Modify" button opens this modal with a label: "Pour modifier votre {field}, entrez le code envoyé à votre {channel}"
- Mock valid code: `"111111"`
- On success: show an inline editable input for the new value (e.g., new email field)
- Validate the new value (format check only for mock)
- On save: update the displayed value in local component state and show a success toast ("Modification enregistrée")
- For password: show new password + confirm fields (full policy, using the shared util from T03)

---

### ✅ T18 · Soft-gate: block booking when email not verified (mock)

**File:** `src/routes/$locale.espace-patient.index.tsx`  
**Spec:** §4.2.2 · Req 10.12

**Problem:** The "Find a doctor" and "Upload prescription" CTAs navigate or do nothing — they don't check email_verified status.

**Mock implementation:**

- The "Find a doctor" / "Upload prescription" buttons check `sessionStorage.getItem("fueni_email_verified")`
- If `false`: instead of navigating, show the email OTP modal (same as the banner CTA)
- Display the modal with a contextual message: "Pour finaliser ce rendez-vous, veuillez vérifier votre adresse e-mail."
- "Plus tard" in this context should NOT navigate to the booking — it returns the user to the dashboard (no RDV taken)
- Booking/documents destination is mocked (those routes don't exist yet) — navigate to `#` or show a "Bientôt disponible" toast after verification

---

### ✅ T19 · Mobile header menu — wire hamburger button

**File:** `src/components/site/Header.tsx`  
**Spec:** Req 27

**Problem:** The mobile menu button is rendered but clicking it does nothing.

**Implementation:**

- Add `menuOpen` boolean state to `Header`
- Hamburger button toggles `menuOpen`
- When `menuOpen = true`, render a full-screen overlay menu below the header (or slide-in panel) with:
  - Same nav links as desktop (How, Audience, Features, Security, Coverage)
  - Sign in buttons (Patient / Pro)
  - Sign up buttons (Patient / Pro)
  - Language switcher
  - Close button (×) or tap-outside to dismiss
- Animate open/close with a CSS transition

---

## P2 — Improvements

### ✅ T20 · Show "Votre inscription n'a pas été finalisée" state (mock)

**File:** `src/routes/$locale.inscription.tsx`  
**Spec:** §4.3.4 · Req 12.4

**Problem:** If a user restarts registration after an abandoned attempt, there is no indication.

**Mock implementation:**

- On mount of the inscription page, check `sessionStorage` for a `"fueni_inscription_form"` key (from T09)
- If present, show a non-blocking info banner at the top of the form:  
  "Vous avez une inscription incomplète. Vos informations ont été restaurées."
- Pre-fill the form with the saved data

---

### ✅ T21 · Login — "Format non reconnu" error is not displayed

**File:** `src/routes/$locale.login.tsx`  
**Spec:** §4.9.1 · Req 16.11

**Problem:** The login form validates the identifier format but does not visibly display the format error to the user (just returns false from validation).

**Fix:**

- Add an `identifierError` state string
- On submit with invalid format: set `identifierError = t("login.errorFormat")`
- Render the error below the identifier field
- Clear the error on next keystroke

---

### ✅ T22 · Dashboard — personalized greeting uses hardcoded name

**File:** `src/i18n/locales/fr.ts` · `src/routes/$locale.espace-patient.index.tsx`  
**Spec:** §4.4.2 · Req 13.2

**Problem:** The dashboard always says "Bonjour Aïssatou!" regardless of who registered.

**Mock implementation:**

- Save `firstName` to `sessionStorage` during Step 1 of inscription (key: `"fueni_user_firstname"`)
- Dashboard reads `sessionStorage.getItem("fueni_user_firstname")` on mount
- Falls back to the hardcoded "Aïssatou" if nothing is stored (direct URL access)
- Update the greeting to use the dynamic first name

---

### ✅ T23 · Account deletion section — clarify post-MVP status

**File:** `src/routes/$locale.espace-patient.securite.tsx`  
**Spec:** §4.10

**Problem:** The deletion confirmation modal is fully rendered and interactive even though account deletion is post-MVP. This could confuse users in demos.

**Options (pick one with team):**

- **Option A (recommended):** Keep the section visible but disable the "Delete my account" button and add the "post-MVP" badge (consistent with MFA section)
- **Option B:** Remove the confirmation modal logic entirely until post-MVP

---

### ✅ T24 · OTP inputs — paste support

**File:** `src/routes/$locale.inscription.tsx`, `src/routes/$locale.espace-patient.index.tsx`, `src/routes/$locale.mot-de-passe-oublie.tsx`  
**Spec:** Req 27 (mobile support)

**Problem:** Pasting a 6-digit code from SMS/email into the first OTP box does not distribute digits across all 6 inputs.

**Implementation:**

- Add an `onPaste` handler on the first OTP input
- On paste: take the pasted string, strip non-digits, take first 6 characters, distribute one per input
- Auto-focus the 6th input after paste (or the verify button)

---

### ✅ T25 · i18n — add missing translation keys from T06–T23

**File:** `src/i18n/locales/fr.ts`, `src/i18n/locales/en.ts`

Summary of all new i18n keys required by the tasks above:

**`inscription.sms` additions:**

```ts
errorAttempts: "Code incorrect. Il vous reste {count} tentatives.";
tooManyAttempts: "Trop d'essais incorrects. Veuillez recommencer l'inscription.";
expiredMessage: "Votre code a expiré.";
validFor: "Code valide encore {time}";
resendLimitReached: "Vous avez demandé trop de renvois. Réessayez dans une heure.";
```

**`inscription.profile` additions:**

```ts
cityOther: "Précisez votre ville";
restoredBanner: "Vous avez une inscription incomplète. Vos informations ont été restaurées.";
```

**`forgotPwd.newPwd` additions:**

```ts
confirm: "Confirmer le nouveau mot de passe *";
mismatch: "Les mots de passe ne correspondent pas.";
```

**`profil.fields` corrections:**

```ts
// Replace: relationMother, relationFather
// With:
relationSpouse: "Conjoint";
relationChild: "Enfant";
relationParent: "Parent";
relationFriend: "Ami";
relationOther: "Autre";
```

**`dashboard.emailOtp` additions:**

```ts
errorAttempts: "Code incorrect. Il vous reste {count} tentatives.";
tooManyAttempts: "Trop d'essais incorrects. Réessayez plus tard.";
resendLimitReached: "Vous avez demandé trop de renvois. Réessayez dans une heure.";
softGateTitle: "Vérifiez votre adresse e-mail";
softGateDesc: "Pour finaliser ce rendez-vous, veuillez vérifier votre adresse e-mail. Vous recevrez la confirmation et les documents médicaux à cette adresse.";
```

**`securite.export` fix:**

```ts
// fr: change description to reference JSON, not PDF
description: "Export JSON structuré (profil, RDV, documents, notifications) — droit à la portabilité RGPD (art. 20). Lien sécurisé valable 7 jours envoyé par e-mail.";
```

---

## Shared Utilities to Create

| File                                           | Purpose                            | Used by            |
| ---------------------------------------------- | ---------------------------------- | ------------------ |
| `src/lib/password.ts`                          | 6-rule password scoring function   | T03, T17           |
| `src/lib/phone-rules.ts`                       | Per-country digit count rules      | T10                |
| `src/lib/session-form.ts`                      | sessionStorage typed get/set/clear | T09, T13, T16, T22 |
| `src/components/site/OtpVerificationModal.tsx` | Reusable 6-digit OTP modal         | T14, T17           |

---

## Implementation Order (Suggested)

```
Week 1 — Bugs & Quick Wins
  T01  Emergency contact options (15 min)
  T02  OTP timer 42s → 60s (5 min)
  T05  Export PDF → JSON (5 min)
  T25  i18n keys (30 min)

Week 1 — Shared Utilities
  T03 (+ password.ts util)
  T09 (+ session-form.ts util)
  T10 (+ phone-rules.ts util)

Week 2 — OTP Flows
  T04  Forgot password confirmation field
  T06  SMS OTP 3-attempt limit + redirect
  T07  SMS OTP 5-min expiry countdown
  T08  SMS OTP resend rate limit UI
  T14  Email OTP modal enforcement (+ OtpVerificationModal.tsx)
  T17  Profile Level 2 OTP modal

Week 2 — State & UX
  T11  City "Autre" option
  T12  Browser language detection
  T13  email_verified local state
  T15  CAPTCHA failure UI (dev mock)
  T16  Profile completion % dynamic
  T18  Soft-gate before booking

Week 3 — Polish
  T19  Mobile header menu
  T20  Restored inscription banner
  T21  Login format error display
  T22  Dashboard dynamic name
  T23  Account deletion clarification
  T24  OTP paste support
```

---

## Out of Scope for This Document

These require real backend/API and are tracked separately (Sprint 3–4):

- Keycloak authentication integration
- Africa's Talking SMS OTP delivery
- Brevo email OTP delivery
- Cloudflare Turnstile real token validation
- Phone/email uniqueness check against database
- Rate limiting at server level
- Session token management
- Audit logging
- Abandoned account cleanup (J+7 job)
- Inactivity cleanup (J+335/365 jobs)
- RGPD JSON export generation
- Welcome SMS on activation
- libphonenumber-js full validation
- Appointment booking (Epic 11)
- Document management (Epic 5)
