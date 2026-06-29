# Functional Specification — Patient Account Lifecycle

**Project:** FUENI MVP
**Client:** Nazounki
**Prepared by:** Namchhoen VENG — PM/PO, Paris Partners
**Version:** 1.1 — Iteration after partial client validation
**Date:** 2026-05-28
**Status:** Decisions D3-D12 approved by Nazounki (2026-05-27) · D1 in progress · D2 drafting

**Recipients:** Nazounki Direction, Paris Partners Direction, Technical team

---

## Version history

| Version | Date | Author | Main changes |
|---|---|---|---|
| **1.1** | **2026-05-28** | Namchhoen VENG | **Post-review iteration.** • Approval of decisions **D3 through D12** by Nazounki on 2026-05-27. • Added decision **D12**: "🌍 Other" option on the phone country code to onboard foreign patients present in an MVP country (service area still carried by the §4.3 Country field). • Field **Sex → Sex at birth** with two values only (Male · Female) — legal identity field for clinical relevance. • Field **Country of residence → Country** (Base profile §4.3), list strictly limited to the 9 MVP countries, with inheritance rule from the phone country code. • Phone country code default: if IP geolocation does not match one of the 9 countries → "Choose..." (no more Senegal fallback). • **Country moved from Level 3 → Level 2** in the profile modification mechanism (§4.7) — OTP confirmation instead of email request to support. • §4.4 dual-tagged **Epic 1 (activation) + Epic 4 (Dashboard)** to make the boundary between the two epics explicit. • Tag **Epic 1 — Patient Registration** added to §4.1, §4.2, §4.3 for backlog traceability. • **Cloudflare Turnstile** switched from `invisible` to `managed` mode (§4.1.6 + R6) — simpler integration, better tolerance to false positives in the African context (shared IPs, cybercafés, VPN). • **R10 reworded** to reflect the dual constraint: §4.1 phone country code = 9 countries + "Other"; §4.3 Country = strictly 9 countries. |
| 1.0 | 2026-05-22 | Namchhoen VENG | Initial version submitted for Nazounki validation. |

---

## 1. Summary

This specification covers **the entire lifecycle of a patient account on FUENI**, from initial registration to eventual account deletion. It includes all intermediate steps: registration (§4.1) with identity (first name, last name, date of birth, sex at birth), phone number and email both required, phone verification by SMS OTP at registration + email verification by deferred OTP (§4.2), mandatory base profile completion — country, city, language — with no bypass (§4.3), activation and arrival on the dashboard with in-context orientation (§4.4), later profile completion (§4.5), practitioner responsibility for identity verification at the consultation (§4.6), modification of personal information (§4.7), management of dependent profiles — post-MVP (§4.8), account security (§4.9), and a GDPR-compliant deletion policy (§4.10).

The document describes the **complete behaviour of the feature** independently of the delivery schedule. Items explicitly deferred to a later phase are flagged with the "post-MVP" label in the relevant sections.

This approach ensures all product decisions are taken consistently from the outset, avoiding fragmentation of the specification across multiple documents.

---

## 2. Target audience and business value

| Aspect | Detail |
|---|---|
| **End user** | Any person aged 18+ residing in one of the 9 MVP target countries (UEMOA + Cameroon + DRC) wishing to manage their health online |
| **Typical profile** | Adult equipped with a smartphone and an email address, wishing to book appointments, store medical documents (prescriptions, reports) and communicate with their doctors digitally |
| **Value for FUENI / Nazounki** | Mass B2C acquisition: publicly exposed practitioner directory, open sign-up, minimal friction to maximise conversion. Patients feed the platform's usage value on the doctor side. |
| **Value for the patient** | Full registration in under 3 minutes (no payment, no manual validation), immediate access to the doctor directory, secure storage of prescriptions and lab results, appointment booking in a few clicks |

---

## 3. Complete patient account lifecycle

```
                          ┌──────────────────────────────┐
                          │   Visit to the public site    │
                          │   (directory, home page)      │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.1 REGISTRATION           │
                          │   First name + Last name      │
                          │   + Date of birth (≥ 18)      │
                          │   + Sex at birth              │
                          │   + Phone + Email             │
                          │   + Password                  │
                          │   + Consents                  │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.2 SMS OTP VERIFICATION   │
                          │   Phone only                  │
                          │   6 digits, 5 min             │
                          │   Email → Deferred OTP        │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.3 BASE PROFILE           │
                          │   Country + City + Language   │
                          │   Mandatory, no bypass        │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.4 ACTIVATION             │
                          │   Account ACTIVE              │
                          │   Dashboard + email banner    │
                          │   + empty states              │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   DAILY USAGE                 │
                          │   - Doctor search             │
                          │   - Document management       │
                          │   - Profile viewing           │
                          └──────────────┬───────────────┘
                                         │
                ┌────────────────────────┼───────────────────────┐
                │                        │                       │
                ▼                        ▼                       ▼
   ┌─────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐
   │ §4.5 Later profile   │  │ §4.6 Identity        │  │ §4.7 Profile         │
   │ completion           │  │ verification         │  │ modification         │
   │                      │  │ = practitioner       │  │ (3 levels based on   │
   │                      │  │ responsibility       │  │ sensitivity)         │
   └─────────────────────┘  └──────────────────────┘  └─────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.8 Dependent profiles     │
                          │   (post-MVP — minor children, │
                          │   parents under guardianship) │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.9 Account security       │
                          │   - Login (email or phone)    │
                          │   - Password reset            │
                          │   - MFA → post-MVP (SF-LOGIN) │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   §4.10 Account deletion      │
                          │   (voluntary, 2 steps,        │
                          │   pseudonymization at D+30,   │
                          │   record retention 20 years)  │
                          └──────────────────────────────┘
```

---

## 4. Detail by step

### 4.1 Registration *(Epic 1 — Patient Registration)*

The patient accesses the registration form from the public site. Registration is free, open to the public and entirely self-service — no prior invitation is required.

#### 4.1.1 Entry points

The patient can reach the registration page through several channels:

| Source | Behaviour |
|---|---|
| **Top navigation bar — "Sign up ▾" button → choice "I am a patient"** | Direct redirect to `/inscription`. The choice "I am a healthcare professional" in the same menu leads to `/inscription-medecin`. |

**Note**: the "Patient area" and "Professional area" buttons in the top navigation bar of the prototype are **login entry points** (already registered) and **not registration entry points**. They route to `/login` with the audience pre-selected.

#### 4.1.2 Structure of the registration page

The registration page is deliberately **clean and focused** on the action. In line with the validated prototype (`02-patient-signup.html`), the structure is as follows:

- **Page header**: FUENI logo (link back to home) centred, page title "Create my account".
- **Central card (form)**: a single visual block bringing together all registration fields (see §4.1.4), the real-time password strength indicator with a bullet list of rules ticked off as they are met (see §4.1.4 row 7b), the consent checkboxes (see §4.1.5), and the **primary submit button "→ Create my account"**.
- **"or" separator under the button**, then a toggle link: *"Already have an account? **Log in**"* (to `/login`).
- **Card footer — pro registration link**: *"👤 Are you a healthcare professional? **Pro registration**"* (to `/inscription-medecin`). Allows a visitor who landed on the wrong registration page to switch to the other audience.
- **No side navigation menu**: no distractions that could cause the ongoing registration to be abandoned.
- **Minimal page footer**: copyright notice + Terms of Use / Privacy Policy / Contact links (aligned with the public site footer).

The **word "Sign up"** is reserved for the top navigation bar button (entry point), while the **form submit button** uses *"Create my account"* — a more engaging wording, clearer about the terminal action.

#### 4.1.3 Registration channels — Phone and email both required

In line with the standards of the digital medical industry (cf. reference platforms in Europe and beyond) and the validated prototype, FUENI requires **both channels** at patient registration:

| Channel | Role |
|---|---|
| **Phone number** | Verified by SMS OTP at registration. Used for urgent notifications (appointment reminders, medical alerts), as an **alternative login identifier** (see §4.9.1), and for account recovery. |
| **Email address** | Verified by **deferred OTP** (see §4.2.2), triggered by the patient themselves or by soft-gate before a sensitive action (any appointment booking, password reset). Non-blocking at registration. Used as the **primary login identifier** (see §4.9.1), for receiving medical documents (prescriptions, reports), invoices, and password recovery. |
| **Password** | Required. Used for login. The patient can log in with **their email OR their phone number** + password (see §4.9.1 and the future **SF-LOGIN**). |

**Why require both?**

- **Identifier stability**: a phone number may change (carrier change, phone loss), an email address is more stable over time
- **Complementary channels**: phone for the urgent (short SMS), email for the formal (documents, invoices)
- **Mutual recovery**: if access to one channel is lost, the other takes over (simpler support-based recovery procedure)
- **B2C health SaaS standard**: consistent with current industry practices

#### 4.1.4 Fields collected at registration

Registration gathers **legal identity** information (first name, last name, date of birth, sex at birth), **communication channels** (phone, email) and the **password**. Location information (country, city) and the communication language are collected **just after OTP verification** during the Base profile (see §4.3). Optional enrichments (full address, emergency contact, notification preferences) are part of later profile completion (§4.5).

| # | Field | Format / placeholder | Validation |
|---|---|---|---|
| 1 | **First name** | Free text, placeholder *"e.g. Aïssatou"* | 1 to 80 characters, letters + hyphens + apostrophes + spaces only |
| 2 | **Last name** | Free text, placeholder *"e.g. Diop"* | 1 to 80 characters, same rules as first name |
| 3 | **Date of birth** | Drop-down calendar, format DD/MM/YYYY (FR) or MM/DD/YYYY (EN). Year selector by decades to avoid long scrolling. | **≥ 18 years** at today's date, ≤ 120 years, past date only. **Inline error** displayed under the field if < 18: *"You must be 18 or older to sign up."* |
| 4 | **Sex at birth** | Drop-down list: `Male` · `Female` (two values only) | One option selected. Legal identity field used for medical matching (clinical relevance) — not a gender identity field. |
| 5 | **Email address** | Email field, placeholder *"e.g. aissatou.diop@example.com"* | Valid RFC format, no blocklist (Gmail, Yahoo, etc. accepted). **Inline error** if invalid format: *"Invalid email address."* If already used: *"An account already exists with this email. Log in."* |
| 6a | **Country code (phone)** | Flag + code selector: the **9 MVP countries** at the top (🇸🇳 +221, 🇨🇮 +225, 🇲🇱 +223, 🇧🇯 +229, 🇹🇬 +228, 🇧🇫 +226, 🇳🇪 +227, 🇨🇲 +237, 🇨🇩 +243) + **"🌍 Other"** option at the bottom for manual entry of a foreign country code (e.g. +33, +1, +44). Auto-detected by IP geolocation if the detected country is one of the 9; otherwise defaults to **"Choose..."** (patient must select explicitly). | E.164. If **"Other"** is selected, a "Country code" field appears for manual entry in `+XX` or `+XXX` format (validated via libphonenumber). |
| 6b | **Phone number** | Numeric-only field, placeholder *"e.g. 77 123 45 67"* (decorative spaces stripped on submission) | Valid E.164 format for the selected country (libphonenumber). If country code = "Other", validation based on the manually entered code. **Inline error** if length is incorrect: *"Invalid number for the selected country code."* If already used: *"An account already exists with this number. Log in."* **UX warning** if country code is outside the 9 MVP countries: *"SMS delivery may take a few minutes for numbers outside the service area."* |
| 7a | **Password** | Password field with a **clearly visible show/hide (eye) toggle** — the toggle replaces the confirmation field. Placeholder *"•••••••••••• "* | **8 to 128 characters**, ≥ 1 uppercase + ≥ 1 lowercase + ≥ 1 digit + ≥ 1 special character (any printable non-alphanumeric character), no space. Hashing **Argon2id** on the back-end (native Keycloak). |
| 7b | **Password strength indicator** | Real-time visual bar: 🔴 Weak · 🟡 Medium · 🟢 Strong · 💚 Very strong + bullet list of rules to meet (each rule ticked off as it is met) | — |

**Validation model**: on form submission (click on *"Create my account"*), if **a single** required field is empty or invalid:
- Display of a **global error banner** at the top of the form: *"Please complete all required fields marked with an asterisk (*)."*
- **Triggering of inline validations** (DOB, email, phone, password) to point out the field(s) in error under each affected field
- Automatic scroll to the global banner
- The password policy remains permanently visible under the field with dynamic ticks

No specific messages like *"First name is required"*, *"Last name is required"* etc. — the asterisk (*) on each label is enough visually, and the global banner is explicit.

**Total registration: 7 main fields** + consents. Registration in ~ 1 minute on this screen (~ 2 min 30 for the full onboarding §4.1 → §4.2 → §4.3).

**No confirmation fields** (neither email nor password) — decision aligned on B2C health standards (the reference players of the B2C health sector do not use confirmation) and on NIST SP 800-63B recommendations. Reliability is based on:
- **Clearly visible "Show password" toggle** → the user verifies visually
- **Deferred OTP on the email** (§4.2.2) → any typo on the email is caught at the first verification attempt
- **Persistent "Verify your email" banner** → constant reminder as long as `email_verified = false`
- **Password reset via OTP** (§4.9.2) → safety net in case of input error

**Age ≥ 18 validation (inline)**: as soon as the patient leaves the "Date of birth" field, age is computed client-side. If age < 18:
- An inline error message appears under the field: *"You must be 18 or older to sign up. Check the date you entered."*
- The **"→ Create my account"** button is visually disabled (greyed out)
- The patient can freely correct the date, **no account is created** at this stage (no risk of deferred cleanup or brutal deletion since the validation happens before the SMS OTP)

This upstream validation before the SMS OTP eliminates the entire operational risk of minor accounts created by mistake — there is no longer any deferred cleanup to manage on the back-end for the < 18 (see §4.3.4 for general registration abandonment cleanup).

#### 4.1.5 Legal notices and consents

Below the fields, two mandatory checkboxes:

```
[ ] I accept the Terms of Use (CGU)
    [Terms of Use link — opens in a new tab]

[ ] I accept the processing of my personal and medical data
    in accordance with the Privacy Policy and the GDPR.
    [Privacy Policy link — opens in a new tab]
```

- **Both boxes are mandatory** — a red frame appears if they are not ticked at submission
- Links to the legal documents open in a new tab so as not to break the entry in progress
- Marketing communications opt-in (newsletter, offers) is **out of scope** of the registration form. If Nazounki wishes to offer it, it will be via a **separate opt-in** in the account settings after registration (consistent with GDPR best practices: granular and revocable consent).

**Note**: the final Terms of Use and Privacy Policy texts **are to be provided by Nazounki** (legal counsel or equivalent — see decision D1). As long as these texts are not available, the links point to placeholders and the legal content remains to be integrated before production release.

#### 4.1.6 Anti-bot protection

**Cloudflare Turnstile in `managed` mode** is integrated into the form:

- Cloudflare automatically decides whether a visible challenge (checkbox) is needed — silent in most cases for real users
- If a challenge appears, the user sees a clear checkbox, which provides better UX in case of false positives (Africa context: shared mobile IPs, cybercafés, VPN)
- If verification fails three times in a row, a message *"Security check failed. Please try again later."* appears and the form is temporarily blocked for this IP address (15 minutes)
- Choice of `managed` mode (vs `invisible`): simpler front-end integration, better tolerance to false positives in the African context, aligned with consumer B2C health practices

#### 4.1.7 "→ Create my account" button — submit behaviour

The submit button **"→ Create my account"** is **always clickable** (no progressive visual disabling). It is the click that triggers global validation.

**On click**:

- Client-side validation of all required fields and their format (see §4.1.4)
- If **one or more fields** are empty or invalid:
  - Display of a **global error banner** at the top of the form: *"Please complete all required fields marked with an asterisk (*)."*
  - Simultaneous triggering of **inline validations** (date of birth, email, phone, password) to visually mark the fields in error
  - Automatic scroll to the global banner
  - No server submission, no account created
- If **all validations pass**:
  - Loading animation (spinner) on the button
  - Temporary disabling of fields to prevent double submission
  - Server check (phone and email already used, Cloudflare Turnstile anti-bot CAPTCHA passed)
  - On server error: form reactivated + global error message
  - On success: SMS OTP sent + redirect to §4.2.1 (see §4.1.8)

#### 4.1.8 Submission outcome

- ✅ **Submission validated** (required fields completed with valid formats + age ≥ 18 + consents ticked + Turnstile passed + phone and email not already used) → an **SMS OTP code** is sent to the phone number provided → redirect to the **SMS OTP verification screen** (§4.2.1). The email address is stored as `email_verified = false` and will be verified later via a deferred OTP (§4.2.2).
- ❌ **Validation failed** → global error banner at the top of the form + inline errors at the level of the relevant fields
- 🔒 **Phone already used** → targeted error *"An account already exists with this number."* + direct link to the login page
- 🔒 **Email already used** → targeted error *"An account already exists with this email."* + direct link to the login page

---

### 4.2 Verification of registration channels *(Epic 1 — Patient Registration)*

At registration, **only the phone is verified by SMS OTP** (blocking gate). The email is verified **later** by a deferred OTP, triggered by the patient themselves or by soft-gate when a sensitive action occurs (appointment booking, password reset — see §4.2.2 for the exhaustive list).

**Why this two-step logic?**

- ✅ **Minimal friction at registration**: a single verification gate, the SMS arriving in a few seconds
- ✅ **The phone is the primary identity proof**: it is also the channel for urgent notifications (appointment alerts) and an alternative login identifier
- ✅ **Email is not required immediately**: it is used for document delivery and password recovery, two uses that do not happen on registration day
- ✅ **Aligned with the standard of the B2C digital medical industry**

---

#### 4.2.1 Phone verification — SMS OTP at registration (blocking)

After a valid submission of the registration form (§4.1), the patient is directed to a **dedicated SMS OTP verification screen**. This verification is blocking: the patient cannot access the rest of the registration flow until it is validated.

##### Screen overview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Verify your phone number                              │
│                                                         │
│   A 6-digit code has been sent by SMS to                │
│   +221 ** *** ** 67                                     │
│                                                         │
│   ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐                          │
│   │   ││   ││   ││   ││   ││   │                          │
│   └───┘└───┘└───┘└───┘└───┘└───┘                          │
│                                                         │
│   Not received? Resend code · available in 00:42        │
│                                                         │
│   [ Verify → ]   (disabled until 6 digits are entered)  │
│                                                         │
│   Edit my information                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

##### OTP code characteristics

| Element | Detail |
|---|---|
| Format | 6 numeric digits |
| Channel | SMS via Africa's Talking |
| Validity | 5 minutes |
| Attempts | 3 maximum |
| Resend | Possible after 60 seconds, max 5 resends per hour per number |

##### Key screen behaviours

- **Partially masked number**: only the **last 2 digits** of the phone are visible (pattern aligned with B2C health and banking industry standards). The mask is dynamic according to the local number length per country: `** ** ** XX` (8 digits), `** *** ** XX` (9 digits), `** *** *** XX` (10 digits).
- **6 individual boxes**: automatic focus on the first box, automatic move to the next box after input. **Input filtering**: only digits are accepted (letters and symbols are stripped in real time).
- **Numeric keypad on mobile**: `inputmode="numeric"` (not `type=number` which produces ugly spinners on desktop).
- **"Verify" button**: **disabled until the 6 boxes each contain a digit**. Automatic activation as soon as the 6th digit is entered. Submission by **explicit click** on the button (no auto-submit — allows the patient to visually verify the code before validation, aligned with modern UX standards (B2C health industry + consumer apps)).
- **"Resend code" button**: disabled for 60 seconds (visible countdown), then enableable. Limit: 5 resends per hour.
- **"Edit my information" link**: return to the registration page §4.1 with **all the form fields preserved** (front-end sessionStorage). The patient can correct any field — phone number (most frequent case: SMS not received), but also email, name, etc. in case of a typo detected late. Once the correction is submitted, the patient returns to the OTP screen with the new masked number.
- **Validation animation**: on successful code validation, a success indicator then a smooth transition to the Base profile (§4.3).

##### Possible outcomes

- ✅ **Correct code** → phone number marked `phone_verified = true` → progression to **§4.3 Base profile**
- ❌ **Incorrect code** → message *"Incorrect code. You have {n} attempts left."* with countdown
- ❌ **3 incorrect attempts** → message *"Too many incorrect attempts. Please restart the registration."* + redirect to `/inscription` (data entered at step 4.1 is lost, the patient starts over)
- ⏱ **Expired code (> 5 minutes)** → message *"Your code has expired."* + "Resend code" button immediately active (no cooldown)
- 🚫 **Too many resends (> 5 / hour)** → message *"You have requested too many resends. Try again in an hour."*

---

#### 4.2.2 Email verification — Deferred OTP (non-blocking at registration)

The email address provided at registration is stored in the account but **flagged as unverified** (`email_verified = false`). No email verification is requested during the registration journey. The patient can complete their registration and access their dashboard with an unverified email.

##### When is email verification triggered?

The deferred OTP is triggered in one of the following cases:

**Patient-initiated triggers (voluntary)**

1. **Persistent dashboard banner**: as long as `email_verified = false`, a non-dismissible banner appears at the top of the dashboard: *"⚠️ Verify your email address"* with the button **"Verify now"**. The click immediately launches the deferred OTP flow. This is the **nominal and most encouraged trigger**, visible from the 1st login and on every subsequent visit until the email is verified.
2. **Voluntary action from the profile**: "Verify my email" button in the Settings → Account section, accessible at any time.

**Automatic triggers (soft-gate before a sensitive action)**

The soft-gate is a **blocking pop-up** that appears automatically when the patient attempts an action requiring a verified email channel, **as long as** `email_verified = false`. In MVP, the soft-gate is triggered on **the following actions**:

3. **Appointment booking** *(main action)*: on **every attempt** to book a slot (not only the first) as long as the email is unverified. Rationale: the appointment requires a verified email channel for sending confirmation, reminders and medical documents issued by the practitioner.
   - Pop-up: *"To finalise this appointment, please verify your email address. You will receive the confirmation and medical documents at this address."* + **"Verify now"** button that launches the OTP flow.
   - If the patient cancels ("Later"), the planned appointment is abandoned and they return to the practitioner list.
   - Once the email is verified, the booking resumes automatically (memorised URL or parameter).
4. **Forgotten password reset** *(critical action)*: the standard password reset procedure via email OTP requires the email to be verified. If `email_verified = false` at the time of "Forgot password", an alternative soft-gate is triggered — see §4.9.2 for the full procedure and the fallback (verification by SMS OTP on the registered phone + support contact in post-MVP).

**Out of soft-gate scope in MVP** *(these actions do NOT require a verified email)*: directory search, viewing practitioner profiles, completing the patient profile (address, emergency contact, notification preferences), uploading one's own personal documents (not transmitted to a practitioner). As long as the patient does not try to **book an appointment** or **reset their password**, they can use FUENI normally with an unverified email.

Trigger #1 (persistent banner) is the **recommended nominal path**: permanently visible on the dashboard as long as the email is unverified, the patient can come back to it at any time without having to wait for a soft-gate or dig through settings.

##### Deferred OTP screen overview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Verify your email address                             │
│                                                         │
│   We sent a 6-digit code to                             │
│   a***@example.com                                      │
│   It expires in 10 minutes.                             │
│                                                         │
│   ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐                          │
│   │   ││   ││   ││   ││   ││   │                          │
│   └───┘└───┘└───┘└───┘└───┘└───┘                          │
│                                                         │
│   Resend code in 1:59                                   │
│                                                         │
│   ℹ Remember to check your spam folder.                 │
│                                                         │
│   ← Later                                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

##### Deferred OTP code characteristics

| Element | Detail |
|---|---|
| Format | 6 numeric digits |
| Channel | Email via Brevo (template `OTP_PATIENT_EMAIL_VERIFICATION_FR` / `..._EN`) |
| Validity | 10 minutes *(longer than SMS because email may take a few seconds to arrive or be filtered as spam)* |
| Attempts | 3 maximum |
| Resend | Possible after 120 seconds, max 5 resends per hour per address |

##### Persistent banner before verification

As long as `email_verified = false`, **a persistent banner** appears at the top of the patient's dashboard:

> ⚠️ *Your email address is not yet verified. Verify it to be able to book appointments and receive your medical documents.* **[ Verify now ]**

The banner is non-dismissible but non-blocking: the patient can continue to use the platform (doctor search, profile completion, personal document upload) with an unverified email.

##### Possible outcomes of the deferred OTP

- ✅ **Correct code** → email marked `email_verified = true` → the persistent banner disappears → progression of the action in progress (e.g. appointment, password reset)
- ❌ **Incorrect code** → message *"Incorrect code. You have {n} attempts left."*
- ❌ **3 incorrect attempts** → message *"Too many incorrect attempts. Try again later."* — the patient returns to the dashboard with no change, the email remains `unverified`
- ⏱ **Expired code** → message + "Resend code" button
- 🚫 **Too many resends (> 5 / hour)** → message *"You have requested too many resends. Try again in an hour."*
- ← **Later** → the patient closes the screen, return to the previous page (except if soft-gate before appointment, in which case return to the practitioner list without having booked the appointment)

##### Changing email address before verification

The patient can change their email address from their profile before verifying it. This invalidates any previously sent OTP and imposes a new verification cycle.

---

### 4.3 Base profile *(post-OTP, before access to the dashboard)* *(Epic 1 — Patient Registration)*

Once SMS OTP verification is successful, the patient arrives on a **second onboarding screen** that collects the **3 pieces of location and language information** needed to use the platform:

- **Country** — patient's service area (one of the 9 MVP countries). Matching with local practitioners.
- **City** — search by city and proximity matching
- **Communication language** — language of notifications, emails and interface

This screen is **mandatory and with no bypass**: the patient must complete these 3 fields to reach their dashboard. There is no "Skip for now" option or partial access to the platform.

**Why no bypass?**

- **Guaranteed data quality**: all `ACTIVE` patients have country + city populated → 100% reliable search and matching, no "ghost" partially filled accounts
- **Simple state model**: a single active state `ACTIVE`, no more "complete vs incomplete profile" distinction
- **No complex soft-gate before 1st appointment**: on arrival on the dashboard, the patient can book an appointment directly
- **Aligned with consumer B2C health industry standards**: linear mandatory onboarding, no "complete later"

#### 4.3.1 Screen overview (prototype reference `04-patient-profile-base.html`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Complete your profile                                     │
│                                                             │
│   Last step (30 seconds).                                   │
│                                                             │
│   Country *                City *                           │
│   [ 🇸🇳 Senegal       ▾ ]   [ Choose...           ▾ ]       │
│   ℹ️ Pre-filled based on your phone country code            │
│      (Choose... if country code = "Other")                   │
│                                                             │
│   Communication language *                                  │
│   [ French                                         ▾ ]      │
│                                                             │
│   Address  (optional)                                       │
│   [ e.g. Sacré-Cœur 3, Villa 12, opposite the pharmacy.. ]  │
│                                                             │
│   [ Finalise and access my space  ✓ ]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.2 Fields collected

| # | Field | Format | Required | Validation |
|---|---|---|---|---|
| 1 | **Country** | Drop-down list **strictly limited to the 9 MVP countries** (with flag). No "Other" option, no foreign country: the **service area** is by definition one of the 9 countries. | ✅ | One option selected. **Inheritance rule**: if the phone country code in §4.1 matches one of the 9 MVP countries → Country is pre-filled with that country (editable). If the country code = "Other" (foreign) → default value = **"Choose..."**, the patient manually selects the country where they are / will temporarily reside, among the 9. |
| 2 | **City** | Cascading drop-down list from the selected country (main cities of the country + "Other" option for free input) | ✅ | One option selected |
| 3 | **Communication language** | Drop-down list: `French` · `English` | ✅ | One option selected (default: language detected by the browser) |
| 4 | **Address** | Free text field (2-line text area) — *"e.g. Sacré-Cœur 3, Villa 12, opposite the El Hadji pharmacy"* | ❌ Optional | No strict validation. The patient can fill in their full address here or leave it blank and complete it later (§4.5) |

The **postal code** is **not requested** at this stage — it remains optional in later profile completion (§4.5).

#### 4.3.3 Base profile outcome

- ✅ The 3 required fields are filled in and validated
- The patient clicks on **"Finalise and access my space"**
- The profile is saved, the account moves to `account_status = ACTIVE`
- Redirect to the dashboard (see §4.4 — in-context orientation via email banner and empty states)

**No "Skip for now" button**, no alternative path. The patient cannot reach the dashboard without having completed these 3 fields.

**Validation model**: if on clicking *"Finalise and access my space"* one or more required fields are missing or invalid (country = "Choose…", city = "Choose…", city = "Other" without precision input), display of a **global error banner** identical to §4.1: *"Please complete all required fields marked with an asterisk (*)."* + automatic scroll to the banner. No specific per-field messages — the asterisk (*) on each label is enough visually.

#### 4.3.4 Behaviour in case of abandonment

If the patient closes the browser or the session before completing the Base profile, the account remains in `PENDING_PROFILE_BASE` status. Two mechanisms ensure the patient can resume:

- **Later reconnection**: if the patient logs back in (with their identifier + password), they are **automatically redirected** to the Base profile screen. No access to the dashboard, the directory, or any other platform feature is possible until these 3 fields are completed.
- **Automatic cleanup D+7**: if no login or completion takes place during 7 days after account creation, the account is automatically deleted (full rollback Keycloak + database). An explanatory email is sent: *"Your registration was not finalised. You can start again at any time."*

This D+7 cleanup remains **simple and unique** for registration abandonment — there is no longer a long-term "Option B" variant. The account is either finalised (and moves to `ACTIVE`), or deleted.

**Long-term cleanup of inactive `ACTIVE` accounts (GDPR)** — beyond the registration cleanup:

- **Email warning at D+335** (11 months without login): *"Your FUENI account has not been used for 11 months. Without a login within 30 days, it will be deleted in accordance with our GDPR policy."*
- **Deletion at D+365** if no intermediate reconnection (storage limitation, GDPR art. 5(1)(e))
- Retention of medical records in accordance with legal obligations (see R17 — 20 years since the last consultation)

---

### 4.4 Immediate activation and arrival on the dashboard *(Epic 1 — activation · Epic 4 — Dashboard)*

At the end of the Base profile (§4.3), the patient is **automatically logged in** and arrives directly on their personal dashboard ("My space"). **No blocking welcome modal** — orientation happens **in-context** via empty states and the email verification banner.

**Why no modal?** This decision is aligned with the B2C health standard: no consumer player in the health sector uses a post-registration modal. Blocking modals have a low interaction rate (< 30% read, < 15% clicked), degrade mobile UX, and clash with the desire to explore the platform immediately. The modern approach favours contextual orientation.

#### 4.4.1 Dashboard overview at first login

```
┌─────────────────────────────────────────────────────────────┐
│  [FUENI Logo]              [Aïssatou ▾] [Notifications 🔔]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️  Verify your email address      [ Verify now ]          │ ← banner §4.2.2
│                                                             │
│  Hello Aïssatou!                                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📅  My appointments                                  │   │
│  │                                                       │   │
│  │     You don't have any appointments yet.              │   │ ← empty state
│  │     [ Find a doctor →  ]                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📄  My documents                                     │   │
│  │                                                       │   │
│  │     No documents uploaded.                            │   │ ← empty state
│  │     [ Upload a prescription →  ]                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  👤  My profile                                       │   │
│  │     Profile completed at 40 %                         │   │ ← progress badge
│  │     [ Complete my profile →  ]                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.4.2 Orientation elements at first login

| Element | Mechanism | Reference |
|---|---|---|
| **"Verify your email" banner** | Persistent banner at the top of the dashboard, non-dismissible as long as `email_verified = false`. Click → launches deferred OTP flow §4.2.2 | §4.2.2 |
| **"My appointments" empty state** | Card with message + "Find a doctor" CTA | Epic 11 Booking |
| **"My documents" empty state** | Card with message + "Upload a prescription" CTA | Epic 5 Documents |
| **"My profile — completed at X %" card** | Dynamic progress badge computed on the §4.5 fields + "Complete my profile" CTA | Epic 4 §4.5 |

All these elements exist **by construction** in the other epics (§4.2.2 email banner, Epic 5 documents, Epic 11 appointments, Epic 4 profile) — there is **no new component to develop** specifically for this section. It is the natural composition of the MVP dashboard.

#### 4.4.3 Why the patient already has access to everything

The Base profile (§4.3) being by construction completed at this stage, the patient is in `ACTIVE` status and has immediate access to **all MVP features**:
- Doctor search and appointment booking (public directory + Epic 11)
- Personal document upload (Epic 5)
- Viewing and modifying their profile (Epic 4)
- Settings and preferences

No feature is locked behind an "incomplete" state or conditional on completing a modal.

---

### 4.5 Later profile completion

Beyond the Base profile (§4.3) collected just after the OTP, **a few useful pieces of information are not requested up front** but can be completed by the patient from their profile (Settings → My profile). All are **optional** and have no blocking impact on platform usage.

**Scope note**: later profile completion is part of the **Patient Account & Profile** module (Epic 4 in the MVP backlog), distinct from the registration itself (Epic 1). The corresponding screens are delivered in the sprint following the registration delivery.

**Fields accessible from the patient profile**

| Category | Fields | Notes |
|---|---|---|
| **Full address** | Address (street, complement, landmark), Postal code | The Address field may already have been optionally filled at step §4.3; this section allows it to be completed / corrected and the postal code to be added |
| **Emergency contact** | Contact name, Relationship (Spouse / Child / Parent / Friend / Other), Emergency phone | Used in case of medical emergency flagged by the practitioner |
| **Notification preferences** | "Receive SMS reminders" toggle (default ON) · "Receive email reminders" toggle (default ON) | **Transactional** notifications (OTP, appointment confirmation, payment failure, security alert) are always sent, with no possibility of disabling |

**Why this reduced list?**

The scope of optional fields is deliberately kept narrow in the MVP to:
- **Ease of use**: a short and clear profile is more engaging than a 30-field form that is never filled out
- **Legal compliance**: no patient-side self-declaration of sensitive medical data (see §8 Out of scope)

**Gentle encouragements**: a visual profile completion indicator ("Profile completed at 80%") encourages the patient to enrich progressively, without guilt-tripping.

---

### 4.6 Identity verification — practitioner responsibility

**Principle — alignment with the digital medical industry standard**

FUENI **does not perform any enhanced platform identity verification for patients in MVP** (no ID card scan, no biometric selfie, no manual Super Admin validation). The patient is only verified by the OTP code sent to their registration channel (proof that they own the phone or the email).

This choice is aligned with current practices in the consumer digital medical industry: B2C appointment-booking platforms do not themselves perform patient KYC — identity verification remains the **practitioner's responsibility at the in-person consultation** (telemedicine consultation is out of MVP scope and will be handled separately post-MVP).

**Why this choice?**

- ✅ **Minimal friction**: an ID scan before the 1st appointment would significantly reduce conversion (effect documented at -40 to -60% on industry benchmarks)
- ✅ **Ethical framework respected**: the doctor remains legally responsible for verifying the patient's identity before any medical act
- ✅ **Avoided operational burden**: no dedicated Super Admin team for the manual validation of thousands of patient files
- ✅ **Industry standards respected**: B2C health platforms all rely on this logic of shared responsibility
- ✅ **Security preserved**: OTP + anti-bot protection + audit log + robust password policy provide a platform security level suited to B2C health

**Practitioner verification aid (MVP)**

The identity information **collected at registration** (first name, last name, date of birth, sex at birth — see §4.1) as well as the **address** (optional in §4.3 or §4.5) are visible to the doctor on the patient file at appointment time. These fields are sufficient in MVP for identity confrontation at the consultation.

Additional fields (birth name, place of birth) are **deferred to post-MVP** — see §8.

**Future evolution cases (post-MVP)**

If certain sensitive features are introduced post-MVP (remote telemedicine consultation, controlled medication prescription, dematerialized medical certificates, insurance integration), platform identity verification may then be added **only for those specific flows** — not for basic appointment booking. This will be specified in the FS dedicated to each affected feature.

---

### 4.7 Profile modification

> **Scope note**: patient profile modification is part of the **Patient Account & Profile** module (Epic 4 in the MVP backlog), distinct from registration. The details of screens, flows and precise rules will be covered in a dedicated FS — provisionally **`SF-PATIENT-PROFILE`** (to be produced). This section only gives the **3-level rights model** applied.

After activation, the patient can modify their profile. **Three rights levels** apply depending on the sensitivity of the information:

| Level | Mechanism | Affected fields (MVP) |
|---|---|---|
| **Level 1** | Free modification (no confirmation) | Address, postal code, city · Emergency contact (name, relationship, phone) · Communication language · Notification preferences (SMS / email toggles) |
| **Level 2** | OTP verification on the new channel (or confirmation OTP for sensitive changes) | Primary phone (new SMS OTP) · Primary email (new email OTP) · Password (input of old + new) · **Country** (confirmation OTP, restricted to the 9 MVP countries — see §4.3) |
| **Level 3** | Email request to Nazounki support, Super Admin validation, manual application by the technical team | First name, Last name · Date of birth · Sex at birth *(immutable legal identity collected at registration §4.1)* |

**Level 3 — simplified MVP process**: the patient sends an email request to Nazounki support with supporting documents (marriage certificate, ID card, etc.). Super Admin reviews and, if validated, forwards to the technical team for manual application (with audit log). No dedicated UI workflow in MVP — expected volume too low to justify the dev effort (see **D11**). The process details (email template, SLA, audit, post-MVP evolution towards UI workflow) will be specified in **SF-PATIENT-PROFILE**.

---

### 4.8 Dependent profiles *(post-MVP)*

**Principle**

An adult patient can manage several **dependent profiles** attached to their account:

- Their **minor children** (< medical consent age, varies by country)
- An **elderly parent** under medical guardianship
- A **spouse** under guardianship

**Creating a dependent profile**

| Field | Required |
|---|---|
| Dependent's first name, last name | ✅ |
| Link with the guardian (Child, Dependent parent, Spouse under guardianship, Other) | ✅ |
| Date of birth | ✅ |
| Sex at birth | ✅ |
| Supporting document (birth certificate, guardianship ruling…) | ❌ Optional in post-MVP, requestable on demand by Super Admin |

**User experience**

- Profile selector at the top of the app: *"You are viewing the profile of: Me / My child 1 / My mother"*
- Smooth switching between profiles
- Notifications grouped on the adult account (a single SMS / email per appointment, regardless of the profile concerned)
- Appointments are booked in the dependent's name, paid from the adult account
- Medical documents of the dependent are stored in their dedicated profile (compartmentalisation)

**MVP = adult account only.** Adding dependents is entirely deferred to post-MVP. The precise operational arrangements (automatic transfer child→adult, shared guardianship, multi-guardians with delegation, etc.) will be the subject of a dedicated specification at the time of implementation of this feature.

---

### 4.9 Account security

#### 4.9.1 Login identifier and authentication

**Flexible identifier**: the patient logs in with their **email OR their phone number** registered at sign-up, together with their **password**. The identifier field is single on the login page, with the label **"Identifier"** and the placeholder *"Email or phone number"*.

| Aspect | Behaviour |
|---|---|
| **Format auto-detection** | Presence of the `@` character → treated as email. Otherwise → treated as phone after normalization. |
| **Phone normalization** | Removal of spaces, hyphens and dots. Automatic addition of the account's country code if missing. Conversion to **E.164** format for database lookup. |
| **Email case** | Case-insensitive. Normalized to lowercase internally. |
| **Password** | Strict policy defined in §4.1.4 (8 to 128 characters, mixed). |
| **Invalid format** | Error message distinguishing the format error ("Unrecognised format — enter a valid email or phone number") from the credentials error ("Email / phone or password incorrect"). |

**Consistency with the African context**: in the 9 MVP countries, the phone is the primary psychological identifier (aligned with Wave, Orange Money, MTN Money, WhatsApp). Allowing login by phone reduces the login failure rate and respects local user habits.

**Multi-factor authentication (MFA) — post-MVP**

MFA (regardless of channel: SMS, email, authenticator app, passkey) **is not included in the MVP**. It will be specified in the dedicated **SF-LOGIN** FS and delivered post-MVP. This decision is aligned with the consumer B2C health industry standard (consumer B2C health sector) which does not impose MFA on patients at login.

In MVP, patient account security relies on:

- A **robust password policy** (see §4.1.4) — 8 to 128 characters with composition + **Argon2id** hashing
- **Rate-limiting of login attempts** and **temporary lockout after several successive failures** (native Keycloak mechanisms)
- **Password reset by OTP** (§4.9.2)
- **Automatic session invalidation** on password change (§4.9.3)
- **Session expiration by inactivity** (§4.9.3)

The **suspicious activity detection** mechanisms (alerts "new login", device fingerprinting, viewing active sessions) are deferred to post-MVP and will be handled jointly with MFA in SF-LOGIN.

#### 4.9.2 Forgotten password reset

The patient can reset their password at any time:

1. From the login page → **"Forgot password"** link
2. Entering the email address
3. Receiving a **6-digit OTP** by email (valid 10 minutes, 3 attempts, resend possible after 120 seconds)
4. Entering the OTP on the reset page
5. Entering the new password + confirmation
6. Automatic login

The password must comply with the same policy as at registration: 8 to 128 characters, containing at least 1 uppercase + 1 lowercase + 1 digit + 1 special character (any printable non-alphanumeric character, except space).

If the patient's email was not yet verified (`email_verified = false`) at the time of the reset request, successful OTP validation automatically marks the email as verified (`email_verified = true`).

**Special case: loss of access to email** → contact support which proposes a recovery procedure with identity verification by SMS OTP on the registered phone + security question (post-MVP).

#### 4.9.3 Session management

In MVP, two mechanisms ensure account security without a dedicated session management interface:

- **Automatic invalidation on password change**: any password change (via reset or voluntary modification) automatically logs the patient out of all their devices. They must then log back in with the new password.
- **Session expiration by inactivity**: an open session automatically expires after a period of inactivity (duration to be confirmed by the technical team — typically 30 days).

The **explicit viewing of active sessions and remote revocation of a suspicious device** are deferred to post-MVP — automatic invalidation on password change + expiration by inactivity cover the priority use cases in MVP. Suspicious activity detection mechanisms (see §4.9.1) will be handled jointly in SF-LOGIN.

---

### 4.10 Account deletion *(post-MVP)*

#### Two-step policy

The patient can request the deletion of their account from their settings → *Security → Delete my account*. The process unfolds in **two steps** to prevent accidental deletions and respect the GDPR while honouring the legal obligations of medical record retention.

**Step 1 — Deletion request (D0)**

- Login disabled immediately
- Profile hidden from the directory for doctors (the patient no longer appears in any medical search)
- Upcoming appointments cancelled and the practitioners concerned notified
- Confirmation email / SMS to the patient with a retraction link

**Step 2 — Pseudonymization (D+30, end of retraction period)**

During the **30 days** following the request, the patient can cancel their deletion from the link sent by email / SMS. Past this period, the deletion becomes irreversible:

- **Personal data deleted**: name replaced with "Anonymous patient {short identifier}", photo deleted, address / contact details deleted, emergency contact deleted
- **Authentication account disabled** but kept in Keycloak for audit (no possibility of reuse of the email / phone by another account for 5 years)
- **Medical records kept for 20 years** from the last consultation, with pseudonymized reference (the doctor keeps access to their practitioner record as before FUENI)
- **Appointment history kept** in aggregated form (anonymous statistics), without patient identifier

**Decision to validate** (see §9 D6): confirm the medical record retention duration to 20 years (consistent with the doctor decision, see SF-DOCTOR-REGISTRATION).

#### GDPR right to export

At any time before deletion, the patient can **export their personal data** from their settings:

- Structured JSON export containing: profile, past appointments, personal documents, notification history
- Received by email or SMS (secure link valid 7 days)

This feature respects article 20 of the GDPR (right to data portability).

---

## 5. Consolidated business rules

| # | Rule |
|---|---|
| R1 | The patient must be 18 or older. Age verification is performed when the Date of birth field is entered in the registration form (§4.1.4): **inline** validation blocking the "Create my account" button as long as age < 18. **No account is created** for < 18 — since the barrier is upstream of the SMS OTP, there is no cleanup to manage. Registration of minors with parental consent is deferred to post-MVP. |
| R2 | The patient enters **phone AND email** at registration, as well as a password. At registration, **only the phone is verified by SMS OTP** (blocking, 6 digits, 5 min). The email is verified later by a **deferred OTP** (6 digits, 10 min), triggered either by the patient (dashboard banner, settings) or automatically by soft-gate before a sensitive action (any appointment booking, password reset — see §4.2.2). |
| R3 | The Terms of Use and the Privacy Policy must be accepted explicitly (mandatory boxes). |
| R4 | Registration is entirely self-service and public — no prior invitation is required. |
| R5 | **Independent uniqueness of the two channels**: the phone number **AND** the email address are each subject to a global uniqueness constraint on the platform. The same phone number cannot be used for two FUENI accounts, and the same rule applies to the email address (regardless of role — patient or doctor). The uniqueness check is performed server-side after normalization (phone in **E.164** format, email in **lowercase**). If either is already used, registration is refused with a targeted message pointing to the affected channel (see §4.1.8 and §7.1). |
| R6 | Anti-bot protection (Cloudflare Turnstile, `managed` mode) is applied to all submissions of the registration form. The `managed` mode (rather than `invisible`) is chosen to simplify integration and improve tolerance to false positives in the African context (shared IPs, cybercafés, VPN). |
| R7 | The registration journey is structured in **4 successive mandatory steps**: (1) Registration §4.1 (identity + channels + password) → (2) SMS OTP verification §4.2 → (3) Base profile §4.3 (country + city + language) → (4) Activation and dashboard §4.4. The account moves to `ACTIVE` only after completing step 3 — there is no partial access to the platform. In case of abandonment between steps: automatic cleanup at **D+7** (see §4.3.4). For `ACTIVE` accounts inactive beyond 12 months: GDPR long-term cleanup with warning at D+335 (see §7.2). |
| R7bis | No "Pending Super Admin validation" state for the patient, unlike the doctor — platform identity verification is not applied to the patient (see R8). |
| R8 | **No enhanced platform identity verification for patients in MVP.** Identity verification remains the **practitioner's responsibility at the consultation**, in line with the B2C digital medical industry standards. Only the OTP (phone or email) constitutes the platform verification. |
| R9 | The patient can enrich their profile with their **address** (optional in §4.3 or §4.5) to facilitate identity verification by the practitioner in-person. The birth name / place of birth fields are deferred to post-MVP. |
| R10 | **9 MVP countries** = Senegal, Côte d'Ivoire, Mali, Benin, Togo, Burkina Faso, Niger, Cameroon, DRC. Application differs by field: **(a) Phone country code §4.1** = list of the 9 countries + "🌍 Other" option at the bottom for manual entry of a foreign code (see D12); **(b) Country §4.3** = list **strictly limited to the 9** (the service area is by definition one of the 9, no "Other" option). |
| R11 | Profile modification: 3 levels depending on the sensitivity of the field (free / OTP / Super Admin). |
| R12 | Password policy: **8 to 128 characters**, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character (any printable non-alphanumeric character, except space). **Argon2id** hashing (default Keycloak v22+). Anti brute-force protection by **rate-limit + lockout** (5 failures / min → 15 min blocking, native Keycloak Brute Force Detection). No forced password expiration (aligned with NIST SP 800-63B). Check against compromised password lists (HIBP / blacklist): **post-MVP**. |
| R13 | OTP: 6 digits, validity 5 minutes, 3 attempts maximum, resend possible after 60 seconds, max 5 resends per hour per identifier. |
| R14 | Login by flexible identifier: **email OR phone number** + password (see §4.9.1). MFA deferred to post-MVP (specified in the future SF-LOGIN). |
| R15 | Dependent profiles (minor children, parents under guardianship): deferred to post-MVP. In MVP, one account = one adult. |
| R16 | Account deletion: 2 steps, 30 days of retraction, then pseudonymization (post-MVP). |
| R17 | Medical records kept for 20 years from the last consultation, even after deletion of the patient account (pseudonymized references). |
| R18 | The patient can export their personal data at any time in JSON format (GDPR right to portability, article 20). |
| R19 | In MVP, the patient shares **no self-declared medical information** with a practitioner — this information does not exist in the MVP scope (see §8). **Personal medical documents** (Epic 5) are visible to a practitioner **only in the context of a confirmed appointment** (one-off implicit consent). Post-MVP, proactive sharing of the profile or documents with a practitioner ("declared primary care physician", "medical record sharing") will require **explicit and granular consent** from the patient — mechanism to be detailed in a dedicated FS. |
| R20 | Active sessions viewable by the patient from their settings, with possible remote forced logout *(post-MVP)*. |

---

## 6. Fields collected at each step

### 6.1 Registration (§4.1) — identity + channels + password

| # | Field | Required | Notes |
|---|---|---|---|
| 1 | First name | ✅ | 1 to 80 characters |
| 2 | Last name | ✅ | 1 to 80 characters |
| 3 | Date of birth | ✅ | ≥ 18 years, ≤ 120 years — inline validation blocks submission if < 18 (no account created) |
| 4 | Sex at birth | ✅ | Male / Female (two values only — legal identity field for clinical relevance) |
| 5 | Email address | ✅ | Valid RFC format, Gmail/Yahoo accepted. No confirmation field — the deferred OTP (§4.2.2) acts as a safety net in case of typo |
| 6 | Phone (country code + number) | ✅ | E.164. Country code = 9 MVP countries + **"Other"** option for manual entry (use case: foreigner temporarily residing in an MVP country). Auto-detected by IP geolocation. SMS OTP delivery is best-effort outside the 9 countries. |
| 7 | Password | ✅ | 8 to 128 characters, strict policy (R12) with Argon2id + rate-limit. Clearly visible "Show password" toggle — no confirmation field |
| — | Terms of Use acceptance | ✅ | Mandatory box |
| — | Privacy Policy + processing of medical data (GDPR) acceptance | ✅ | Mandatory box |

→ **7 main fields** + consents. The phone is verified by **blocking SMS OTP** at registration (see §4.2.1). The email is verified by a **deferred OTP** triggered later by the patient or before a sensitive action (see §4.2.2). No email / password confirmation fields — aligned with consumer B2C health industry standards and NIST SP 800-63B recommendations.

### 6.2 Base profile (§4.3) — post-OTP, required before access to the dashboard

| # | Field | Required | Notes |
|---|---|---|---|
| 1 | Country | ✅ | List **strictly limited to the 9 MVP countries** (flag + name). Inheritance: pre-filled if the phone country code §4.1 matches one of the 9; defaults to "Choose..." if the country code = "Other" (foreign). |
| 2 | City | ✅ | Cascading drop-down list from the country |
| 3 | Communication language | ✅ | French / English (default: language detected by the browser) |
| 4 | Address | ❌ Optional | Free text field — neighbourhood, street, landmark. Can be completed later from the profile (§4.5) |

→ **3 required fields + 1 optional** — form designed to be completed in ~ 30 seconds (or ~ 1 minute if the patient also fills in the address). **No "Skip for now" option**: completion of the 3 required fields is required to reach the dashboard.

### 6.3 Later profile completion (§4.5) — post-activation, all optional

Fields accessible from Settings → My profile (delivered in **Epic 4 Patient Account & Profile**, sprint following registration):

| # | Category | Fields |
|---|---|---|
| 1 | Full address | Address (street, complement), Postal code |
| 2 | Emergency contact | Name, Relationship, Emergency phone |
| 3 | Notification preferences | SMS toggle (default ON), email toggle (default ON) — appointment reminders only, transactional notifications remain always active |

→ **3 categories, ~6 fields**, all optional.

---

## 7. Key user-facing messages

### 7.1 Common error messages (registration)

| Situation | Message |
|---|---|
| **Submit with one or more required fields missing / invalid** | Red global banner at the top of the form: *"Please complete all required fields marked with an asterisk (*)."* — inline validations (cases below) are triggered simultaneously to point out the fields in error |
| Phone already used | "An account already exists with this number. Log in." |
| Email already used | "An account already exists with this email. Log in." |
| Invalid phone format *(inline under the Phone field)* | "Invalid number for the selected country." |
| Invalid email format *(inline under the Email field)* | "Invalid email address." |
| Age < 18 *(inline under the Date of birth field)* | "You must be 18 or older to sign up." |
| Automatic cleanup of a `PENDING_PROFILE_BASE` account at D+7 | Email to the patient: "Hello, your FUENI registration started on {date} was not finalised. In accordance with our privacy policy, your temporary account has been deleted. You can start a new registration at any time." |
| Warning before long-term cleanup at D+335 | Email: "Your FUENI account has not been used for 11 months. Without a login within 30 days, it will be deleted in accordance with our GDPR policy." |
| Incorrect OTP code | "Incorrect code. You have {n} attempts left." |
| Expired OTP code | "Your code has expired." + "Resend code" button |
| 3rd incorrect OTP attempt | "Too many incorrect attempts. Please restart the registration." |
| Anti-bot check failed | "Security check failed. Please try again." |

### 7.2 Post-registration notifications

| Situation | Channel | Message |
|---|---|---|
| Successful registration | SMS | "Welcome to FUENI, {First name}! Your account is created." |
| SMS OTP sending at registration | SMS | "FUENI: your verification code is {code}. Valid 5 minutes." |
| Persistent unverified email banner (in-app) | Dashboard banner | "⚠ Your email address is not yet verified. Verify it to be able to book appointments and receive your medical documents. [Verify now]" |
| Deferred OTP sending for email verification | Email | "Hello {First name}, your FUENI verification code is: {code}. It expires in 10 minutes. If you did not request this code, ignore this message." |
| Soft-gate before 1st appointment if email unverified | In-app pop-up | "To finalise this appointment, please verify your email address in order to receive the confirmation and associated documents. [Verify now]" |
| Email verified confirmation (in-app) | In-app banner | "✅ Your email address is confirmed." |
| Profile completion encouragement | Email (D+3 if profile incomplete) | "Hello {First name}, complete your profile (address, emergency contact) to facilitate your next consultations." |
| Deletion request recorded | Email + SMS | "Your deletion request has been recorded. Your account will be permanently deleted in 30 days. Click here to cancel." |
| Effective deletion | Email | "Your FUENI account has been permanently deleted. In accordance with medical regulations, your medical records remain kept by your treating doctors for a period of 20 years." |

### 7.3 Orientation messages at first login

No welcome modal (see §4.4). Orientation messages are delivered via empty states and the email verification banner:

| Element | Message |
|---|---|
| Email verification banner (persistent, §4.2.2) | "⚠️ Verify your email address to be able to book appointments and receive your medical documents. **[ Verify now ]**" |
| "My appointments" empty state (1st login) | "You don't have any appointments yet. **[ Find a doctor → ]**" |
| "My documents" empty state (1st login) | "No documents uploaded. **[ Upload a prescription → ]**" |
| "My profile — completed at X %" card | "Profile completed at {X} %. **[ Complete my profile → ]**" |

---

## 8. Out of scope

The following items are **not included** in the scope of this Patient Registration FS. They are organised into three categories according to their destination:

### 8.1 Covered in an upcoming dedicated FS (MVP scope, outside the registration flow)

These features are part of the global MVP but are specified in another FS — logical separation to avoid mixing registration and other modules.

| Item | Target FS |
|---|---|
| **Recurring login flow** (login of a patient already registered who comes back to log in) | **SF-LOGIN** (to be produced) — transverse to the 3 roles patient / doctor / super admin |
| **Patient profile modification** (address editing, emergency contact, notification preferences, photo, levels 1/2/3) | **SF-PATIENT-PROFILE** (to be produced) — details in Epic 4 |
| **Appointment booking** | **SF-PATIENT-SEARCH-BOOKING** (to be produced) — Epic 11 |
| **Personal medical document management** (upload, classification, deletion) | **SF-PATIENT-DOCUMENTS** (to be produced) — Epic 5 |

### 8.2 Deferred to post-MVP (to be specified later)

These features are **neither in the MVP nor in an FS being produced** — they will be assessed and specified after launch, based on user feedback and client priorities.

| Item | Reason for deferral |
|---|---|
| **Registration of minors with parental consent** | Regulatory complexity (parental consent + guardianship), marginal volume in MVP. Dedicated specification needed |
| **Dependent profiles** (children, parents under guardianship) | Complex data model and UX. In MVP: one account = one adult |
| **Multi-factor authentication (MFA)** regardless of modality (SMS, email, authenticator app, passkey) | Aligned with consumer B2C health standard. Will be handled in **SF-LOGIN** post-MVP |
| **Suspicious activity detection** (email "new login" alert, device fingerprinting, patient-visible activity log, active sessions viewing) | Handled jointly with MFA in SF-LOGIN post-MVP. Deferred from MVP for 2 reasons: (1) email is not guaranteed verified at login (deferred OTP §4.2.2) — risk of sending to an unproved address; (2) high false-positive rate in the African context (internet cafés, shared devices, incognito browsing) → desensitises the user |
| **HIBP check** (passwords compromised in public leaks) | Additional defence layer not required for MVP. Composition + Argon2id + Keycloak rate-limit cover ~95% of threats. To be introduced post-MVP via the static Keycloak `passwordBlacklist` (top 10k) then real-time HIBP API integration |
| **Social login** (Google, Apple, Facebook) | Integration complexity, low priority in MVP. To be assessed post-MVP based on expressed needs |
| **Passwordless login** (phone + SMS OTP only, Mobile Money style) | To be assessed post-MVP. In MVP, login accepts email OR phone (§4.9.1) but the password remains required |
| **Voluntary account deletion** | GDPR policy to be finalised with legal counsel. Detailed scoping §4.10 (post-MVP) |
| **Security question for access recovery** (case of simultaneous loss of phone and email) | Fallback safety net to be designed post-MVP |
| **Explicit active session management** (viewing connected devices, remote revocation) | Covered in MVP by automatic invalidation on password change + expiration by inactivity (see §4.9.3) |
| **Granular notification preferences** (per type × channel × quiet hours × reminder frequency) | Covered by Epic 14 Notifications Polish & Admin (M4 of the MVP backlog). In MVP, 2 toggles are sufficient (see §4.5) |
| **WhatsApp Business notifications** | Additional notification infrastructure to be integrated (post-MVP) |
| **AI triage** (automatic medical orientation) | Regulation to analyse; AI development not a priority in MVP |
| **Search / access to a medication, an ambulance, a hospital** | New product features, outside the MVP appointment-practitioner flow |
| **Mobile money deposit at appointment booking** (anti no-show) | To be activated post-MVP based on measurement of real no-show rate |
| **Referral between patients** (sponsorship) | Marketing programme to be designed post-MVP |

### 8.3 Outside current product vision — possible re-evaluation upon Nazounki request

These features are **not planned** in the current product trajectory (MVP + scoped post-MVP). They could be reintroduced later upon **explicit request from Nazounki**, but will then require a dedicated product decision and a complete specification before integration.

| Item | Justification |
|---|---|
| **Platform identity verification** (patient KYC by a third-party service like Smile Identity / Ondato, or manual Super Admin validation) | FUENI is not a KYC service. Identity verification remains the **practitioner's responsibility at the in-person consultation** (see §4.6). Aligned with consumer digital medical industry practice. Reopening conceivable **only for specific sensitive flows** (telemedicine consultation, controlled prescription, dematerialized medical certificates) — to be scoped at the time of implementation of those features |
| **Self-declared medical information by the patient** (blood group, known allergies, current treatments, medical history) | FUENI is an **appointment booking** platform, not a Computerised Patient Record (DPI). This data belongs to the practitioner record. Legal and data-quality risks too high under self-declaration. In MVP, medical information flows via the **documents** uploaded (prescriptions, reports, lab tests — Epic 5) |
| **Declared primary care physician** (persistent reference to a FUENI practitioner in the patient profile) | Implies a consent system and persistent profile sharing that goes beyond the MVP. To be assessed post-MVP in connection with a possible **SF-PARTAGE-DOSSIER** |
| **Proactive sharing of patient record with a doctor** | Same logic as the primary care physician. To be specified post-MVP with explicit and granular consent (see R19) |
| **Practitioner verification aid** in the patient profile (birth name, place of birth) | Identity verification remains with the practitioner at the consultation (see §4.6) without needing additional fields on the patient side. The identity information collected at registration §4.1 is sufficient |

---

## 9. Key decisions

| # | Subject | Status |
|---|---|---|
| **D1** | Final Terms of Use and Privacy Policy texts — drafting in progress on Nazounki side (legal counsel or equivalent). No draft available to date, integration needed before production release. | 🟠 In progress |
| **D2** | Detailed content of emails / SMS (welcome, OTP, KYC validation, rejection, deletion, appointment reminders, cleanup, etc.) — **Approved**: templates drafted by Paris Partners (consistent with the design system and brand tone), final validation by Nazounki before production release. | ✅ Approved · 🟠 Drafting in progress by Paris Partners |
| **D3** | Single channel at registration — **Proposed**: **phone AND email both required at registration**. Phone verification by blocking SMS OTP at registration (§4.2.1); email verification by **deferred OTP** non-blocking at registration, triggered by the patient or by soft-gate before a sensitive action (§4.2.2). Aligned with prototype + industry standards. | ✅ Approved by Nazounki (2026-05-27) |
| **D4** | Enhanced identity verification — Proposed decision: **no platform identity verification for patients in MVP**. Aligned with the B2C digital medical industry standard. Verification remains the practitioner's responsibility at the consultation. To possibly be reintroduced post-MVP for specific sensitive flows (see §4.6) | ✅ Approved by Nazounki (2026-05-27) |
| **D5** | Confirm the list of 9 MVP target countries (UEMOA + Cameroon + DRC) — Chad, CAR, Gabon, Congo Brazzaville deferred to post-MVP | ✅ Approved by Nazounki (2026-05-27) |
| **D6** | Confirm the medical record retention duration to 20 years after deletion of the patient account | ✅ Approved by Nazounki (2026-05-27) |
| **D7** | Confirm that dependent profiles are deferred to post-MVP (one account = one adult in MVP) | ✅ Approved by Nazounki (2026-05-27) |
| **D8** | Activation of 2FA by default or optional — Proposed decision: **MFA deferred to post-MVP**, specified in the future **SF-LOGIN**. Aligned with B2C health standard (consumer B2C health sector). In MVP, security = robust password (composition + Argon2id) + rate-limiting / temporary lockout (native Keycloak) + password reset by OTP + automatic session invalidation on password change + expiration by inactivity. | ✅ Approved by Nazounki (2026-05-27) |
| **D9** | Login identifier: email only or email OR phone — Proposed decision: **flexible identifier (email OR phone) + password** at login (see §4.9.1). Consistent with the mobile-first African context and aligned with consumer B2C health industry standards. Mechanical details in the future **SF-LOGIN**. | ✅ Approved by Nazounki (2026-05-27) |
| **D10** | Date of birth and sex at birth: at registration or at base profile? — Proposed decision: **DOB + sex at birth at registration §4.1**. Aligned with consumer B2C health industry standards. Allows age ≥ 18 verification **before** account creation (no deferred cleanup for minors). Base profile §4.3 simplified to country + city + language. | ✅ Approved by Nazounki (2026-05-27) |
| **D11** | Level 3 profile modification (legal identity): Super Admin UI workflow or manual email process? — Proposed decision: **manual email process in MVP**. The patient sends their modification request (first name, last name, date of birth, sex at birth) by email to Nazounki support with supporting documents (ID card, marriage certificate, etc.). Super Admin validates, technical team applies the modification manually with audit log. Expected volume < 50 requests/year → insufficient ROI to build a complete UI workflow in MVP (saving ~3-5 dev person-days). Evolution towards UI workflow in post-MVP if volume becomes significant. Process details (email template, SLA, audit) to be specified in **SF-PATIENT-PROFILE** (Epic 4). | ✅ Approved by Nazounki (2026-05-27) |
| **D12** | **"Other" option on the phone country code** to onboard foreign patients present in an MVP country (expatriates, business visitors, diaspora). Proposed decision: **allow a foreign country code** at registration (e.g. +33, +1, +44) with manual entry, provided the **Country in the base profile remains one of the 9 MVP countries** (service area). The "service area = 9 countries" constraint is carried by the §4.3 Country field, not by the phone country code. **Operational risks**: (1) SMS OTP delivery is best-effort outside the Africa's Talking zone — a UX warning is displayed *"SMS delivery may take a few minutes for numbers outside the service area"*; (2) higher SMS cost for international numbers (× 5-10) — to be monitored via Epic 13 KPIs; (3) inability to verify the user is physically in the MVP country — accepted as a product limitation in MVP. | ✅ Approved by Nazounki (2026-05-27) |

---

## 10. Acceptance and sign-off

| Role | Name | Status | Date |
|---|---|---|---|
| Nazounki Direction | [To be filled in] | Pending | — |
| Project Direction (Paris Partners) | Vilay ENG | Pending | — |
| PM / PO (Paris Partners) | Namchhoen VENG | Author | 2026-05-22 |

---

## 11. Additional notes

- **Complete coverage assumed** — this document describes the feature **from the beginning to the end of the lifecycle** of a patient account. Items explicitly deferred to a later phase are flagged with the "post-MVP" label in the relevant sections (§4.8, §4.10, §8 Out of scope).
- **Compliance** — the feature complies with industry security standards (Argon2id-hashed password, data encrypted in transit and at rest, anti-bot verification, audit log of registrations, GDPR management compatible with the 20-year retention obligation for medical records).
- **9 MVP countries scope** — the 4 orphan CEMAC countries (Chad, CAR, Gabon, Congo Brazzaville) are deferred to post-MVP in accordance with the client decision of 2026-05-22.
