# Requirements Document

## Introduction

This document specifies the complete requirements for the patient registration and lifecycle management feature on the FUENI MVP platform. The feature covers the entire patient account lifecycle from initial self-service registration through account activation, profile management, security, and eventual account deletion.

The FUENI platform is a B2C healthcare platform targeting 9 African countries (Senegal, Côte d'Ivoire, Mali, Benin, Togo, Burkina Faso, Niger, Cameroon, DRC) that enables patients to register, search for healthcare practitioners, book appointments, and manage their medical documents.

This requirements document follows EARS (Easy Approach to Requirements Syntax) patterns and INCOSE quality rules to ensure clarity, testability, and completeness.

## Glossary

- **Patient**: An adult user (≥18 years) who registers on the FUENI platform to access healthcare services
- **Registration_System**: The system component responsible for patient account creation and initial verification
- **Verification_System**: The system component responsible for OTP generation, delivery, and validation
- **Profile_System**: The system component responsible for managing patient profile data
- **Authentication_System**: The system component responsible for login, password management, and session handling (Keycloak)
- **SMS_Gateway**: Africa's Talking service for SMS OTP delivery
- **Email_Gateway**: Brevo service for email OTP and notification delivery
- **Anti_Bot_System**: Cloudflare Turnstile service for bot protection
- **Dashboard**: The patient's personal space after successful registration and login
- **OTP**: One-Time Password - a 6-digit numeric code for verification
- **MVP**: Minimum Viable Product - the initial release scope
- **Base_Profile**: Mandatory profile fields (country, city, language) collected post-OTP verification
- **Super_Admin**: Platform administrator with elevated privileges
- **Soft_Gate**: A non-blocking verification prompt triggered before sensitive actions
- **E.164**: International telephone number format standard
- **Argon2id**: Password hashing algorithm
- **RGPD**: General Data Protection Regulation (French: Règlement Général sur la Protection des Données)

## Requirements

### Requirement 1: Patient Registration Eligibility

**User Story:** As a potential patient, I want to register on the FUENI platform, so that I can access healthcare services and book appointments with practitioners.

#### Acceptance Criteria

1. THE Registration_System SHALL accept registration requests from users who are 18 years or older
2. WHEN a user enters a date of birth indicating age less than 18 years, THE Registration_System SHALL display an inline error message stating "Vous devez avoir 18 ans ou plus pour vous inscrire"
3. WHEN a user enters a date of birth indicating age less than 18 years, THE Registration_System SHALL disable the account creation button
4. THE Registration_System SHALL validate that the date of birth is not more than 120 years in the past
5. THE Registration_System SHALL validate that the date of birth is not a future date
6. THE Registration_System SHALL calculate age based on the current date at the time of form submission
7. WHEN age validation fails, THE Registration_System SHALL prevent account creation without storing any user data

### Requirement 2: Identity Information Collection

**User Story:** As a patient, I want to provide my identity information during registration, so that healthcare practitioners can identify me during consultations.

#### Acceptance Criteria

1. THE Registration_System SHALL collect first name with length between 1 and 80 characters
2. THE Registration_System SHALL collect last name with length between 1 and 80 characters
3. THE Registration_System SHALL accept only letters, hyphens, apostrophes, and spaces in first name and last name fields
4. THE Registration_System SHALL collect date of birth in DD/MM/YYYY format for French locale
5. THE Registration_System SHALL collect date of birth in MM/DD/YYYY format for English locale
6. THE Registration_System SHALL provide a calendar selector with year selection by decades
7. THE Registration_System SHALL collect gender with options: Féminin, Masculin, Autre, Préfère ne pas répondre
8. THE Registration_System SHALL require all identity fields (first name, last name, date of birth, gender) to be completed before account creation

### Requirement 3: Dual Communication Channel Registration

**User Story:** As a patient, I want to provide both my phone number and email address during registration, so that I can receive notifications through multiple channels and have backup access methods.

#### Acceptance Criteria

1. THE Registration_System SHALL require both a phone number AND an email address during registration
2. THE Registration_System SHALL validate that the phone number conforms to E.164 format for the selected country
3. THE Registration_System SHALL validate that the email address conforms to RFC email format standards
4. THE Registration_System SHALL accept email addresses from all providers including Gmail and Yahoo
5. THE Registration_System SHALL auto-detect the country code based on IP geolocation
6. WHEN IP geolocation fails, THE Registration_System SHALL default to Senegal country code (+221)
7. THE Registration_System SHALL display an inline error "Numéro invalide pour le pays sélectionné" when phone number length is incorrect
8. THE Registration_System SHALL display an inline error "Adresse e-mail invalide" when email format is invalid
9. THE Registration_System SHALL normalize phone numbers to E.164 format before storage
10. THE Registration_System SHALL normalize email addresses to lowercase before storage
11. THE Registration_System SHALL remove decorative spaces from phone number input before validation

### Requirement 4: Communication Channel Uniqueness

**User Story:** As the platform, I want to ensure each phone number and email address is used by only one account, so that I can maintain account integrity and prevent duplicate registrations.

#### Acceptance Criteria

1. THE Registration_System SHALL enforce global uniqueness for phone numbers across all patient accounts
2. THE Registration_System SHALL enforce global uniqueness for email addresses across all patient accounts
3. WHEN a phone number is already registered, THE Registration_System SHALL display the error "Un compte existe déjà avec ce numéro. Connectez-vous"
4. WHEN an email address is already registered, THE Registration_System SHALL display the error "Un compte existe déjà avec cet e-mail. Connectez-vous"
5. THE Registration_System SHALL provide a direct link to the login page when displaying duplicate account errors
6. THE Registration_System SHALL perform uniqueness validation after normalizing phone numbers to E.164 format
7. THE Registration_System SHALL perform uniqueness validation after normalizing email addresses to lowercase

### Requirement 5: Password Policy and Security

**User Story:** As a patient, I want to create a secure password for my account, so that my personal and medical information is protected from unauthorized access.

#### Acceptance Criteria

1. THE Registration_System SHALL require passwords with minimum length of 8 characters
2. THE Registration_System SHALL require passwords with maximum length of 128 characters
3. THE Registration_System SHALL require passwords to contain at least one uppercase letter
4. THE Registration_System SHALL require passwords to contain at least one lowercase letter
5. THE Registration_System SHALL require passwords to contain at least one digit
6. THE Registration_System SHALL require passwords to contain at least one special character (any non-alphanumeric printable character except space)
7. THE Registration_System SHALL reject passwords containing space characters
8. THE Registration_System SHALL display a real-time password strength indicator with levels: Faible, Moyen, Fort, Très fort
9. THE Registration_System SHALL display a checklist of password rules with dynamic checkmarks as each rule is satisfied
10. THE Registration_System SHALL provide a visible toggle button to show or hide password characters
11. THE Authentication_System SHALL hash all passwords using Argon2id algorithm before storage
12. THE Authentication_System SHALL never store passwords in plain text
13. THE Authentication_System SHALL implement rate limiting of 5 failed login attempts per minute
14. WHEN rate limit is exceeded, THE Authentication_System SHALL block the IP address for 15 minutes
15. THE Registration_System SHALL NOT require password confirmation field during registration

### Requirement 6: Legal Consent Collection

**User Story:** As the platform, I want to collect explicit consent for terms of use and data processing, so that I comply with legal requirements and RGPD regulations.

#### Acceptance Criteria

1. THE Registration_System SHALL require acceptance of Terms and Conditions (CGU) via mandatory checkbox
2. THE Registration_System SHALL require acceptance of Privacy Policy and medical data processing via mandatory checkbox
3. THE Registration_System SHALL provide clickable links to CGU and Privacy Policy documents
4. THE Registration_System SHALL open CGU and Privacy Policy links in new browser tabs
5. WHEN consent checkboxes are not checked at submission, THE Registration_System SHALL display a red border around unchecked boxes
6. THE Registration_System SHALL prevent account creation when either consent checkbox is unchecked
7. THE Registration_System SHALL store consent acceptance timestamp for audit purposes

### Requirement 7: Anti-Bot Protection

**User Story:** As the platform, I want to prevent automated bot registrations, so that I maintain platform integrity and prevent abuse.

#### Acceptance Criteria

1. THE Registration_System SHALL integrate Cloudflare Turnstile invisible CAPTCHA on the registration form
2. THE Anti_Bot_System SHALL perform silent verification for 95% of legitimate users
3. WHEN suspicious behavior is detected, THE Anti_Bot_System SHALL present a visual challenge
4. WHEN CAPTCHA verification fails three consecutive times, THE Registration_System SHALL display the error "Vérification de sécurité échouée. Veuillez réessayer plus tard"
5. WHEN CAPTCHA verification fails three consecutive times, THE Registration_System SHALL block the IP address for 15 minutes
6. THE Registration_System SHALL validate CAPTCHA token on the server before creating an account

### Requirement 8: Registration Form Validation

**User Story:** As a patient, I want clear feedback when I make errors in the registration form, so that I can correct them and complete my registration successfully.

#### Acceptance Criteria

1. WHEN one or more required fields are empty or invalid at submission, THE Registration_System SHALL display a global error banner stating "Veuillez compléter tous les champs obligatoires marqués d'un astérisque (\*)"
2. WHEN validation fails, THE Registration_System SHALL trigger inline validation messages for all invalid fields simultaneously
3. WHEN validation fails, THE Registration_System SHALL automatically scroll to the global error banner
4. THE Registration_System SHALL mark all required fields with an asterisk (\*) in the field label
5. THE Registration_System SHALL validate all fields client-side before sending data to the server
6. THE Registration_System SHALL display a loading spinner on the submit button during server validation
7. THE Registration_System SHALL temporarily disable form fields during submission to prevent double submission
8. WHEN server validation fails, THE Registration_System SHALL re-enable the form and display appropriate error messages

### Requirement 9: Phone Number Verification via SMS OTP

**User Story:** As a patient, I want to verify my phone number during registration, so that the platform can send me important notifications and I can use it as a login identifier.

#### Acceptance Criteria

1. WHEN registration form is successfully submitted, THE Verification_System SHALL generate a 6-digit numeric OTP
2. WHEN OTP is generated, THE SMS_Gateway SHALL send the OTP to the registered phone number within 10 seconds
3. THE Verification_System SHALL set OTP validity period to 5 minutes from generation time
4. THE Verification_System SHALL allow maximum 3 OTP entry attempts per code
5. THE Verification_System SHALL allow OTP resend after 60 seconds cooldown period
6. THE Verification_System SHALL limit OTP resends to maximum 5 per hour per phone number
7. THE Registration_System SHALL redirect user to OTP verification screen after successful form submission
8. THE Verification_System SHALL display the phone number with only the last 2 digits visible
9. THE Verification_System SHALL provide 6 individual input boxes for OTP digits
10. THE Verification_System SHALL automatically focus on the first input box when the screen loads
11. THE Verification_System SHALL automatically advance to the next input box after digit entry
12. THE Verification_System SHALL accept only numeric digits in OTP input boxes
13. THE Verification_System SHALL enable the "Verify" button only when all 6 digits are entered
14. WHEN OTP is correct, THE Verification_System SHALL mark phone_verified as true
15. WHEN OTP is correct, THE Registration_System SHALL redirect user to Base Profile completion
16. WHEN OTP is incorrect, THE Verification_System SHALL display "Code incorrect. Il vous reste {n} tentatives"
17. WHEN 3 incorrect attempts are made, THE Verification_System SHALL display "Trop d'essais incorrects. Veuillez recommencer l'inscription"
18. WHEN 3 incorrect attempts are made, THE Registration_System SHALL redirect user to registration form and discard entered data
19. WHEN OTP expires, THE Verification_System SHALL display "Votre code a expiré" and enable immediate resend
20. WHEN resend limit is exceeded, THE Verification_System SHALL display "Vous avez demandé trop de renvois. Réessayez dans une heure"
21. THE Verification_System SHALL provide a "Modifier mes informations" link to return to registration form with preserved data
22. THE Verification_System SHALL use mobile numeric keyboard (inputmode="numeric") on mobile devices

### Requirement 10: Email Verification via Deferred OTP

**User Story:** As a patient, I want to verify my email address when needed, so that I can receive appointment confirmations and medical documents securely.

#### Acceptance Criteria

1. WHEN registration is completed, THE Registration_System SHALL store email address with email_verified flag set to false
2. THE Registration_System SHALL NOT block registration completion based on email verification status
3. WHEN email verification is triggered, THE Verification_System SHALL generate a 6-digit numeric OTP
4. WHEN email OTP is generated, THE Email_Gateway SHALL send the OTP to the registered email address within 30 seconds
5. THE Verification_System SHALL set email OTP validity period to 10 minutes from generation time
6. THE Verification_System SHALL allow maximum 3 email OTP entry attempts per code
7. THE Verification_System SHALL allow email OTP resend after 120 seconds cooldown period
8. THE Verification_System SHALL limit email OTP resends to maximum 5 per hour per email address
9. WHILE email_verified is false, THE Dashboard SHALL display a persistent non-dismissible banner stating "Vérifiez votre adresse e-mail"
10. THE Dashboard SHALL provide a "Vérifier maintenant" button in the email verification banner
11. THE Profile_System SHALL provide a "Vérifier mon e-mail" button in account settings
12. WHEN user attempts to book an appointment AND email_verified is false, THE Registration_System SHALL display a blocking popup requiring email verification
13. WHEN user initiates password reset AND email_verified is false, THE Authentication_System SHALL trigger email verification flow
14. THE Verification_System SHALL display the email address with first character and domain visible, middle characters masked
15. WHEN email OTP is correct, THE Verification_System SHALL mark email_verified as true
16. WHEN email OTP is correct, THE Dashboard SHALL remove the verification banner
17. WHEN email OTP is incorrect, THE Verification_System SHALL display "Code incorrect. Il vous reste {n} tentatives"
18. WHEN 3 incorrect email OTP attempts are made, THE Verification_System SHALL display "Trop d'essais incorrects. Réessayez plus tard"
19. WHEN email OTP expires, THE Verification_System SHALL display "Votre code a expiré" and enable resend button
20. THE Verification_System SHALL provide a "Plus tard" option to close email verification without completing it
21. WHEN user changes email address before verification, THE Verification_System SHALL invalidate any pending OTP codes

### Requirement 11: Base Profile Completion

**User Story:** As a patient, I want to complete my basic profile information after phone verification, so that I can access location-appropriate healthcare services in my preferred language.

#### Acceptance Criteria

1. WHEN phone OTP verification succeeds, THE Registration_System SHALL redirect user to Base Profile completion screen
2. THE Profile_System SHALL require country of residence selection from a dropdown list
3. THE Profile_System SHALL display the 9 MVP countries at the top of the country dropdown
4. THE Profile_System SHALL pre-fill country based on phone number country code
5. THE Profile_System SHALL require city selection from a dropdown list
6. THE Profile_System SHALL populate city dropdown based on selected country
7. THE Profile_System SHALL provide an "Autre" option in city dropdown for cities not listed
8. THE Profile_System SHALL require communication language selection with options: Français, English
9. THE Profile_System SHALL pre-select language based on browser language detection
10. THE Profile_System SHALL provide an optional address text field with 2-line capacity
11. THE Profile_System SHALL NOT provide a "Skip for now" option on Base Profile screen
12. THE Profile_System SHALL prevent access to Dashboard until all 3 mandatory fields are completed
13. WHEN mandatory fields are incomplete at submission, THE Profile_System SHALL display global error banner "Veuillez compléter tous les champs obligatoires marqués d'un astérisque (\*)"
14. WHEN Base Profile is successfully submitted, THE Profile_System SHALL set account_status to ACTIVE
15. WHEN Base Profile is successfully submitted, THE Registration_System SHALL redirect user to Dashboard
16. THE Profile_System SHALL allow user to modify country selection even if pre-filled
17. THE Profile_System SHALL validate that country, city, and language fields are not empty before submission

### Requirement 12: Registration Abandonment Cleanup

**User Story:** As the platform, I want to automatically clean up abandoned registrations, so that I maintain database hygiene and comply with data minimization principles.

#### Acceptance Criteria

1. WHEN an account remains in PENDING_PROFILE_BASE status for 7 days, THE Registration_System SHALL automatically delete the account
2. WHEN an abandoned account is deleted, THE Registration_System SHALL remove all associated data from Keycloak
3. WHEN an abandoned account is deleted, THE Registration_System SHALL remove all associated data from the application database
4. WHEN an abandoned account is deleted, THE Email_Gateway SHALL send a notification email stating "Votre inscription n'a pas été finalisée"
5. THE Registration_System SHALL allow the user to restart registration after abandoned account deletion
6. WHEN user reconnects before 7-day cleanup AND account is PENDING_PROFILE_BASE, THE Registration_System SHALL redirect to Base Profile completion screen
7. THE Registration_System SHALL NOT create abandoned accounts for users under 18 years (age validation occurs before account creation)

### Requirement 13: Dashboard Activation and Orientation

**User Story:** As a newly registered patient, I want to immediately access my dashboard with clear guidance, so that I understand how to use the platform effectively.

#### Acceptance Criteria

1. WHEN Base Profile is completed, THE Registration_System SHALL automatically log in the user
2. WHEN user is logged in for the first time, THE Dashboard SHALL display a personalized greeting with the user's first name
3. WHILE email_verified is false, THE Dashboard SHALL display a persistent banner with "Vérifier maintenant" button
4. THE Dashboard SHALL display an empty state for "Mes rendez-vous" section with a "Trouver un médecin" call-to-action
5. THE Dashboard SHALL display an empty state for "Mes documents" section with an "Importer une ordonnance" call-to-action
6. THE Dashboard SHALL display a profile completion badge showing percentage completed
7. THE Dashboard SHALL provide a "Compléter mon profil" call-to-action in the profile section
8. THE Dashboard SHALL NOT display a blocking welcome modal on first login
9. THE Dashboard SHALL grant immediate access to all MVP features (practitioner search, appointment booking, document upload, profile editing)
10. THE Dashboard SHALL NOT restrict any features based on profile completion status

### Requirement 14: Optional Profile Enhancement

**User Story:** As a patient, I want to add additional profile information at my convenience, so that I can enhance my experience and provide more context to healthcare practitioners.

#### Acceptance Criteria

1. THE Profile_System SHALL provide an optional complete address field (street, complement, landmark)
2. THE Profile_System SHALL provide an optional postal code field
3. THE Profile_System SHALL provide an optional emergency contact name field
4. THE Profile_System SHALL provide an optional emergency contact relationship field with options: Conjoint, Enfant, Parent, Ami, Autre
5. THE Profile_System SHALL provide an optional emergency contact phone number field
6. THE Profile_System SHALL provide an optional SMS notification preference toggle (default: ON)
7. THE Profile_System SHALL provide an optional email notification preference toggle (default: ON)
8. THE Profile_System SHALL NOT block any platform features when optional fields are incomplete
9. THE Profile_System SHALL calculate and display profile completion percentage based on optional fields filled
10. THE Profile_System SHALL send a reminder email at day 3 if profile completion is below 80%
11. THE Profile_System SHALL always send transactional notifications (OTP, appointment confirmation, payment failure, security alerts) regardless of notification preferences

### Requirement 15: Profile Modification Permissions

**User Story:** As a patient, I want to modify my profile information with appropriate security measures, so that I can keep my information current while maintaining account security.

#### Acceptance Criteria

1. THE Profile_System SHALL allow free modification of address, postal code, and city without additional verification
2. THE Profile_System SHALL allow free modification of emergency contact information without additional verification
3. THE Profile_System SHALL allow free modification of communication language without additional verification
4. THE Profile_System SHALL allow free modification of notification preferences without additional verification
5. WHEN user modifies phone number, THE Verification_System SHALL require OTP verification on the new phone number
6. WHEN user modifies email address, THE Verification_System SHALL require OTP verification on the new email address
7. WHEN user modifies password, THE Authentication_System SHALL require entry of current password
8. WHEN user modifies password, THE Authentication_System SHALL require entry of new password meeting policy requirements
9. WHEN user requests to modify first name, THE Profile_System SHALL require email submission to support with justification document
10. WHEN user requests to modify last name, THE Profile_System SHALL require email submission to support with justification document
11. WHEN user requests to modify date of birth, THE Profile_System SHALL require email submission to support with justification document
12. WHEN user requests to modify gender, THE Profile_System SHALL require email submission to support with justification document
13. WHEN user requests to modify country of residence, THE Profile_System SHALL require email submission to support with justification document
14. WHEN Super_Admin approves identity modification request, THE Profile_System SHALL log the change in audit trail
15. THE Profile_System SHALL provide clear instructions for identity modification process in the user interface

### Requirement 16: Flexible Login Authentication

**User Story:** As a patient, I want to log in using either my email or phone number, so that I have flexibility in accessing my account based on what I remember.

#### Acceptance Criteria

1. THE Authentication_System SHALL accept email address as login identifier
2. THE Authentication_System SHALL accept phone number as login identifier
3. THE Authentication_System SHALL provide a single identifier input field with placeholder "E-mail ou numéro de téléphone"
4. WHEN identifier contains @ character, THE Authentication_System SHALL treat it as an email address
5. WHEN identifier does not contain @ character, THE Authentication_System SHALL treat it as a phone number
6. THE Authentication_System SHALL normalize phone numbers by removing spaces, hyphens, and dots
7. THE Authentication_System SHALL add country code to phone numbers if missing
8. THE Authentication_System SHALL convert phone numbers to E.164 format for database lookup
9. THE Authentication_System SHALL perform case-insensitive email address matching
10. THE Authentication_System SHALL require password in addition to identifier
11. WHEN identifier format is invalid, THE Authentication_System SHALL display "Format non reconnu — saisissez un e-mail valide ou un numéro de téléphone"
12. WHEN credentials are incorrect, THE Authentication_System SHALL display "E-mail / téléphone ou mot de passe incorrect"
13. THE Authentication_System SHALL NOT reveal whether the identifier exists in the system

### Requirement 17: Password Reset Process

**User Story:** As a patient, I want to reset my password if I forget it, so that I can regain access to my account securely.

#### Acceptance Criteria

1. THE Authentication_System SHALL provide a "Mot de passe oublié" link on the login page
2. WHEN user clicks password reset link, THE Authentication_System SHALL display email address input field
3. WHEN user submits email address, THE Verification_System SHALL generate a 6-digit numeric OTP
4. WHEN password reset OTP is generated, THE Email_Gateway SHALL send the OTP to the provided email address within 30 seconds
5. THE Verification_System SHALL set password reset OTP validity to 10 minutes
6. THE Verification_System SHALL allow maximum 3 password reset OTP entry attempts
7. THE Verification_System SHALL allow password reset OTP resend after 120 seconds cooldown
8. WHEN password reset OTP is correct, THE Authentication_System SHALL display new password entry form
9. THE Authentication_System SHALL require new password to meet all password policy requirements
10. THE Authentication_System SHALL require new password confirmation entry
11. WHEN new password is successfully set, THE Authentication_System SHALL automatically log in the user
12. WHEN password reset OTP is validated AND email_verified was false, THE Verification_System SHALL set email_verified to true
13. WHEN user has lost access to email, THE Authentication_System SHALL provide support contact information
14. THE Authentication_System SHALL invalidate all existing sessions when password is reset

### Requirement 18: Session Management

**User Story:** As a patient, I want my account sessions to be managed securely, so that unauthorized users cannot access my account from other devices.

#### Acceptance Criteria

1. WHEN user changes password, THE Authentication_System SHALL invalidate all active sessions on all devices
2. WHEN user changes password, THE Authentication_System SHALL require re-login with new password
3. WHEN a session is inactive for 30 days, THE Authentication_System SHALL automatically expire the session
4. WHEN session expires, THE Authentication_System SHALL redirect user to login page
5. THE Authentication_System SHALL maintain session state across browser refreshes
6. THE Authentication_System SHALL use secure session tokens with HTTPS-only flag
7. THE Authentication_System SHALL use HttpOnly flag on session cookies to prevent XSS attacks
8. THE Authentication_System SHALL generate new session token after successful login
9. THE Authentication_System SHALL store session expiration timestamp
10. THE Authentication_System SHALL validate session token on every authenticated request

### Requirement 19: Long-Term Account Inactivity Cleanup

**User Story:** As the platform, I want to clean up inactive accounts in compliance with RGPD, so that I minimize data retention and respect user privacy.

#### Acceptance Criteria

1. WHEN an ACTIVE account has no login activity for 335 days, THE Registration_System SHALL send a warning email
2. THE warning email SHALL state "Votre compte FUENI n'a pas été utilisé depuis 11 mois. Sans connexion d'ici 30 jours, il sera supprimé conformément à notre politique RGPD"
3. WHEN an ACTIVE account has no login activity for 365 days, THE Registration_System SHALL automatically delete the account
4. WHEN an inactive account is deleted, THE Registration_System SHALL pseudonymize personal data
5. WHEN an inactive account is deleted, THE Registration_System SHALL replace name with "Patient anonyme {short_identifier}"
6. WHEN an inactive account is deleted, THE Registration_System SHALL remove profile photo
7. WHEN an inactive account is deleted, THE Registration_System SHALL remove address and contact information
8. WHEN an inactive account is deleted, THE Registration_System SHALL remove emergency contact information
9. WHEN an inactive account is deleted, THE Registration_System SHALL disable authentication account in Keycloak
10. WHEN an inactive account is deleted, THE Registration_System SHALL preserve medical records for 20 years from last consultation
11. WHEN an inactive account is deleted, THE Registration_System SHALL preserve appointment history in aggregated anonymous form
12. WHEN an inactive account is deleted, THE Registration_System SHALL prevent reuse of email and phone number for 5 years
13. WHEN user logs in after receiving warning email, THE Registration_System SHALL reset the inactivity counter

### Requirement 20: Identity Verification Responsibility

**User Story:** As the platform, I want practitioners to verify patient identity during consultations, so that I minimize registration friction while maintaining medical safety standards.

#### Acceptance Criteria

1. THE Registration_System SHALL NOT require government ID upload during patient registration
2. THE Registration_System SHALL NOT require biometric verification during patient registration
3. THE Registration_System SHALL NOT require manual Super_Admin approval for patient accounts
4. THE Registration_System SHALL provide patient identity information (first name, last name, date of birth, gender) to practitioners
5. THE Registration_System SHALL provide patient address information to practitioners when available
6. THE Profile_System SHALL display a notice that identity verification is the practitioner's responsibility during consultation
7. THE Registration_System SHALL rely on OTP verification as proof of phone and email ownership
8. THE Registration_System SHALL NOT implement platform-level KYC (Know Your Customer) for patients in MVP

### Requirement 21: SMS OTP Message Format and Delivery

**User Story:** As a patient, I want to receive clear and timely SMS verification codes, so that I can complete my registration without confusion.

#### Acceptance Criteria

1. THE SMS_Gateway SHALL deliver SMS OTP within 10 seconds of generation
2. THE SMS message SHALL follow the format "FUENI : votre code de vérification est {code}. Valide 5 minutes"
3. THE SMS message SHALL include the 6-digit OTP code
4. THE SMS message SHALL include the validity duration
5. THE SMS message SHALL identify the sender as FUENI
6. THE SMS_Gateway SHALL use Africa's Talking service for delivery
7. THE SMS_Gateway SHALL support all 9 MVP countries (Senegal, Côte d'Ivoire, Mali, Benin, Togo, Burkina Faso, Niger, Cameroon, DRC)
8. THE SMS_Gateway SHALL return delivery status to the Verification_System
9. WHEN SMS delivery fails, THE Verification_System SHALL log the failure for monitoring
10. THE SMS_Gateway SHALL handle international phone number formats correctly

### Requirement 22: Email OTP Message Format and Delivery

**User Story:** As a patient, I want to receive clear and timely email verification codes, so that I can verify my email address when needed.

#### Acceptance Criteria

1. THE Email_Gateway SHALL deliver email OTP within 30 seconds of generation
2. THE email message SHALL follow the format "Bonjour {first_name}, votre code de vérification FUENI est : {code}. Il expire dans 10 minutes"
3. THE email message SHALL include the 6-digit OTP code
4. THE email message SHALL include the validity duration
5. THE email message SHALL include a security notice "Si vous n'avez pas demandé ce code, ignorez ce message"
6. THE email message SHALL use appropriate template for French (OTP_PATIENT_EMAIL_VERIFICATION_FR)
7. THE email message SHALL use appropriate template for English (OTP_PATIENT_EMAIL_VERIFICATION_EN)
8. THE Email_Gateway SHALL use Brevo service for delivery
9. THE Email_Gateway SHALL return delivery status to the Verification_System
10. WHEN email delivery fails, THE Verification_System SHALL log the failure for monitoring
11. THE email message SHALL include FUENI branding and logo
12. THE email message SHALL be mobile-responsive

### Requirement 23: Registration Success Notification

**User Story:** As a newly registered patient, I want to receive a welcome notification, so that I have confirmation my account was created successfully.

#### Acceptance Criteria

1. WHEN account status changes to ACTIVE, THE SMS_Gateway SHALL send a welcome SMS
2. THE welcome SMS SHALL follow the format "Bienvenue sur FUENI, {first_name} ! Votre compte est créé"
3. THE welcome SMS SHALL be sent within 30 seconds of account activation
4. THE Registration_System SHALL log successful account creation with timestamp
5. THE Registration_System SHALL log the user's selected country, city, and language preferences

### Requirement 24: Data Encryption and Security

**User Story:** As a patient, I want my personal and medical data to be encrypted, so that my privacy is protected from unauthorized access.

#### Acceptance Criteria

1. THE Registration_System SHALL encrypt all data in transit using TLS 1.2 or higher
2. THE Registration_System SHALL encrypt all sensitive data at rest in the database
3. THE Registration_System SHALL store passwords using Argon2id hashing algorithm
4. THE Registration_System SHALL never log passwords in plain text
5. THE Registration_System SHALL never transmit passwords in plain text
6. THE Registration_System SHALL use secure random number generation for OTP codes
7. THE Registration_System SHALL use secure random number generation for session tokens
8. THE Registration_System SHALL implement SQL injection prevention through parameterized queries
9. THE Registration_System SHALL implement XSS prevention through output encoding
10. THE Registration_System SHALL implement CSRF protection on all state-changing operations
11. THE Registration_System SHALL log all authentication events (login, logout, password reset) for audit purposes
12. THE Registration_System SHALL log all profile modification events for audit purposes
13. THE Registration_System SHALL NOT log sensitive data (passwords, OTP codes) in audit logs

### Requirement 25: RGPD Data Export

**User Story:** As a patient, I want to export my personal data, so that I can exercise my right to data portability under RGPD.

#### Acceptance Criteria

1. THE Profile_System SHALL provide a "Export my data" option in account settings
2. WHEN user requests data export, THE Profile_System SHALL generate a JSON file containing all personal data
3. THE data export SHALL include profile information (name, date of birth, gender, contact information)
4. THE data export SHALL include appointment history
5. THE data export SHALL include uploaded personal documents
6. THE data export SHALL include notification history
7. THE data export SHALL NOT include medical records created by practitioners
8. WHEN data export is ready, THE Email_Gateway SHALL send a secure download link
9. THE download link SHALL be valid for 7 days
10. THE download link SHALL require authentication to access
11. THE Profile_System SHALL log all data export requests for audit purposes

### Requirement 26: Multi-Language Support

**User Story:** As a patient, I want to use the platform in my preferred language, so that I can understand all information and instructions clearly.

#### Acceptance Criteria

1. THE Registration_System SHALL support French language interface
2. THE Registration_System SHALL support English language interface
3. THE Registration_System SHALL detect browser language and pre-select matching interface language
4. WHEN browser language is not French or English, THE Registration_System SHALL default to French
5. THE Registration_System SHALL apply selected language to all user interface elements
6. THE Registration_System SHALL apply selected language to all email notifications
7. THE Registration_System SHALL apply selected language to all SMS notifications
8. THE Registration_System SHALL store language preference in user profile
9. THE Profile_System SHALL allow user to change language preference at any time
10. WHEN user changes language preference, THE Registration_System SHALL immediately update interface language
11. THE Registration_System SHALL use appropriate date format for selected language (DD/MM/YYYY for French, MM/DD/YYYY for English)

### Requirement 27: Mobile Responsiveness

**User Story:** As a patient using a mobile device, I want the registration process to work smoothly on my phone, so that I can register without needing a computer.

#### Acceptance Criteria

1. THE Registration_System SHALL display correctly on mobile devices with screen width 320px and above
2. THE Registration_System SHALL display correctly on tablet devices with screen width 768px and above
3. THE Registration_System SHALL display correctly on desktop devices with screen width 1024px and above
4. THE Registration_System SHALL use mobile-optimized input types (tel for phone, email for email, numeric for OTP)
5. THE Registration_System SHALL use mobile-friendly touch targets with minimum 44x44px size
6. THE Registration_System SHALL prevent horizontal scrolling on mobile devices
7. THE Registration_System SHALL use responsive font sizes that scale appropriately
8. THE Registration_System SHALL optimize form layout for mobile portrait orientation
9. THE Registration_System SHALL support mobile browser autofill for common fields
10. THE Registration_System SHALL handle mobile keyboard appearance without breaking layout

### Requirement 28: Performance and Scalability

**User Story:** As a patient, I want the registration process to be fast and responsive, so that I can complete my registration without delays or frustration.

#### Acceptance Criteria

1. THE Registration_System SHALL load the registration form within 2 seconds on 3G connection
2. THE Registration_System SHALL validate form fields within 100 milliseconds of user input
3. THE Registration_System SHALL submit registration form within 3 seconds under normal load
4. THE SMS_Gateway SHALL deliver OTP within 10 seconds of generation
5. THE Email_Gateway SHALL deliver OTP within 30 seconds of generation
6. THE Registration_System SHALL handle 100 concurrent registrations without performance degradation
7. THE Registration_System SHALL handle 1000 concurrent registrations with graceful degradation
8. THE Registration_System SHALL cache static assets (images, CSS, JavaScript) for 7 days
9. THE Registration_System SHALL compress responses using gzip or brotli
10. THE Registration_System SHALL optimize images for web delivery
11. THE Registration_System SHALL use lazy loading for non-critical resources
12. THE Registration_System SHALL provide loading indicators for all asynchronous operations

### Requirement 29: Error Handling and Recovery

**User Story:** As a patient, I want clear error messages and recovery options when something goes wrong, so that I can complete my registration despite technical issues.

#### Acceptance Criteria

1. WHEN server is unavailable, THE Registration_System SHALL display "Service temporairement indisponible. Veuillez réessayer dans quelques minutes"
2. WHEN network connection is lost, THE Registration_System SHALL display "Connexion internet perdue. Vérifiez votre connexion"
3. WHEN form submission fails, THE Registration_System SHALL preserve all entered data
4. WHEN form submission fails, THE Registration_System SHALL allow user to retry without re-entering data
5. WHEN SMS delivery fails, THE Verification_System SHALL provide option to resend immediately
6. WHEN email delivery fails, THE Verification_System SHALL provide option to resend immediately
7. WHEN unexpected error occurs, THE Registration_System SHALL log error details for debugging
8. WHEN unexpected error occurs, THE Registration_System SHALL display user-friendly error message
9. THE Registration_System SHALL provide support contact information in error messages
10. THE Registration_System SHALL implement automatic retry with exponential backoff for transient failures
11. THE Registration_System SHALL validate all user input on both client and server side
12. THE Registration_System SHALL sanitize all user input to prevent injection attacks

### Requirement 30: Accessibility Compliance

**User Story:** As a patient with disabilities, I want the registration process to be accessible, so that I can register independently using assistive technologies.

#### Acceptance Criteria

1. THE Registration_System SHALL provide text alternatives for all non-text content
2. THE Registration_System SHALL ensure all functionality is available via keyboard
3. THE Registration_System SHALL provide visible focus indicators for all interactive elements
4. THE Registration_System SHALL use semantic HTML elements for proper structure
5. THE Registration_System SHALL provide ARIA labels for all form fields
6. THE Registration_System SHALL announce form validation errors to screen readers
7. THE Registration_System SHALL maintain logical tab order through the form
8. THE Registration_System SHALL use sufficient color contrast (minimum 4.5:1 for normal text)
9. THE Registration_System SHALL not rely solely on color to convey information
10. THE Registration_System SHALL provide skip navigation links
11. THE Registration_System SHALL ensure all interactive elements have accessible names
12. THE Registration_System SHALL support browser zoom up to 200% without breaking layout
13. THE Registration_System SHALL provide clear and consistent navigation
14. THE Registration_System SHALL use descriptive link text (avoid "click here")
15. THE Registration_System SHALL provide error suggestions when validation fails

### Requirement 31: Browser Compatibility

**User Story:** As a patient, I want to register using my preferred web browser, so that I am not forced to install specific software.

#### Acceptance Criteria

1. THE Registration_System SHALL support Chrome version 90 and above
2. THE Registration_System SHALL support Firefox version 88 and above
3. THE Registration_System SHALL support Safari version 14 and above
4. THE Registration_System SHALL support Edge version 90 and above
5. THE Registration_System SHALL support mobile Safari on iOS 13 and above
6. THE Registration_System SHALL support Chrome on Android 8 and above
7. THE Registration_System SHALL degrade gracefully on unsupported browsers
8. THE Registration_System SHALL display browser compatibility notice on unsupported browsers
9. THE Registration_System SHALL use progressive enhancement approach
10. THE Registration_System SHALL provide fallbacks for modern JavaScript features

### Requirement 32: Audit Logging and Monitoring

**User Story:** As the platform administrator, I want comprehensive audit logs of registration activities, so that I can monitor system health, detect fraud, and comply with regulatory requirements.

#### Acceptance Criteria

1. THE Registration_System SHALL log all registration attempts with timestamp
2. THE Registration_System SHALL log all successful registrations with user identifier
3. THE Registration_System SHALL log all failed registration attempts with reason
4. THE Registration_System SHALL log all OTP generation events with phone/email identifier
5. THE Registration_System SHALL log all OTP validation attempts with success/failure status
6. THE Registration_System SHALL log all login attempts with identifier and IP address
7. THE Registration_System SHALL log all password reset requests with email identifier
8. THE Registration_System SHALL log all profile modification events with changed fields
9. THE Registration_System SHALL log all account deletion events with reason
10. THE Registration_System SHALL NOT log sensitive data (passwords, OTP codes) in audit logs
11. THE Registration_System SHALL retain audit logs for minimum 2 years
12. THE Registration_System SHALL provide audit log search and filtering capabilities for administrators
13. THE Registration_System SHALL alert administrators when suspicious patterns are detected
14. THE Registration_System SHALL monitor OTP delivery success rates
15. THE Registration_System SHALL monitor registration completion rates
16. THE Registration_System SHALL monitor registration abandonment rates by step

### Requirement 33: Rate Limiting and Abuse Prevention

**User Story:** As the platform, I want to prevent abuse of the registration system, so that I protect system resources and prevent fraudulent account creation.

#### Acceptance Criteria

1. THE Registration_System SHALL limit registration attempts to 5 per hour per IP address
2. THE Registration_System SHALL limit OTP requests to 5 per hour per phone number
3. THE Registration_System SHALL limit OTP requests to 5 per hour per email address
4. THE Registration_System SHALL limit login attempts to 5 per minute per identifier
5. THE Registration_System SHALL limit password reset requests to 3 per hour per email address
6. WHEN rate limit is exceeded, THE Registration_System SHALL return HTTP 429 status code
7. WHEN rate limit is exceeded, THE Registration_System SHALL display "Trop de tentatives. Veuillez réessayer plus tard"
8. THE Registration_System SHALL implement exponential backoff for repeated violations
9. THE Registration_System SHALL temporarily block IP addresses with excessive failed attempts
10. THE Registration_System SHALL monitor for patterns indicating automated abuse
11. THE Registration_System SHALL integrate with Anti_Bot_System for additional protection
12. THE Registration_System SHALL whitelist known good IP addresses (e.g., corporate networks)

### Requirement 34: Country-Specific Validation

**User Story:** As a patient in one of the 9 MVP countries, I want the system to correctly validate my phone number format, so that I can register successfully with my local number.

#### Acceptance Criteria

1. THE Registration_System SHALL validate Senegal phone numbers (8 digits, +221 prefix)
2. THE Registration_System SHALL validate Côte d'Ivoire phone numbers (8 digits, +225 prefix)
3. THE Registration_System SHALL validate Mali phone numbers (8 digits, +223 prefix)
4. THE Registration_System SHALL validate Benin phone numbers (8 digits, +229 prefix)
5. THE Registration_System SHALL validate Togo phone numbers (8 digits, +228 prefix)
6. THE Registration_System SHALL validate Burkina Faso phone numbers (8 digits, +226 prefix)
7. THE Registration_System SHALL validate Niger phone numbers (8 digits, +227 prefix)
8. THE Registration_System SHALL validate Cameroon phone numbers (9 digits, +237 prefix)
9. THE Registration_System SHALL validate DRC phone numbers (9 digits, +243 prefix)
10. THE Registration_System SHALL use libphonenumber library for phone number validation
11. THE Registration_System SHALL display country-specific phone number format examples in placeholders
12. THE Registration_System SHALL display the 9 MVP countries at the top of country selection dropdowns

### Requirement 35: Session State Preservation

**User Story:** As a patient, I want my registration progress to be preserved if I navigate away, so that I don't lose my entered information.

#### Acceptance Criteria

1. THE Registration_System SHALL store registration form data in browser sessionStorage
2. THE Registration_System SHALL restore form data when user returns to registration page
3. THE Registration_System SHALL preserve form data when user clicks "Modifier mes informations" from OTP screen
4. THE Registration_System SHALL clear sessionStorage after successful registration
5. THE Registration_System SHALL clear sessionStorage after 24 hours of inactivity
6. THE Registration_System SHALL NOT store sensitive data (password) in sessionStorage
7. THE Registration_System SHALL encrypt form data before storing in sessionStorage
8. THE Registration_System SHALL validate restored data before populating form fields
9. THE Registration_System SHALL handle sessionStorage quota exceeded errors gracefully
10. THE Registration_System SHALL provide option to clear saved data manually

### Requirement 36: Email Deliverability

**User Story:** As a patient, I want to reliably receive email notifications, so that I don't miss important verification codes and account information.

#### Acceptance Criteria

1. THE Email_Gateway SHALL implement SPF (Sender Policy Framework) records
2. THE Email_Gateway SHALL implement DKIM (DomainKeys Identified Mail) signatures
3. THE Email_Gateway SHALL implement DMARC (Domain-based Message Authentication) policy
4. THE Email_Gateway SHALL use a dedicated IP address with good reputation
5. THE Email_Gateway SHALL monitor email bounce rates
6. THE Email_Gateway SHALL monitor email spam complaint rates
7. THE Email_Gateway SHALL maintain bounce rate below 5%
8. THE Email_Gateway SHALL maintain spam complaint rate below 0.1%
9. THE Email_Gateway SHALL provide unsubscribe link in marketing emails (not transactional)
10. THE Email_Gateway SHALL honor unsubscribe requests within 24 hours
11. THE Email_Gateway SHALL use plain text alternative for HTML emails
12. THE Email_Gateway SHALL include reminder to check spam folder in OTP emails
13. THE Email_Gateway SHALL retry failed email deliveries up to 3 times
14. THE Email_Gateway SHALL log all email delivery failures for investigation

### Requirement 37: SMS Deliverability

**User Story:** As a patient, I want to reliably receive SMS notifications, so that I can complete phone verification without delays.

#### Acceptance Criteria

1. THE SMS_Gateway SHALL use Africa's Talking service with high delivery rates
2. THE SMS_Gateway SHALL support all 9 MVP countries
3. THE SMS_Gateway SHALL use appropriate sender ID for each country
4. THE SMS_Gateway SHALL monitor SMS delivery success rates
5. THE SMS_Gateway SHALL maintain delivery success rate above 95%
6. THE SMS_Gateway SHALL retry failed SMS deliveries up to 2 times
7. THE SMS_Gateway SHALL log all SMS delivery failures for investigation
8. THE SMS_Gateway SHALL handle network operator-specific delivery issues
9. THE SMS_Gateway SHALL provide delivery status callbacks
10. THE SMS_Gateway SHALL support Unicode characters for international names
11. THE SMS_Gateway SHALL optimize message length to avoid multi-part SMS
12. THE SMS_Gateway SHALL handle rate limits imposed by mobile operators

### Requirement 38: Data Validation and Sanitization

**User Story:** As the platform, I want to validate and sanitize all user input, so that I prevent security vulnerabilities and maintain data quality.

#### Acceptance Criteria

1. THE Registration_System SHALL validate all input fields on both client and server side
2. THE Registration_System SHALL sanitize all text input to remove potentially harmful characters
3. THE Registration_System SHALL escape HTML special characters in user input
4. THE Registration_System SHALL validate email addresses using RFC-compliant regex
5. THE Registration_System SHALL validate phone numbers using libphonenumber library
6. THE Registration_System SHALL validate date of birth as a valid date
7. THE Registration_System SHALL reject dates of birth in the future
8. THE Registration_System SHALL reject dates of birth more than 120 years in the past
9. THE Registration_System SHALL trim whitespace from all text inputs
10. THE Registration_System SHALL normalize Unicode characters in names
11. THE Registration_System SHALL reject input containing SQL injection patterns
12. THE Registration_System SHALL reject input containing XSS attack patterns
13. THE Registration_System SHALL validate field lengths match database column constraints
14. THE Registration_System SHALL provide specific error messages for each validation failure
15. THE Registration_System SHALL log validation failures for security monitoring

### Requirement 39: Internationalization Support

**User Story:** As a patient, I want to see dates, times, and numbers formatted according to my locale, so that information is presented in a familiar format.

#### Acceptance Criteria

1. THE Registration_System SHALL format dates according to selected language (DD/MM/YYYY for French, MM/DD/YYYY for English)
2. THE Registration_System SHALL format times using 24-hour format for French locale
3. THE Registration_System SHALL format times using 12-hour format with AM/PM for English locale
4. THE Registration_System SHALL use appropriate decimal separator for selected locale
5. THE Registration_System SHALL use appropriate thousands separator for selected locale
6. THE Registration_System SHALL display phone numbers with country-appropriate formatting
7. THE Registration_System SHALL support right-to-left text direction for future Arabic support
8. THE Registration_System SHALL use locale-appropriate currency symbols when displaying prices
9. THE Registration_System SHALL translate all user-facing text to selected language
10. THE Registration_System SHALL use culturally appropriate icons and imagery
11. THE Registration_System SHALL handle character encoding correctly for all supported languages
12. THE Registration_System SHALL support Unicode characters in all text fields

### Requirement 40: Testing and Quality Assurance

**User Story:** As the development team, I want comprehensive test coverage, so that I can ensure the registration system works correctly and reliably.

#### Acceptance Criteria

1. THE Registration_System SHALL have unit test coverage of at least 80% for business logic
2. THE Registration_System SHALL have integration tests for all API endpoints
3. THE Registration_System SHALL have end-to-end tests for complete registration flow
4. THE Registration_System SHALL have tests for all validation rules
5. THE Registration_System SHALL have tests for all error handling scenarios
6. THE Registration_System SHALL have tests for OTP generation and validation
7. THE Registration_System SHALL have tests for password hashing and verification
8. THE Registration_System SHALL have tests for session management
9. THE Registration_System SHALL have tests for rate limiting
10. THE Registration_System SHALL have tests for all supported browsers
11. THE Registration_System SHALL have tests for mobile responsiveness
12. THE Registration_System SHALL have tests for accessibility compliance
13. THE Registration_System SHALL have performance tests for concurrent users
14. THE Registration_System SHALL have security tests for common vulnerabilities
15. THE Registration_System SHALL have tests for data migration and rollback

## Out of Scope for MVP

The following features are explicitly excluded from the MVP scope and will be considered for post-MVP releases:

### Post-MVP Features

1. **Multi-Factor Authentication (MFA)**: SMS, email, authenticator app, or passkey-based MFA
2. **Dependent Profiles**: Management of minor children or elderly dependents under guardianship
3. **Voluntary Account Deletion**: Two-step deletion process with 30-day retraction period
4. **Platform Identity Verification**: KYC verification using ID scanning or biometric verification
5. **Social Login**: Authentication via Google, Apple, or Facebook accounts
6. **Passwordless Login**: Phone number + OTP SMS only authentication (Mobile Money style)
7. **Session Management UI**: Visualization of active sessions with remote device revocation
8. **Suspicious Activity Detection**: Alerts for new device login, device fingerprinting
9. **Password Breach Detection**: Integration with Have I Been Pwned (HIBP) API
10. **Granular Notification Preferences**: Per-type × per-channel × quiet hours × frequency controls
11. **WhatsApp Business Notifications**: Alternative notification channel
12. **Self-Declared Medical Information**: Blood type, allergies, current treatments, medical history
13. **Declared Primary Care Physician**: Persistent reference to a FUENI practitioner
14. **Proactive Medical Record Sharing**: Sharing patient records with practitioners outside consultation context
15. **Additional Identity Fields**: Birth name, place of birth for enhanced practitioner verification
16. **Minor Registration**: Registration of users under 18 with parental consent
17. **Recovery Security Questions**: Fallback for simultaneous loss of phone and email access

### Features Covered in Separate Specifications

1. **Recurring Login Flow**: Covered in SF-LOGIN specification
2. **Profile Modification Details**: Covered in SF-PATIENT-PROFIL specification (Epic 4)
3. **Appointment Booking**: Covered in SF-PATIENT-SEARCH-BOOKING specification (Epic 11)
4. **Medical Document Management**: Covered in SF-PATIENT-DOCUMENTS specification (Epic 5)

## Decisions Requiring Nazounki Validation

1. **D3**: Dual channel requirement (phone AND email both mandatory) - Aligned with industry standards
2. **D4**: No platform identity verification for patients in MVP - Practitioner responsibility model
3. **D5**: Confirm 9 MVP countries (UEMOA + Cameroon + DRC) - Chad, CAR, Gabon, Congo Brazzaville post-MVP
4. **D6**: Confirm 20-year medical record retention after account deletion
5. **D7**: Confirm dependent profiles are post-MVP (one account = one adult in MVP)
6. **D8**: MFA deferred to post-MVP - Aligned with B2C healthcare standards
7. **D9**: Flexible login identifier (email OR phone) - Aligned with African mobile-first context
8. **D10**: Date of birth and gender collected at registration (not in base profile) - Enables age validation before account creation
9. **D11**: Level 3 profile modifications (identity fields) via manual email process in MVP - Low volume expected

## Compliance and Standards

This requirements document ensures compliance with:

- **RGPD (GDPR)**: Data minimization, consent management, right to portability, right to deletion
- **NIST SP 800-63B**: Password policy recommendations
- **WCAG 2.1 Level AA**: Accessibility standards (where applicable)
- **OWASP Top 10**: Security best practices
- **ISO 27001**: Information security management
- **Healthcare Data Protection**: 20-year medical record retention
- **E.164**: International phone number format
- **RFC 5322**: Email address format

## Revision History

| Version | Date       | Author  | Changes                                                                                          |
| ------- | ---------- | ------- | ------------------------------------------------------------------------------------------------ |
| 1.0     | 2025-01-XX | Kiro AI | Initial requirements document based on NAZOUNKI_SF_PATIENT_REGISTRATION functional specification |
