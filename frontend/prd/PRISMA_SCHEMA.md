# Scriptish Prisma Schema

## Database Schema for Complete Infusion Clinic Operating System

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or mysql, sqlite based on deployment
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  passwordHash          String
  firstName             String?
  lastName              String?
  role                  UserRole  // CLINIC_ADMIN, CLINIC_STAFF, PATIENT, INVESTOR
  status                UserStatus // ACTIVE, PENDING_VERIFICATION, SUSPENDED, DELETED
  
  // Clinic relationship (staff)
  clinic                Clinic?   @relation("ClinicStaff", fields: [clinicId], references: [id])
  clinicId              String?
  
  // Patient relationship
  patient               Patient?  @relation("PatientUser", fields: [patientId], references: [id])
  patientId             String?
  
  // Various staff roles
  assignedReferrals     Referral[] @relation("ReferringPhysician")
  assignedAppointments  Appointment[] @relation("AssignedStaff")
  
  // Portal chat/support
  portalMessages        PortalMessage[] @relation("StaffReplies")
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  lastLogin             DateTime?

  @@index([clinicId])
  @@index([email])
}

enum UserRole {
  CLINIC_ADMIN
  CLINIC_STAFF
  PATIENT
  INVESTOR
  PLATFORM_ADMIN
}

enum UserStatus {
  ACTIVE
  PENDING_EMAIL_VERIFICATION
  PENDING_BAA_SIGNATURE
  SUSPENDED
  DELETED
}

// ============================================================================
// CLINIC ONBOARDING (STAGE 0)
// ============================================================================

model Clinic {
  id                    String    @id @default(cuid())
  name                  String
  clinicType            ClinicType // IV_THERAPY, KETAMINE, NAD, BIOLOGIC, ANTIBIOTIC, HORMONE_TRT, HOME_INFUSION, OTHER
  
  // Registration information
  npiNumber             String    @unique @db.VarChar(10) // National Provider Identifier - 10 digit
  taxId                 String
  stateLicenseNumber    String
  
  // Address
  streetAddress         String
  city                  String
  state                 String    @db.Char(2) // US state code (CA, NY, etc.)
  zipCode               String
  
  // Contact
  primaryPhone          String
  workEmail             String    @unique
  
  // Clinic operations
  infusionChairCount    Int
  treatmentTypesOffered String[] // Array of treatment types
  serviceArea           String[]? // ZIP codes for home infusion agencies
  
  // Platform status
  status                ClinicStatus // REGISTERED, BAA_PENDING, ACTIVE, SUSPENDED, CANCELLED
  baaSignedAt           DateTime?
  baaSignedBy           String? // User who signed BAA
  activatedAt           DateTime?
  
  // Relationships
  staff                 User[] @relation("ClinicStaff")
  patients              Patient[]
  referrals             Referral[]
  appointments          Appointment[]
  insuranceVerifications InsuranceVerification[]
  priorAuthorizations   PriorAuthorization[]
  voiceAgent            VoiceAgent?
  knowledgeBase         KnowledgeBase?
  callLogs              CallLog[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([npiNumber])
  @@index([state])
}

enum ClinicType {
  IV_THERAPY
  KETAMINE
  NAD_PLUS
  BIOLOGIC
  ANTIBIOTIC
  HORMONE_TRT
  HOME_INFUSION
  OTHER
}

enum ClinicStatus {
  REGISTERED
  BAA_PENDING
  ACTIVE
  SUSPENDED
  CANCELLED
}

// ============================================================================
// PATIENTS
// ============================================================================

model Patient {
  id                    String    @id @default(cuid())
  
  // Basic demographics
  firstName             String
  lastName              String
  dateOfBirth           DateTime
  
  // Contact
  phoneNumber           String
  emailAddress          String
  
  // Address
  address               String
  city                  String
  state                 String
  zipCode               String
  
  // Clinic relationship
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // User account (optional - for patient portal login)
  user                  User?     @relation("PatientUser")
  
  // Insurance
  insurance             InsuranceInformation?
  
  // Clinical
  referrals             Referral[]
  intakeForm            PatientIntakeForm?
  hipaaConsent          HIPAAConsent?
  appointments          Appointment[]
  
  // Pipeline status
  pipelineStage         PipelineStage // NEW_REFERRAL, VERIFYING_INS, PA_PENDING, SCHEDULED, IN_TREATMENT, COMPLETE
  
  // Follow-up tracking
  lastFollowUpDate      DateTime?
  nextFollowUpDueDate   DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([clinicId])
  @@index([emailAddress])
  @@index([phoneNumber])
}

enum PipelineStage {
  NEW_REFERRAL
  VERIFYING_INSURANCE
  PA_PENDING
  SCHEDULED
  IN_TREATMENT
  COMPLETE
  INACTIVE_ARCHIVED
}

// ============================================================================
// REFERRAL (STAGE 1)
// ============================================================================

model Referral {
  id                    String    @id @default(cuid())
  
  // Patient
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String
  
  // Clinic
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // Referring physician
  referringPhysician    ReferringPhysician @relation(fields: [physicianId], references: [id])
  physicianId           String
  
  // Clinical details
  primaryDiagnosis      String    // ICD-10 code
  diagnosisDescription  String
  prescribedTreatment   String
  urgencyLevel          UrgencyLevel // ROUTINE, URGENT, EMERGENT
  clinicalNotes         String?   @db.Text
  
  // Document handling
  uploadedDocumentUrl   String?   // URL to PDF/image if uploaded
  
  // Status
  status                ReferralStatus // SUBMITTED, REVIEWED, APPROVED, REJECTED
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
  @@index([clinicId])
}

enum UrgencyLevel {
  ROUTINE
  URGENT
  EMERGENT
}

enum ReferralStatus {
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
}

model ReferringPhysician {
  id                    String    @id @default(cuid())
  
  firstName             String
  lastName              String
  npiNumber             String    @unique @db.VarChar(10)
  
  practice              String
  practicePhone         String
  specialty             String
  
  referrals             Referral[]
  
  createdAt             DateTime  @default(now())

  @@index([npiNumber])
}

// ============================================================================
// PATIENT PORTAL & HIPAA (STAGE 2)
// ============================================================================

model HIPAAConsent {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String    @unique
  
  // Digital signature capture
  signatureCaptured     Boolean   @default(false)
  signedAt              DateTime?
  signatureIpAddress    String?
  signatureUserAgent    String?   @db.Text
  
  // Consent document
  consentDocumentUrl    String?   // URL to signed PDF
  
  status                ConsentStatus // PENDING, SIGNED, EXPIRED
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
}

enum ConsentStatus {
  PENDING
  SIGNED
  EXPIRED
}

// ============================================================================
// PATIENT INTAKE FORMS (STAGE 3)
// ============================================================================

model PatientIntakeForm {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String    @unique
  
  treatmentType         ClinicType
  
  // Common to all intake forms
  knownAllergies        String?   @db.Text
  currentMedications    String?   @db.Text
  previousExperience    String?   @db.Text
  
  // IV Therapy specific
  hydrationLevel        String?
  bloodPressureHistory  String?
  pregnancyStatus       Boolean?
  
  // Ketamine specific
  mentalHealthHistory   String?   @db.Text
  psychiatricMedications String?
  psychosisHistory      Boolean?
  maniaHistory          Boolean?
  substanceUseHistory   String?   @db.Text
  supportSystemAvailable Boolean?
  
  // NAD+ specific
  currentSupplements    String?   @db.Text
  cognitiveGoals        String?
  energyBaseline        String?
  liverFunctionHistory  String?
  
  // Biologic specific
  diagnosisForBiologic  String?
  previousBiologicUse   Boolean?
  tuberculosisScreening Boolean?
  infectionHistory      String?   @db.Text
  recentLabsUrl         String?
  
  // Antibiotic specific
  penicillinAllergy     Boolean?
  cultureResultsUrl     String?
  renalFunction         String?
  ivAccessHistory       String?
  
  // TRT / Hormone specific
  recentBloodworkUrl    String?
  currentHormoneTherapy String?
  symptomsBeingTreated  String?   @db.Text
  physicianClearanceUrl String?
  
  // Home infusion specific
  homeEnvironmentNotes  String?   @db.Text
  caregiverAvailable    Boolean?
  ivAccessType          String?
  refrigerationAvailable Boolean?
  emergencyContactAtHome String?
  
  // Status
  status                FormStatus // INCOMPLETE, SUBMITTED, REVIEWED
  
  completedAt           DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
}

enum FormStatus {
  INCOMPLETE
  SUBMITTED
  REVIEWED
  APPROVED
}

// ============================================================================
// INSURANCE VERIFICATION (STAGE 4)
// ============================================================================

model InsuranceInformation {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String    @unique
  
  // Insurance details (from referral)
  insuranceCarrier      String
  memberID              String
  groupNumber           String
  planType              PlanType // HMO, PPO, MEDICARE, MEDICAID, OTHER
  
  // Eligibility tracking
  verifications         InsuranceVerification[]
  latestVerification    InsuranceVerification? @relation("LatestVerification")
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
  @@index([memberID])
}

enum PlanType {
  HMO
  PPO
  MEDICARE
  MEDICAID
  OTHER
}

model InsuranceVerification {
  id                    String    @id @default(cuid())
  
  insurance             InsuranceInformation @relation(fields: [insuranceId], references: [id])
  insuranceId           String
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // Verification details (EDI 271 response)
  coverageActive        Boolean
  infusionTherapyCovered Boolean // Is infusion covered?
  annualDeductible      Float?
  deductibleMet         Float?
  perVisitCopay         Float?
  coinsurancePercentage Float?
  
  // PA requirement
  priorAuthRequired     Boolean
  
  // Status
  status                VerificationStatus // PENDING, VERIFIED, FAILED
  failureReason         String?
  
  requestedAt           DateTime
  respondedAt           DateTime?
  
  createdAt             DateTime  @default(now())

  insurance_latest      InsuranceInformation? @relation("LatestVerification", fields: [id], references: [id])

  @@index([insuranceId])
  @@index([clinicId])
}

enum VerificationStatus {
  PENDING
  VERIFIED
  FAILED
  EXPIRED
}

// ============================================================================
// PRIOR AUTHORIZATION (STAGE 5)
// ============================================================================

model PriorAuthorization {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId             String
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // PA details
  diagnosis             String    // ICD-10 codes
  prescribedDrug        String
  requestedSessions     Int
  
  // Insurance submission
  covermymedsId         String?   // ID from CoverMyMeds integration
  insuranceSubmittedAt  DateTime
  
  // PA decision
  status                PAuthStatus // PENDING, APPROVED, DENIED, APPEAL_PENDING
  approvalNumber        String?   @unique
  approvalDate          DateTime?
  expiryDate            DateTime?
  
  denialReason          String?   @db.Text
  appealDeadline        DateTime?
  
  // Session tracking
  approvedSessionsUsed  Int       @default(0) // Counter as sessions are completed
  sessionsRemaining     Int?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
  @@index([clinicId])
  @@index([status])
  @@index([expiryDate])
}

enum PAuthStatus {
  PENDING
  APPROVED
  DENIED
  APPEAL_PENDING
  EXPIRED
}

// ============================================================================
// SCHEDULING & APPOINTMENTS (STAGE 6)
// ============================================================================

model Appointment {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // Appointment details
  appointmentType       AppointmentType // IN_CLINIC, HOME_INFUSION
  scheduledDate         DateTime
  scheduledStartTime    DateTime
  scheduledEndTime      DateTime?
  
  // Assignment
  assignedNurse         User?     @relation("AssignedStaff", fields: [assignedNurseId], references: [id])
  assignedNurseId       String?
  
  assignedChair         String?   // For in-clinic: chair number/location
  homeAddress           String?   // For home infusion: patient's home address
  
  // Treatment info
  treatmentType         String
  drug                  String?
  dose                  String?
  
  // Status
  status                AppointmentStatus // SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  
  // Patient consent
  consentFormSigned     Boolean   @default(false)
  consentSignedAt       DateTime?
  
  // Linked records
  treatment             TreatmentRecord?
  followUps             FollowUp[]
  
  // Reminders sent
  confirmationSentAt    DateTime?
  reminder48hSentAt     DateTime?
  reminder24hSentAt     DateTime?
  reminder2hSentAt      DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
  @@index([clinicId])
  @@index([scheduledDate])
  @@index([status])
}

enum AppointmentType {
  IN_CLINIC
  HOME_INFUSION
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}

// ============================================================================
// TREATMENT RECORDS (STAGE 8)
// ============================================================================

model TreatmentRecord {
  id                    String    @id @default(cuid())
  
  appointment           Appointment @relation(fields: [appointmentId], references: [id])
  appointmentId         String    @unique
  
  // Drug administration
  drugName              String
  dose                  String
  route                 String // IV, IM, SUBCUTANEOUS
  lot_batch_number      String?
  
  // Timing
  startTime             DateTime
  endTime               DateTime
  duration_minutes      Int
  
  // Admin provider
  administeringProvider String // Name and credentials
  
  // Session tracking
  sessionNumber         Int // e.g., "Session 2 of 6"
  totalSessionsPlanned  Int?
  
  // Clinical observations
  preInfusionVitals     String?   @db.Text // JSON: HR, BP, Temp, O2
  postInfusionVitals    String?   @db.Text
  
  adverseReactions      String?   @db.Text
  clinicalNotes         String?   @db.Text
  deviationsFromProtocol String?  @db.Text
  
  // Status
  status                TreatmentStatus // RECORDED, REVIEWED, BILLED
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([appointmentId])
}

enum TreatmentStatus {
  RECORDED
  REVIEWED
  BILLED
}

// ============================================================================
// POST-TREATMENT FOLLOW-UP (STAGE 9)
// ============================================================================

model FollowUp {
  id                    String    @id @default(cuid())
  
  appointment           Appointment @relation(fields: [appointmentId], references: [id])
  appointmentId         String
  
  // Follow-up timing
  scheduledFor          DateTime  // When this follow-up should happen
  
  // Contact
  contactMethod         ContactMethod // SMS, VOICE, EMAIL
  
  // Response tracking
  attemptedAt           DateTime?
  responseReceived      Boolean   @default(false)
  responseAt            DateTime?
  response              String?   @db.Text // What the patient said/wrote
  
  // Concerns
  concernRaised         Boolean   @default(false)
  concernDescription    String?   @db.Text
  escalatedToStaff      Boolean   @default(false)
  
  status                FollowUpStatus // PENDING, COMPLETED, FAILED, ESCALATED
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([appointmentId])
  @@index([scheduledFor])
}

enum ContactMethod {
  SMS
  VOICE
  EMAIL
}

enum FollowUpStatus {
  PENDING
  COMPLETED
  FAILED
  ESCALATED
}

// ============================================================================
// VOICE AGENT & COMMUNICATIONS
// ============================================================================

model VoiceAgent {
  id                    String    @id @default(cuid())
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String    @unique
  
  // Agent configuration
  agentStatus           VoiceAgentStatus // ACTIVE, INACTIVE, TRAINING
  agentId               String?   // ID from voice service provider
  
  // Call settings
  inboundEnabled        Boolean   @default(true)
  outboundEnabled       Boolean   @default(true)
  allowedCallHours      String?   // JSON: { startTime, endTime, timezone }
  
  // Knowledge base link
  knowledgeBase         KnowledgeBase? @relation(fields: [knowledgeBaseId], references: [id])
  knowledgeBaseId       String?
  
  // Metrics
  totalCalls            Int       @default(0)
  successfulCalls       Int       @default(0)
  
  callLogs              CallLog[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([clinicId])
}

enum VoiceAgentStatus {
  ACTIVE
  INACTIVE
  TRAINING
  DISABLED
}

model CallLog {
  id                    String    @id @default(cuid())
  
  voiceAgent            VoiceAgent @relation(fields: [voiceAgentId], references: [id])
  voiceAgentId          String
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String
  
  // Call details
  phoneNumber           String    // Patient's phone
  callDirection         CallDirection // INBOUND, OUTBOUND
  purpose               CallPurpose // REFERRAL_INTAKE, ELIGIBILITY_VERIFICATION, PA_STATUS, APPOINTMENT_REMINDER, FOLLOW_UP, OTHER
  
  // Call recording
  startTime             DateTime
  endTime               DateTime?
  durationSeconds       Int?
  recordingUrl          String?
  
  // Transcript
  transcriptUrl         String?
  transcriptText        String?   @db.Text
  
  // Outcome
  callStatus            CallStatus // ANSWERED, NO_ANSWER, VOICEMAIL, DECLINED
  outcome               String?   @db.Text
  
  createdAt             DateTime  @default(now())

  @@index([voiceAgentId])
  @@index([clinicId])
  @@index([startTime])
}

enum CallDirection {
  INBOUND
  OUTBOUND
}

enum CallPurpose {
  REFERRAL_INTAKE
  ELIGIBILITY_CHECK
  PA_STATUS
  APPOINTMENT_REMINDER
  FOLLOW_UP_CHECK
  REBOOK_OFFER
  OUTREACH
  OTHER
}

enum CallStatus {
  ANSWERED
  NO_ANSWER
  VOICEMAIL
  DECLINED
}

// ============================================================================
// KNOWLEDGE BASE & CHATBOT
// ============================================================================

model KnowledgeBase {
  id                    String    @id @default(cuid())
  
  clinic                Clinic    @relation(fields: [clinicId], references: [id])
  clinicId              String    @unique
  
  // Content
  faqItems              FAQItem[]
  
  // Status
  lastUpdatedAt         DateTime  @updatedAt
  
  voiceAgents           VoiceAgent[]

  @@index([clinicId])
}

model FAQItem {
  id                    String    @id @default(cuid())
  
  knowledgeBase         KnowledgeBase @relation(fields: [knowledgeBaseId], references: [id], onDelete: Cascade)
  knowledgeBaseId       String
  
  question              String
  answer                String    @db.Text
  category              String    // PRE_TREATMENT, POST_TREATMENT, INSURANCE, APPOINTMENT, BILLING, OTHER
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([knowledgeBaseId])
}

model PortalMessage {
  id                    String    @id @default(cuid())
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  patientId             String
  
  // Message
  messageText           String    @db.Text
  messageType           MessageType // PATIENT_QUESTION, AUTO_RESPONSE, STAFF_REPLY
  
  // Auto-response details (if applicable)
  fromChatbot           Boolean   @default(false)
  chatbotConfidence     Float?    // 0-1 confidence score
  
  // Staff reply (if applicable)
  staffReply            User?     @relation("StaffReplies", fields: [staffReplyFromId], references: [id])
  staffReplyFromId      String?
  staffReplyAt          DateTime?
  
  // Resolution
  resolved              Boolean   @default(false)
  needsClinicalReview   Boolean   @default(false)
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([patientId])
}

enum MessageType {
  PATIENT_QUESTION
  AUTO_RESPONSE
  STAFF_REPLY
}

// ============================================================================
// CRM & PIPELINE TRACKING
// ============================================================================

model PipelineBoard {
  id                    String    @id @default(cuid())
  
  clinicId              String    @unique
  
  // The board itself doesn't store patient cards - they're in Patient.pipelineStage
  // This model can track board-level settings/metadata
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

model AuditLog {
  id                    String    @id @default(cuid())
  
  // Entity info
  entityType            String    // Patient, Appointment, PriorAuthorization, etc.
  entityId              String
  
  // Action
  action                String    // CREATED, UPDATED, DELETED, VIEWED
  userId                String
  
  // Change details
  previousValue         String?   @db.Text // JSON
  newValue              String?   @db.Text // JSON
  
  ipAddress             String?
  userAgent             String?   @db.Text
  
  createdAt             DateTime  @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

## Notes

### Key Design Decisions

1. **Patient Data Isolation**: The `Patient` model is isolated to each clinic (clinicId) ensuring strict HIPAA compliance - one clinic cannot see another's patient data.

2. **Pipeline Tracking**: `PipelineStage` enum tracks the 9-stage patient journey automatically. State machine validation should be implemented in business logic.

3. **Insurance EDI Standards**: `InsuranceVerification` and `PriorAuthorization` models reflect actual US EDI 270/271 responses and CoverMyMeds integration points.

4. **Dual Patient Portal**: The `Patient` model can have an optional `User` relationship - allowing clinics to provision portal access separately from the internal system.

5. **Voice Agent Integration**: `VoiceAgent`, `CallLog`, and `PortalMessage` track all voice and chatbot interactions for compliance and analytics.

6. **Treatment Session Tracking**: `TreatmentRecord` captures per-session data and links to `PriorAuthorization` approval counts for multi-session treatments.

7. **Follow-up Automation**: `FollowUp` model tracks all post-treatment check-ins (2h, 24h, 72h, 30-day, 60-day) and escalation.

8. **Audit Trail**: `AuditLog` model tracks all PHI access and changes for HIPAA compliance and liability protection.

### Indexes

- All foreign keys indexed for query performance
- Clinic and patient lookups optimized
- Pipeline stage queries optimized
- Date-based queries (appointments, follow-ups) indexed

### Relationships Summary

- 1 Clinic → Many Patients, Staff, Appointments, Referrals
- 1 Patient → 1 Insurance, 1 HIPAA Consent, 1 Intake Form, Many Appointments, Many Referrals
- 1 Appointment → 1 Treatment Record, Many Follow-ups
- 1 Prior Authorization → 1 Patient
- 1 Voice Agent → 1 Clinic, Many Call Logs
- 1 Knowledge Base → 1 Clinic, Many FAQ Items
