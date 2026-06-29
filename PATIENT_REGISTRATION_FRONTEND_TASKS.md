# Frontend Tasks — Patient Account Lifecycle (NAZOUNKI SF)

**Source:** NAZOUNKI_SF_PATIENT_REGISTRATION.docx.en.md  
**Spec version:** 1.0 — 2026-05-22  
**Epics:** Epic 1 — Patient Registration · Epic 4 — Profile · Epic 11 — Booking gate

---

## Page 1 — Public Site Navigation — `apps/fueni-public`

- [ ] **"S'inscrire ▾" nav button** — dropdown with two choices: "Je suis patient" → `/inscription`; "Je suis professionnel de santé" → `/inscription-medecin`

---

## Page 2 — Registration (`/inscription`) — `apps/fueni-public`

_(3 steps on a single page flow: Form → SMS OTP → Basic Profile)_

### Step 1 — Registration Form

- [ ] **Page layout**: FUENI logo centered (links to homepage), title "Create my account", no side nav, minimal footer (T&Cs / Privacy Policy / Contact links)
- [ ] **Registration form card** with the following 7 fields + consents:
  - [ ] First name — free text, placeholder `e.g. Aïssatou`, 1–80 chars, letters + hyphens + apostrophes + spaces
  - [ ] Last name — free text, placeholder `e.g. Diop`, same rules as first name
  - [ ] Date of birth — dropdown calendar, format DD/MM/YYYY (FR) / MM/DD/YYYY (EN), year selector by decades; must be ≥ 18 and ≤ 120 years old
  - [ ] Gender — dropdown: Female · Male · Other · Prefer not to answer
  - [ ] Email address — email input, placeholder `e.g. aissatou.diop@example.com`, RFC format validation
  - [ ] Phone: country code selector (flag + code, e.g. 🇸🇳 +221) auto-detected by IP geolocation (default Senegal +221 if detection fails) + numeric phone input, placeholder `e.g. 77 123 45 67`
  - [ ] Password — password field with **visible show/hide eye-icon toggle** (no confirmation field), placeholder `••••••••••••`, 8–128 chars
- [ ] **Password strength indicator** — real-time visual bar (Weak 🔴 / Medium 🟡 / Strong 🟢 / Very strong 💚) + checklist of rules checked off progressively (1 uppercase, 1 lowercase, 1 number, 1 special char)
- [ ] **Consent checkboxes** (both mandatory):
  - [ ] "I accept the General Terms and Conditions of Use" — link opens T&Cs in new tab
  - [ ] "I accept the processing of my personal and medical data in accordance with the Privacy Policy and the GDPR" — link opens Privacy Policy in new tab
  - [ ] Red border on unchecked boxes upon submit attempt
- [ ] **"→ Create my account" submit button** — always clickable, triggers client-side validation on click; shows spinner + disables fields while submitting
- [ ] **"or" separator** + "Already have an account? **Log in**" toggle link → `/login`
- [ ] **Card footer link**: "👤 Are you a healthcare professional? **Pro registration**" → `/inscription-medecin`

#### Inline Validations

- [ ] Date of birth — inline error below field on blur if age < 18: *"You must be 18 years or older to register. Verify the entered date."* + visually disable submit button
- [ ] Email — inline error: *"Invalid email address."* / *"An account already exists with this email. Log in."*
- [ ] Phone — inline error: *"Invalid number for the selected country."* / *"An account already exists with this number. Log in."*
- [ ] Password — rules checklist updates in real time as user types

#### Global Submit Validation

- [ ] Global red banner at top of form: *"Please complete all mandatory fields marked with an asterisk (*)."*
- [ ] Simultaneous triggering of all inline validations
- [ ] Auto-scroll to global banner
- [ ] No account created / no server call if any field fails client-side validation

#### Anti-Bot

- [ ] **Cloudflare Turnstile** invisible CAPTCHA integration on form submit
- [ ] If verification fails 3× consecutively: display *"Security verification failed. Please try again later."* + temporarily block form for this IP (15 min)

---

### Step 2 — SMS OTP Verification

_(§4.2.1 — blocking, immediately after form submit)_

- [ ] **Screen layout**: title "Verify your number", partially masked phone display (last 2 digits visible, dynamic masking per country: `** ** ** XX` / `** *** ** XX` / `** *** *** XX`)
- [ ] **6 individual digit input boxes** — `inputmode="numeric"`, auto-focus on first box, auto-tab on digit entry, filter non-numeric chars in real time
- [ ] **"Verify →" button** — disabled until all 6 boxes filled; no auto-submit (explicit click only)
- [ ] **"Resend code" link** — disabled for 60 s with visible countdown; max 5 resends/hour; message *"You have requested too many resends. Try again in an hour."* when limit hit
- [ ] **"Modify my information" link** — returns to Step 1 with all form fields preserved via `sessionStorage`
- [ ] **Success state** — success indicator animation → smooth transition to Step 3
- [ ] **Error states**:
  - Incorrect code: *"Incorrect code. You have {n} attempts remaining."*
  - 3rd incorrect attempt: *"Too many incorrect attempts. Please start registration over."* + redirect to `/inscription`
  - Expired code (> 5 min): *"Your code has expired."* + "Resend code" button active immediately (no cooldown)

---

### Step 3 — Basic Profile

_(§4.3 — mandatory, no skip, post-OTP before dashboard access)_

- [ ] **Screen layout**: title "Complete your profile", subtitle "Last step (30 seconds)."
- [ ] **Country of residence** — dropdown list, 9 MVP countries pinned at top with flags (Senegal, Ivory Coast, Mali, Benin, Togo, Burkina Faso, Niger, Cameroon, DRC); pre-filled from phone prefix; mandatory
- [ ] **Country pre-fill hint** — display *"ℹ️ Pre-filled based on your phone country code"* below the country/city fields
- [ ] **City** — cascading dropdown from selected country (major cities + "Other/Autre" option that reveals a required free-text field); mandatory; validation error if "Other" is selected but free-text field is empty
- [ ] **Language of communication** — dropdown: French · English, default detected from browser; mandatory
- [ ] **Address** — optional free-text textarea, placeholder `e.g. Sacré-Cœur 3, Villa 12, opposite the pharmacy...`
- [ ] **"Finalize and access my portal ✓" button**
- [ ] **No skip/bypass**: no "Skip for now" button; no alternative path
- [ ] **Global error banner** on submit if mandatory fields missing: *"Please complete all mandatory fields marked with an asterisk (*)."* + auto-scroll

---

## Page 3 — Patient Dashboard (`/espace-patient`) — `apps/fueni-patient`

_(§4.4 + §4.2.2)_

### 3.1 First Login Orientation

- [ ] **Personalized greeting**: "Hello {First Name}!"
- [ ] **"My appointments" empty state card**: message *"You don't have any appointments yet."* + **[ Find a doctor → ]** CTA
- [ ] **"My documents" empty state card**: message *"No documents imported."* + **[ Import a prescription → ]** CTA
- [ ] **"My profile" card with progress badge**: *"Profile completed at {X}%"* + **[ Complete my profile → ]** CTA

### 3.2 Persistent Email Verification Banner

- [ ] **Non-dismissible banner** while `email_verified = false`: *"⚠️ Your email address is not verified yet. Verify it to book appointments and receive your medical documents."* + **[ Verify now ]** button → launches deferred email OTP screen (§3.3)
- [ ] Banner disappears automatically once `email_verified = true`

### 3.3 Deferred Email OTP Screen

_(§4.2.2 — modal/overlay triggered from the banner, settings, or appointment soft-gate)_

- [ ] **Screen layout**: title "Verify your email address", partially masked email display (`a***@example.com`), subtitle *"It expires in 10 minutes."*
- [ ] **6 individual digit input boxes** — same behavior as Step 2 SMS OTP
- [ ] **Resend countdown** — 120 s cooldown (longer than SMS), max 5 resends/hour
- [ ] **Spam/junk folder hint**: *"ℹ Remember to check your spam/junk folder."*
- [ ] **"← Later" button** — closes screen, returns to previous page (or practitioner list if triggered by appointment soft-gate)
- [ ] **Error states** (same as SMS OTP: incorrect code, 3× attempts, expired, rate-limited)
- [ ] **Success state** — in-app banner: *"✅ Your email address is confirmed."* + dismiss persistent dashboard banner

### 3.4 Appointment Booking Soft-Gate (pop-up)

_(§4.2.2 — blocks booking while `email_verified = false`)_

- [ ] **Blocking modal** when patient attempts to book an appointment while `email_verified = false`
- [ ] Message: *"To finalize this appointment, please verify your email address. You will receive the confirmation and medical documents at this address."*
- [ ] **"Verify now"** button → launches deferred email OTP screen (§3.3); on success, resume booking via memorized URL/param
- [ ] **"Later" / cancel** → abandon booking, return to practitioner list; no appointment saved

---

## Page 4 — Settings / Profile (`/espace-patient/profil`) — `apps/fueni-patient`

_(Epic 4 — subsequent sprint)_

### 4.1 Subsequent Profile Completion

- [ ] **Complete address fields**: Address (street, unit, landmark), Zip/Postal code (optional)
- [ ] **Emergency contact fields**: Contact name, Relationship dropdown (Spouse / Child / Parent / Friend / Other), Emergency phone
- [ ] **Notification preferences toggles**:
  - "Receive appointment reminders by SMS" — default ON
  - "Receive appointment reminders by email" — default ON
- [ ] **Profile completion % indicator** — dynamically calculated from all completable fields

### 4.2 Profile Modification

- [ ] **Level 1 — Free modification** (no confirmation): address, zip code, city, emergency contact, language, notification toggles
- [ ] **Level 2 — OTP verification** on new channel:
  - Change phone → new SMS OTP flow
  - Change email → new email OTP flow; if `email_verified = false` at the time of change, any in-flight deferred OTP is invalidated and a new verification cycle starts
  - Change password → old password entry + new password (same policy) + strength indicator
- [ ] **Level 3 — Support request** (no UI workflow in MVP): inform user to contact Nazounki support via email for changes to first name, last name, date of birth, gender, country (display a message/link)

---

## Page 5 — Settings / Security (`/espace-patient/securite`) — `apps/fueni-patient`

- [ ] **Change password section**: old password entry + new password with same policy + strength indicator + confirmation field
- [ ] On successful password change → automatic logout from all devices + redirect to login (session invalidation per §4.9.3)

---

## Page 6 — Login (Keycloakify) — Keycloak theme

_(§4.9.1)_

- [ ] **Single identifier field** — label "Identifier", placeholder *"Email or phone number"*
- [ ] **Auto-detection**: `@` present → treated as email; otherwise → treated as phone (normalized to E.164)
- [ ] **Password field** with show/hide toggle
- [ ] **Error messages**:
  - Format unrecognized: *"Format not recognized — enter a valid email or phone number."*
  - Wrong credentials: *"Incorrect email/phone or password."*
  - Account temporarily locked (Keycloak brute-force after 5 failures): *"Too many failed attempts. Please try again in 15 minutes."*
- [ ] **"Forgot password?" link** → Forgot Password flow (Page 9)
- [ ] If account status is `PENDING_PROFILE_BASE` on login → redirect to Basic Profile screen (Page 2 — Step 3)
- [ ] **Route guard** — direct navigation to any `/espace-patient/*` route while `account_status = PENDING_PROFILE_BASE` redirects to Basic Profile (Page 2 — Step 3), not only the post-login redirect

---

## Page 7 — Forgot Password (Keycloakify) — Keycloak theme

_(§4.9.2)_

- [ ] **Step 1**: email input page — user enters email
- [ ] **Step 2**: 6-digit OTP screen (same component as email OTP, 10-min validity)
  - If `email_verified = false` at this point: successful OTP also marks email as verified
- [ ] **Step 3**: new password + **confirmation field** (unlike registration, reset requires a confirmation field per §4.9.2) + same password policy + strength indicator
- [ ] **Step 4**: automatic login after reset
- [ ] Special case: email not verified → SMS OTP fallback via support (display message; no UI flow in MVP)

---

## Shared Components

- [ ] **Phone country code selector** — flag + code, searchable, default by IP geolocation, `libphonenumber`-based validation
- [ ] **OTP 6-digit input** — reusable for SMS OTP (Page 3), deferred email OTP (§5.3), and forgot password (Page 9)
- [ ] **Password strength indicator** — reusable for registration (Page 2), password reset (Page 9), and password change (Page 7)
- [ ] **Global error banner** — reusable across registration, basic profile, etc.
- [ ] **`sessionStorage` state preservation** — preserve registration form fields across OTP ↔ registration navigation ("Modify my info" flow)
- [ ] **i18n** — all UI strings available in French and English (language toggle per browser detection then user preference)
- [ ] **Responsive design** — all screens fully mobile-responsive; `inputmode="numeric"` on OTP/phone fields
- [ ] **Accessibility** — ARIA labels on OTP inputs, form fields, error announcements for screen readers

---

## Out of Scope (MVP — do NOT implement)

- MFA / 2FA
- Social login (Google, Apple, Facebook)
- Dependent / minor profiles
- Account deletion UI
- Active session management UI (visualise active devices, remote revocation)
- Granular notification preferences (2 toggles are sufficient for MVP)
- HIBP password leak check
- Suspicious activity email alerts / device fingerprinting
- WhatsApp notifications
- GDPR data export (JSON export of personal data, RGPD art. 20 — post-MVP per §4.10)
