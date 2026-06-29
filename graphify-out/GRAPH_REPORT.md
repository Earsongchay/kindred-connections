# Graph Report - UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  (2026-05-29)

## Corpus Check
- 1 files · ~12,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 120 nodes · 124 edges · 30 communities (9 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Base Profile & OTP Fields|Base Profile & OTP Fields]]
- [[_COMMUNITY_Phone Country Code & Geography|Phone Country Code & Geography]]
- [[_COMMUNITY_Identity Fields & Legal Consent|Identity Fields & Legal Consent]]
- [[_COMMUNITY_Epics & Product Roadmap|Epics & Product Roadmap]]
- [[_COMMUNITY_Authentication Security Stack|Authentication Security Stack]]
- [[_COMMUNITY_GDPR Data Retention & Deletion|GDPR Data Retention & Deletion]]
- [[_COMMUNITY_Profile Modification Levels|Profile Modification Levels]]
- [[_COMMUNITY_Core Decisions & Verification Policy|Core Decisions & Verification Policy]]
- [[_COMMUNITY_Password Policy|Password Policy]]
- [[_COMMUNITY_Flexible Login Identifier|Flexible Login Identifier]]
- [[_COMMUNITY_R1 Age Gate|R1 Age Gate]]
- [[_COMMUNITY_R3 Consent Required|R3 Consent Required]]
- [[_COMMUNITY_R4 Self-Service Registration|R4 Self-Service Registration]]
- [[_COMMUNITY_R5 Channel Uniqueness|R5 Channel Uniqueness]]
- [[_COMMUNITY_R6 Anti-Bot Protection|R6 Anti-Bot Protection]]
- [[_COMMUNITY_R7 Registration Journey Steps|R7 Registration Journey Steps]]
- [[_COMMUNITY_R7bis No Admin Validation|R7bis No Admin Validation]]
- [[_COMMUNITY_R9 Address for Identity Aid|R9 Address for Identity Aid]]
- [[_COMMUNITY_R13 OTP Rules|R13 OTP Rules]]
- [[_COMMUNITY_R15 No Dependents MVP|R15 No Dependents MVP]]
- [[_COMMUNITY_R16 Deletion Policy|R16 Deletion Policy]]
- [[_COMMUNITY_R19 No Self-Declared Medical Data|R19 No Self-Declared Medical Data]]
- [[_COMMUNITY_R20 Session Management Post-MVP|R20 Session Management Post-MVP]]
- [[_COMMUNITY_D2 Communication Templates|D2 Communication Templates]]
- [[_COMMUNITY_D6 Medical Record Retention|D6 Medical Record Retention]]
- [[_COMMUNITY_D7 Dependent Profiles Deferred|D7 Dependent Profiles Deferred]]
- [[_COMMUNITY_Post-MVP Social Login|Post-MVP Social Login]]
- [[_COMMUNITY_Post-MVP Minor Registration|Post-MVP Minor Registration]]
- [[_COMMUNITY_Post-MVP WhatsApp Notifications|Post-MVP WhatsApp Notifications]]
- [[_COMMUNITY_Paris Partners Team|Paris Partners Team]]

## God Nodes (most connected - your core abstractions)
1. `Step 4.1 Registration` - 18 edges
2. `Functional Specification - Patient Account Lifecycle` - 15 edges
3. `Version 1.1 (2026-05-28)` - 9 edges
4. `Step 4.3 Base Profile` - 9 edges
5. `Step 4.9 Account Security` - 7 edges
6. `Step 4.2.1 SMS OTP Phone Verification blocking` - 6 edges
7. `Step 4.4 Activation and Dashboard` - 6 edges
8. `Step 4.2.2 Deferred Email OTP non-blocking` - 5 edges
9. `Step 4.7 Profile Modification 3 Levels` - 5 edges
10. `Step 4.10 Account Deletion post-MVP` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Mechanism D+7 automatic cleanup of PENDING_PROFILE_BASE accounts` --calls--> `Service Keycloak auth Argon2id rate-limit brute-force detection`  [INFERRED]
  UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md → UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  _Bridges community 4 → community 0_
- `Functional Specification - Patient Account Lifecycle` --references--> `Future FS SF-LOGIN`  [EXTRACTED]
  UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md → UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  _Bridges community 3 → community 4_
- `Functional Specification - Patient Account Lifecycle` --references--> `Future FS SF-PATIENT-PROFILE`  [EXTRACTED]
  UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md → UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  _Bridges community 3 → community 6_
- `Functional Specification - Patient Account Lifecycle` --references--> `Version 1.1 (2026-05-28)`  [EXTRACTED]
  UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md → UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  _Bridges community 3 → community 1_
- `Functional Specification - Patient Account Lifecycle` --references--> `Step 4.10 Account Deletion post-MVP`  [EXTRACTED]
  UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md → UPDATE_NAZOUNKI_SF_PATIENT_REGISTRATION_EN.md  _Bridges community 3 → community 5_

## Hyperedges (group relationships)
- **Mandatory 4-Step Registration Journey** — step_registration, step_sms_otp, step_base_profile, step_activation [EXTRACTED 1.00]
- **Registration Form Fields** — field_first_name, field_last_name, field_date_of_birth, field_sex_at_birth, field_email, field_phone_country_code, field_phone_number, field_password, compliance_terms_of_use, compliance_privacy_policy [EXTRACTED 1.00]
- **Base Profile Required Fields** — field_country, field_city, field_language [EXTRACTED 1.00]
- **MVP Security Stack no MFA** — security_argon2id, security_rate_limiting, security_session_invalidation, security_session_expiry, service_keycloak, service_cloudflare_turnstile [EXTRACTED 1.00]
- **Post-MVP Deferred Features** — postmvp_mfa, postmvp_dependent_profiles, postmvp_account_deletion, postmvp_hibp, postmvp_suspicious_activity, postmvp_social_login, postmvp_minor_registration, postmvp_whatsapp_notifications [EXTRACTED 1.00]
- **Decisions D3 through D12 Approved by Nazounki 2026-05-27** — decision_d3, decision_d4, decision_d5, decision_d6, decision_d7, decision_d8, decision_d9, decision_d10, decision_d11, decision_d12 [EXTRACTED 1.00]
- **Version 1.1 Changes** — v11_change_d12_other_option, v11_change_sex_at_birth, v11_change_country_field, v11_change_country_level2, v11_change_turnstile_managed, v11_change_r10_rewording, v11_change_ip_default [EXTRACTED 1.00]
- **Profile Modification 3-Level Rights Model** — profile_mod_level1, profile_mod_level2, profile_mod_level3 [EXTRACTED 1.00]
- **External Services** — service_africas_talking, service_brevo, service_cloudflare_turnstile, service_keycloak, service_libphonenumber [EXTRACTED 1.00]
- **Email OTP Trigger Conditions** — step_deferred_otp, mechanism_soft_gate, epic_11_booking, step_account_security [EXTRACTED 1.00]

## Communities (30 total, 21 thin omitted)

### Community 0 - "Base Profile & OTP Fields"
Cohesion: 0.14
Nodes (16): Epic 1 Patient Registration, Field Address optional, Field City cascading from Country, Flag email_verified, Field Communication Language FR EN, Field OTP Code 6 digits, Flag phone_verified, Mechanism D+7 automatic cleanup of PENDING_PROFILE_BASE accounts (+8 more)

### Community 1 - "Phone Country Code & Geography"
Cohesion: 0.15
Nodes (15): D12 Other option on phone country code for foreign patients approved, Epic 13 KPIs Analytics, Field Country Base Profile 9 MVP countries, Field Phone Country Code 9 MVPs plus Other, Mechanism IP Geolocation for country code auto-detection, 9 MVP Countries UEMOA Cameroon DRC, R10 9 MVP countries phone code allows Other Country strictly 9 only, Security Cloudflare Turnstile managed mode anti-bot (+7 more)

### Community 2 - "Identity Fields & Legal Consent"
Cohesion: 0.15
Nodes (15): Consent Privacy Policy GDPR data processing mandatory checkbox, Consent Terms of Use CGU mandatory checkbox, D1 Terms of Use and Privacy Policy texts in progress, D10 DOB and sex at birth collected at registration 4.1 approved, Entity Patient adult 18 or older 1 account, Field Date of Birth, Field Email Address, Field First Name (+7 more)

### Community 3 - "Epics & Product Roadmap"
Cohesion: 0.17
Nodes (13): Entity Practitioner Doctor, Epic 11 Appointment Booking, Epic 14 Notifications Polish and Admin, Epic 4 Patient Account and Profile Dashboard, Epic 5 Patient Documents, Future FS SF-PATIENT-DOCUMENTS, Future FS SF-PATIENT-SEARCH-BOOKING, Post-MVP Dependent Profiles children parents (+5 more)

### Community 4 - "Authentication Security Stack"
Cohesion: 0.24
Nodes (10): D8 MFA deferred to post-MVP SF-LOGIN approved, Future FS SF-LOGIN, Post-MVP Multi-Factor Authentication SF-LOGIN, Post-MVP Suspicious Activity Detection Device Fingerprinting SF-LOGIN, Security Argon2id Password Hashing, Security Rate-Limiting and Temporary Lockout Keycloak Brute Force Detection, Security Session Expiration by Inactivity 30 days, Security Automatic Session Invalidation on Password Change (+2 more)

### Community 5 - "GDPR Data Retention & Deletion"
Cohesion: 0.20
Nodes (10): Compliance GDPR data protection deletion portability retention, Mechanism D+335 GDPR inactivity warning email, Mechanism D+365 automatic GDPR deletion of inactive ACTIVE accounts, Mechanism JSON Data Export GDPR art 20 portability, Mechanism Pseudonymization at D+30 after deletion request, Post-MVP Voluntary Account Deletion, R17 Medical records kept 20 years from last consultation even after deletion, R18 Patient can export personal data in JSON GDPR art 20 portability (+2 more)

### Community 6 - "Profile Modification Levels"
Cohesion: 0.22
Nodes (9): D11 Level 3 profile modification via manual email process in MVP approved, Entity Super Admin, Future FS SF-PATIENT-PROFILE, Profile Modification Level 1 Free no confirmation, Profile Modification Level 2 OTP confirmation, Profile Modification Level 3 Super Admin email request, R11 Profile modification 3 levels by sensitivity, Step 4.7 Profile Modification 3 Levels (+1 more)

### Community 7 - "Core Decisions & Verification Policy"
Cohesion: 0.33
Nodes (6): D3 Phone AND email both required dual-OTP strategy approved, D4 No platform identity verification for patients in MVP approved, D5 9 MVP countries confirmed UEMOA Cameroon DRC approved, Entity Nazounki Client, R2 Phone AND Email both required phone OTP blocking email OTP deferred, R8 No enhanced platform identity verification for patients in MVP

### Community 8 - "Password Policy"
Cohesion: 0.50
Nodes (4): Standard NIST SP 800-63B password policy no confirmation field, Field Password, Post-MVP HIBP Compromised Password Check, R12 Password policy 8-128 chars Argon2id rate-limit lockout no forced expiration NIST SP 800-63B

## Knowledge Gaps
- **3 isolated node(s):** `Version 1.0 (2026-05-22)`, `Future FS SF-PATIENT-SEARCH-BOOKING`, `Future FS SF-PATIENT-DOCUMENTS`
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Functional Specification - Patient Account Lifecycle` connect `Epics & Product Roadmap` to `Base Profile & OTP Fields`, `Phone Country Code & Geography`, `Identity Fields & Legal Consent`, `Authentication Security Stack`, `GDPR Data Retention & Deletion`, `Profile Modification Levels`?**
  _High betweenness centrality (0.416) - this node is a cross-community bridge._
- **Why does `Step 4.1 Registration` connect `Identity Fields & Legal Consent` to `Base Profile & OTP Fields`, `Password Policy`, `Epics & Product Roadmap`, `Phone Country Code & Geography`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Why does `Step 4.3 Base Profile` connect `Base Profile & OTP Fields` to `Phone Country Code & Geography`, `Epics & Product Roadmap`, `GDPR Data Retention & Deletion`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `Version 1.0 (2026-05-22)`, `Field First Name`, `Field Last Name` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base Profile & OTP Fields` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._