# Scriptish Backend Routes - Complete API Specification

## Base URL
```
https://api.scriptish.com/v1
```

---

## Authentication Routes

### User Registration & Onboarding

#### POST `/auth/register/clinic`
**Purpose**: Register new clinic with gated eligibility checks
**Auth**: Public (no auth required)
**Request Body**:
```json
{
  "eligibilityGate": {
    "isUSAClinic": true,
    "clinicType": "KETAMINE" // IV_THERAPY, KETAMINE, NAD, BIOLOGIC, etc.
  },
  "clinic": {
    "name": "Bright Infusion Clinic",
    "npiNumber": "1234567890",
    "taxId": "12-3456789",
    "stateLicenseNumber": "IL-12345",
    "address": "123 Medical Blvd",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "primaryPhone": "312-555-0000",
    "workEmail": "admin@brightinfusion.com",
    "infusionChairCount": 8,
    "treatmentTypesOffered": ["KETAMINE", "IV_THERAPY"]
  }
}
```
**Response**: `{ clinicId, temporaryToken, nextStep: "VERIFY_EMAIL" }`

#### POST `/auth/register/verify-email`
**Purpose**: Verify work email address
**Auth**: Temporary token
**Request Body**:
```json
{
  "email": "admin@brightinfusion.com",
  "verificationCode": "123456"
}
```
**Response**: `{ clinicId, status: "EMAIL_VERIFIED", nextStep: "SIGN_BAA" }`

#### POST `/auth/register/sign-baa`
**Purpose**: Digitally sign HIPAA Business Associate Agreement
**Auth**: Temporary token
**Request Body**:
```json
{
  "signatureData": "base64 signature",
  "adminName": "John Admin",
  "adminTitle": "Clinic Manager"
}
```
**Response**: 
```json
{
  "clinicId": "clinic_123",
  "status": "ACTIVE",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST `/auth/login`
**Purpose**: Staff login
**Auth**: Public
**Request Body**:
```json
{
  "email": "staff@clinic.com",
  "password": "hashed_password"
}
```
**Response**: 
```json
{
  "userId": "user_123",
  "clinicId": "clinic_123",
  "role": "CLINIC_STAFF",
  "accessToken": "jwt_token",
  "expiresIn": 3600
}
```

#### POST `/auth/password/forgot`
**Purpose**: Request password reset email
**Auth**: Public
**Request Body**: `{ "email": "staff@clinic.com" }`
**Response**: `{ message: "Reset link sent to email" }`

#### POST `/auth/password/reset`
**Purpose**: Reset password with token
**Auth**: Public
**Request Body**:
```json
{
  "resetToken": "token_xyz",
  "newPassword": "hashed_password"
}
```
**Response**: `{ message: "Password reset successful" }`

#### POST `/auth/logout`
**Purpose**: Logout user
**Auth**: Required (Bearer token)
**Response**: `{ message: "Logged out successfully" }`

---

## Clinic Management Routes

### GET `/clinics/{clinicId}`
**Purpose**: Get clinic details
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "id": "clinic_123",
  "name": "Bright Infusion Clinic",
  "npiNumber": "1234567890",
  "address": "123 Medical Blvd",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601",
  "status": "ACTIVE",
  "activatedAt": "2026-01-15T10:00:00Z",
  "infusionChairCount": 8,
  "treatmentTypesOffered": ["KETAMINE", "IV_THERAPY"],
  "lastUpdatedAt": "2026-03-20T14:30:00Z"
}
```

### PUT `/clinics/{clinicId}`
**Purpose**: Update clinic information
**Auth**: Required (clinic admin)
**Request Body**: Any clinic fields (name, phone, address, etc.)
**Response**: Updated clinic object

### PUT `/clinics/{clinicId}/settings`
**Purpose**: Update clinic settings
**Auth**: Required (clinic admin)
**Request Body**:
```json
{
  "infusionChairCount": 10,
  "treatmentTypesOffered": ["KETAMINE", "IV_THERAPY", "NAD"],
  "voiceAgentEnabled": true,
  "autoSchedulingEnabled": false,
  "businessHours": {
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/Chicago"
  }
}
```
**Response**: `{ message: "Settings updated", settings: {...} }`

---

## Patient Management Routes

### GET `/patients`
**Purpose**: List all patients for clinic (with filtering/pagination)
**Auth**: Required (clinic staff)
**Query Parameters**:
- `page`: 1
- `limit`: 20
- `status`: NEW_REFERRAL | VERIFYING_INSURANCE | PA_PENDING | SCHEDULED | IN_TREATMENT | COMPLETE
- `search`: partial name/email/phone
- `dateFrom`: ISO date
- `dateTo`: ISO date

**Response**:
```json
{
  "total": 145,
  "page": 1,
  "limit": 20,
  "patients": [
    {
      "id": "patient_123",
      "firstName": "James",
      "lastName": "Smith",
      "phone": "312-555-1234",
      "email": "james@email.com",
      "pipelineStage": "SCHEDULED",
      "status": "ACTIVE",
      "insurance": {
        "carrier": "Blue Cross",
        "memberId": "BCM123456"
      },
      "nextAppointment": "2026-03-28T14:00:00Z"
    }
  ]
}
```

### POST `/patients`
**Purpose**: Create new patient from referral
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "firstName": "James",
  "lastName": "Smith",
  "dateOfBirth": "1985-06-15",
  "phone": "312-555-1234",
  "email": "james@email.com",
  "address": "456 Oak Street",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60614",
  "insurance": {
    "carrier": "Blue Cross",
    "memberId": "BCM123456",
    "groupNumber": "GRP789",
    "planType": "PPO"
  }
}
```
**Response**: `{ patientId: "patient_123", pipelineStage: "NEW_REFERRAL" }`

### GET `/patients/{patientId}`
**Purpose**: Get patient detail and complete record
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "patient": {
    "id": "patient_123",
    "firstName": "James",
    "lastName": "Smith",
    "dateOfBirth": "1985-06-15",
    "phone": "312-555-1234",
    "email": "james@email.com",
    "address": "456 Oak Street",
    "pipelineStage": "SCHEDULED",
    "createdAt": "2026-02-01T10:00:00Z"
  },
  "referral": {
    "id": "ref_123",
    "physiciamName": "Dr. Sarah Johnson",
    "npiNumber": "9876543210",
    "diagnosis": "F41.1",
    "diagnosticDescription": "Generalized Anxiety Disorder",
    "prescribedTreatment": "Ketamine IV Infusion",
    "urgencyLevel": "ROUTINE"
  },
  "insurance": {
    "carrier": "Blue Cross",
    "memberId": "BCM123456",
    "latestVerification": {
      "status": "VERIFIED",
      "coverageActive": true,
      "infusionTherapyCovered": true,
      "priorAuthRequired": true,
      "verifiedAt": "2026-02-15T09:00:00Z"
    }
  },
  "priorAuthorization": {
    "id": "pa_123",
    "status": "APPROVED",
    "approvalNumber": "PA123456789",
    "approvalDate": "2026-02-20T10:00:00Z",
    "expiryDate": "2026-05-20T23:59:59Z",
    "approvedSessions": 6,
    "sessionsUsed": 1,
    "sessionsRemaining": 5
  },
  "intakeForm": {
    "id": "intake_123",
    "treatmentType": "KETAMINE",
    "status": "SUBMITTED",
    "completedAt": "2026-02-18T14:30:00Z",
    "allergies": "Penicillin",
    "currentMedications": "Sertraline 50mg daily",
    "psychosisHistory": false
  },
  "hipaaConsent": {
    "signed": true,
    "signedAt": "2026-02-16T11:00:00Z",
    "consentDocumentUrl": "https://..."
  },
  "appointments": [
    {
      "id": "apt_123",
      "scheduledDate": "2026-03-28",
      "scheduledTime": "14:00",
      "status": "SCHEDULED",
      "treatmentType": "KETAMINE"
    }
  ]
}
```

### PUT `/patients/{patientId}`
**Purpose**: Update patient information
**Auth**: Required (clinic staff)
**Request Body**: Any patient fields (address, phone, email, etc.)
**Response**: Updated patient object

### DELETE `/patients/{patientId}`
**Purpose**: Archive patient record
**Auth**: Required (clinic admin)
**Response**: `{ message: "Patient archived", patientId }`

### GET `/patients/{patientId}/portal-link`
**Purpose**: Generate unique patient portal login link
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "portalLink": "https://portal.scriptish.com/auth/magic-link?token=token_xyz",
  "expiresIn": 2592000,
  "emailSent": true
}
```

---

## Referral Routes

### POST `/referrals`
**Purpose**: Submit new patient referral
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "method": "UPLOAD", // or FORM
  "patientInfo": {
    "firstName": "James",
    "lastName": "Smith",
    "dateOfBirth": "1985-06-15",
    "phone": "312-555-1234",
    "email": "james@email.com",
    "address": "456 Oak Street",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60614"
  },
  "referringPhysician": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "npiNumber": "9876543210",
    "practice": "Chicago Medical Group",
    "phone": "312-555-9999",
    "specialty": "Psychiatry"
  },
  "clinical": {
    "primaryDiagnosis": "F41.1",
    "diagnosisDescription": "Generalized Anxiety Disorder",
    "prescribedTreatment": "Ketamine IV Infusion",
    "urgencyLevel": "ROUTINE",
    "clinicalNotes": "Patient reports anxiety for 3 years..."
  },
  "insurance": {
    "carrier": "Blue Cross",
    "memberId": "BCM123456",
    "groupNumber": "GRP789",
    "planType": "PPO"
  },
  "uploadedDocumentUrl": "https://..." // if method=UPLOAD
}
```
**Response**: 
```json
{
  "referralId": "ref_123",
  "patientId": "patient_123",
  "status": "SUBMITTED",
  "pipelineStage": "NEW_REFERRAL",
  "createdAt": "2026-03-25T10:00:00Z"
}
```

### GET `/referrals`
**Purpose**: List all referrals
**Auth**: Required (clinic staff)
**Query Parameters**: page, limit, status (SUBMITTED, REVIEWED, APPROVED, REJECTED)
**Response**: Paginated array of referrals

### GET `/referrals/{referralId}`
**Purpose**: Get referral details
**Auth**: Required (clinic staff)
**Response**: Referral object with all details

### POST `/referrals/{referralId}/upload`
**Purpose**: Upload referral document
**Auth**: Required (clinic staff)
**Request Body**: FormData with file (PDF/image)
**Response**: `{ referralId, uploadedAt, documentUrl }`

---

## Insurance Verification Routes

### POST `/insurance/verify`
**Purpose**: Trigger EDI 270 eligibility verification
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "patientId": "patient_123",
  "insuranceCarrier": "Blue Cross",
  "memberId": "BCM123456",
  "groupNumber": "GRP789"
}
```
**Response**: 
```json
{
  "verificationId": "verify_123",
  "status": "PENDING",
  "submittedAt": "2026-03-25T10:00:00Z",
  "expectedResponseTime": 300 // seconds
}
```

### GET `/insurance/{patientId}`
**Purpose**: Get latest insurance verification result (EDI 271 response)
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "verificationId": "verify_123",
  "status": "VERIFIED",
  "coverageActive": true,
  "infusionTherapyCovered": true,
  "annualDeductible": 1000,
  "deductibleMet": 300,
  "perVisitCopay": 35,
  "coinsurancePercentage": 20,
  "priorAuthRequired": true,
  "respondedAt": "2026-03-25T10:05:00Z"
}
```

### GET `/insurance/{patientId}/history`
**Purpose**: Get verification history for patient
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "total": 3,
  "verifications": [
    {
      "verificationId": "verify_123",
      "date": "2026-03-25T10:00:00Z",
      "status": "VERIFIED",
      "coverageActive": true
    }
  ]
}
```

---

## Prior Authorization Routes

### POST `/authorizations`
**Purpose**: Submit Prior Authorization request to CoverMyMeds
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "patientId": "patient_123",
  "diagnosis": "F41.1",
  "prescribedDrug": "Ketamine HCl",
  "dose": "1.0 mg/kg IV",
  "requestedSessions": 6,
  "clinicalNotes": "Patient has failed 2 SSRIs..."
}
```
**Response**: 
```json
{
  "authorizationId": "pa_123",
  "status": "PENDING",
  "covermymedsId": "cmm_xyz",
  "submittedAt": "2026-03-25T10:00:00Z"
}
```

### GET `/authorizations/{authId}`
**Purpose**: Get Prior Authorization status
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "authorizationId": "pa_123",
  "patientId": "patient_123",
  "status": "APPROVED",
  "approvalNumber": "PA123456789",
  "approvalDate": "2026-03-26T14:00:00Z",
  "expiryDate": "2026-06-26T23:59:59Z",
  "approvedSessions": 6,
  "sessionsUsed": 1,
  "sessionsRemaining": 5,
  "insurance": {
    "carrier": "Blue Cross",
    "memberId": "BCM123456"
  }
}
```

### GET `/authorizations/patient/{patientId}`
**Purpose**: Get all PAs for a patient
**Auth**: Required (clinic staff)
**Response**: Array of authorizations

### POST `/authorizations/{authId}/use-session`
**Purpose**: Decrement approved sessions when treatment is completed
**Auth**: Required (system/internal)
**Request Body**: `{ "sessionCount": 1 }`
**Response**: `{ authId, sessionsUsed, sessionsRemaining }`

### POST `/authorizations/{authId}/appeal`
**Purpose**: Submit appeal for denied authorization
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "appealReason": "Clinical justification for the prescribed treatment",
  "additionalDocumentation": "https://...",
  "requestedBy": "Dr. Sarah Johnson"
}
```
**Response**: `{ authId, status: "APPEAL_PENDING", submittedAt }`

---

## Patient Intake Form Routes

### GET `/intake-forms/{patientId}`
**Purpose**: Get intake form for patient (or form template if not yet started)
**Auth**: Required (clinic staff or patient via portal)
**Response**:
```json
{
  "intakeFormId": "intake_123",
  "patientId": "patient_123",
  "treatmentType": "KETAMINE",
  "status": "INCOMPLETE",
  "commonFields": {
    "knownAllergies": null,
    "currentMedications": null,
    "previousExperience": null
  },
  "treatmentSpecific": {
    "mentalHealthHistory": null,
    "psychiatricMedications": null,
    "psychosisHistory": null,
    "maniaHistory": null,
    "substanceUseHistory": null,
    "supportSystemAvailable": null
  },
  "startedAt": "2026-02-16T11:00:00Z",
  "lastModifiedAt": "2026-02-16T11:00:00Z"
}
```

### POST `/intake-forms`
**Purpose**: Submit completed intake form
**Auth**: Required (clinic staff or patient via portal)
**Request Body**:
```json
{
  "patientId": "patient_123",
  "treatmentType": "KETAMINE",
  "commonFields": {
    "knownAllergies": "Penicillin",
    "currentMedications": "Sertraline 50mg daily",
    "previousExperience": "Yes, used ketamine therapy 2 years ago"
  },
  "treatmentSpecific": {
    "mentalHealthHistory": "GAD for 3 years, tried 2 SSRIs",
    "psychiatricMedications": "Sertraline",
    "psychosisHistory": false,
    "maniaHistory": false,
    "substanceUseHistory": "Social alcohol use only",
    "supportSystemAvailable": true
  }
}
```
**Response**: `{ intakeFormId, status: "SUBMITTED", completedAt }`

### PUT `/intake-forms/{intakeFormId}`
**Purpose**: Update/revise intake form
**Auth**: Required (clinic staff)
**Request Body**: Any intake fields
**Response**: Updated intake form

---

## Scheduling & Appointment Routes

### GET `/appointments`
**Purpose**: List appointments with filtering
**Auth**: Required (clinic staff)
**Query Parameters**:
- `page`: 1
- `limit`: 20
- `dateFrom`: ISO date
- `dateTo`: ISO date
- `status`: SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | NO_SHOW | CANCELLED
- `patientId`: filter by patient
- `chairId`: filter by infusion chair (in-clinic only)
- `nurseName`: filter by assigned nurse

**Response**: Paginated array of appointments

### POST `/appointments`
**Purpose**: Create new appointment
**Auth**: Required (clinic staff or voice agent)
**Request Body**:
```json
{
  "patientId": "patient_123",
  "appointmentType": "IN_CLINIC", // or HOME_INFUSION
  "scheduledDate": "2026-03-28",
  "scheduledStartTime": "14:00",
  "scheduledEndTime": "15:30",
  "treatmentType": "KETAMINE",
  "drug": "Ketamine HCl",
  "dose": "1.0 mg/kg IV",
  "assignedNurseId": "user_456", // optional
  "assignedChair": "Chair 3", // for in-clinic only
  "homeAddress": "456 Oak Street, Chicago, IL 60614" // for home infusion only
}
```
**Response**: 
```json
{
  "appointmentId": "apt_123",
  "patientId": "patient_123",
  "status": "SCHEDULED",
  "scheduledDate": "2026-03-28T14:00:00Z",
  "consentFormSent": true,
  "reminderScheduled": true
}
```

### GET `/appointments/{appointmentId}`
**Purpose**: Get appointment details
**Auth**: Required (clinic staff)
**Response**: Complete appointment with patient, treatment, follow-up info

### PUT `/appointments/{appointmentId}`
**Purpose**: Update appointment (reschedule, reassign staff, etc.)
**Auth**: Required (clinic staff)
**Request Body**: Any appointment fields to update
**Response**: Updated appointment

### DELETE `/appointments/{appointmentId}`
**Purpose**: Cancel appointment
**Auth**: Required (clinic staff)
**Request Body**: `{ "cancellationReason": "Patient requested" }`
**Response**: `{ appointmentId, status: "CANCELLED" }`

### GET `/appointments/{appointmentId}/available-slots`
**Purpose**: Get available appointment slots
**Auth**: Required (clinic staff or patient)
**Query Parameters**:
- `dateFrom`: ISO date
- `dateTo`: ISO date
- `treatmentType`: KETAMINE (to filter available chairs/nurses)

**Response**:
```json
{
  "availableSlots": [
    {
      "date": "2026-03-28",
      "startTime": "10:00",
      "endTime": "11:30",
      "chairId": "Chair 2",
      "availability": "AVAILABLE"
    },
    {
      "date": "2026-03-28",
      "startTime": "14:00",
      "endTime": "15:30",
      "chairId": "Chair 3",
      "availability": "AVAILABLE"
    }
  ]
}
```

### POST `/appointments/{appointmentId}/send-reminder`
**Purpose**: Manually send appointment reminder
**Auth**: Required (clinic staff)
**Request Body**: `{ "method": "SMS" | "EMAIL" | "VOICE" }`
**Response**: `{ sent: true, method, sentAt }`

---

## Treatment Recording Routes

### POST `/treatments`
**Purpose**: Record treatment after session
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "appointmentId": "apt_123",
  "drugName": "Ketamine HCl",
  "dose": "65 mg IV",
  "route": "IV",
  "lotBatchNumber": "LOT123456",
  "startTime": "2026-03-28T14:00:00Z",
  "endTime": "2026-03-28T14:45:00Z",
  "administeringProvider": "Jane Nurse, RN",
  "sessionNumber": 1,
  "totalSessionsPlanned": 6,
  "preInfusionVitals": "{\"hr\": 72, \"bp\": \"120/80\", \"temp\": 98.6, \"o2\": 98}",
  "postInfusionVitals": "{\"hr\": 76, \"bp\": \"122/82\", \"temp\": 98.7, \"o2\": 99}",
  "adverseReactions": "Mild dizziness during infusion, resolved post-treatment",
  "clinicalNotes": "Patient tolerated well, good response observed"
}
```
**Response**: 
```json
{
  "treatmentId": "trx_123",
  "appointmentId": "apt_123",
  "patientId": "patient_123",
  "status": "RECORDED",
  "recordedAt": "2026-03-28T14:45:00Z"
}
```

### GET `/treatments/{treatmentId}`
**Purpose**: Get treatment record
**Auth**: Required (clinic staff or patient via portal)
**Response**: Complete treatment record

### PUT `/treatments/{treatmentId}`
**Purpose**: Update treatment record
**Auth**: Required (clinic staff)
**Request Body**: Any treatment fields to update
**Response**: Updated treatment record

---

## Follow-up Routes

### GET `/followups`
**Purpose**: List follow-up tasks (pending, overdue, completed)
**Auth**: Required (clinic staff)
**Query Parameters**:
- `status`: PENDING | COMPLETED | FAILED | ESCALATED
- `overdue`: true or false
- `dueFrom`: ISO date
- `dueTo`: ISO date

**Response**: Array of follow-up tasks

### POST `/followups`
**Purpose**: Create follow-up task (usually auto-created, but can be manual)
**Auth**: Required (clinic staff)
**Request Body**:
```json
{
  "appointmentId": "apt_123",
  "scheduledFor": "2026-03-30T14:00:00Z", // 2 days after appointment
  "contactMethod": "VOICE", // SMS, VOICE, EMAIL
  "notes": "Check on any side effects from treatment"
}
```
**Response**: `{ followUpId, status: "PENDING" }`

### PUT `/followups/{followUpId}`
**Purpose**: Update follow-up task status and response
**Auth**: Required (clinic staff or voice agent)
**Request Body**:
```json
{
  "status": "COMPLETED",
  "responseReceived": true,
  "response": "Patient feeling good, no issues reported",
  "concernRaised": false,
  "completedAt": "2026-03-30T14:15:00Z"
}
```
**Response**: Updated follow-up object

### GET `/followups/{appointmentId}`
**Purpose**: Get all follow-ups for an appointment
**Auth**: Required (clinic staff)
**Response**: Array of follow-ups in order (2h, 24h, 72h, 30-day, 60-day)

---

## Voice Agent Routes

### GET `/voice-agent`
**Purpose**: Get voice agent configuration for clinic
**Auth**: Required (clinic admin)
**Response**:
```json
{
  "voiceAgentId": "va_123",
  "clinicId": "clinic_123",
  "status": "ACTIVE",
  "inboundEnabled": true,
  "outboundEnabled": true,
  "businessHours": {
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/Chicago"
  },
  "knowledgeBaseId": "kb_123",
  "totalCalls": 1247,
  "successfulCalls": 1198,
  "successRate": 0.96
}
```

### PUT `/voice-agent`
**Purpose**: Update voice agent settings
**Auth**: Required (clinic admin)
**Request Body**:
```json
{
  "inboundEnabled": true,
  "outboundEnabled": true,
  "businessHours": {
    "startTime": "09:00",
    "endTime": "18:00"
  }
}
```
**Response**: Updated voice agent object

### GET `/voice-agent/call-logs`
**Purpose**: Get call logs
**Auth**: Required (clinic staff)
**Query Parameters**:
- `page`: 1
- `limit`: 20
- `dateFrom`: ISO date
- `dateTo`: ISO date
- `direction`: INBOUND | OUTBOUND
- `purpose`: REFERRAL_INTAKE | ELIGIBILITY_CHECK | PA_STATUS | etc.
- `status`: ANSWERED | NO_ANSWER | VOICEMAIL | DECLINED

**Response**:
```json
{
  "total": 247,
  "calls": [
    {
      "callId": "call_123",
      "phoneNumber": "312-555-1234",
      "direction": "OUTBOUND",
      "purpose": "FOLLOW_UP_CHECK",
      "startTime": "2026-03-28T14:00:00Z",
      "durationSeconds": 245,
      "status": "ANSWERED",
      "transcriptUrl": "https://...",
      "recordingUrl": "https://..."
    }
  ]
}
```

### POST `/voice-agent/webhook/call-completed`
**Purpose**: Webhook endpoint for call completion events from voice service
**Auth**: Webhook signature validation
**Request Body**:
```json
{
  "callId": "call_123",
  "phoneNumber": "312-555-1234",
  "direction": "OUTBOUND",
  "startTime": "2026-03-28T14:00:00Z",
  "endTime": "2026-03-28T14:04:05Z",
  "durationSeconds": 245,
  "status": "ANSWERED",
  "transcript": "Full call transcript...",
  "recordingUrl": "https://..."
}
```
**Response**: `{ received: true, processed: true }`

---

## Knowledge Base & FAQ Routes

### GET `/knowledge-base`
**Purpose**: Get FAQ items for clinic's knowledge base
**Auth**: Required (clinic staff or voice agent)
**Query Parameters**: `category` (PRE_TREATMENT, POST_TREATMENT, INSURANCE, etc.)
**Response**:
```json
{
  "knowledgeBaseId": "kb_123",
  "faqItems": [
    {
      "faqId": "faq_123",
      "question": "What should I eat before my ketamine infusion?",
      "answer": "Please fast for 6-8 hours before treatment...",
      "category": "PRE_TREATMENT"
    }
  ]
}
```

### POST `/knowledge-base/faq`
**Purpose**: Add new FAQ item
**Auth**: Required (clinic admin)
**Request Body**:
```json
{
  "question": "What should I expect after treatment?",
  "answer": "Most patients feel...",
  "category": "POST_TREATMENT"
}
```
**Response**: `{ faqId, createdAt }`

### PUT `/knowledge-base/faq/{faqId}`
**Purpose**: Update FAQ item
**Auth**: Required (clinic admin)
**Request Body**: Updated question/answer/category
**Response**: Updated FAQ object

### DELETE `/knowledge-base/faq/{faqId}`
**Purpose**: Delete FAQ item
**Auth**: Required (clinic admin)
**Response**: `{ message: "FAQ deleted" }`

---

## Patient Portal Routes
*All portal routes require patient authentication or valid magic link token*

### POST `/portal/auth/magic-link`
**Purpose**: Patient login with magic link
**Auth**: Magic link token from email
**Request Body**: `{ token: "link_token_xyz" }`
**Response**: `{ portalToken: "jwt_token", patientId, expiresIn: 2592000 }`

### GET `/portal/dashboard`
**Purpose**: Get patient's portal dashboard
**Auth**: Patient portal auth
**Response**:
```json
{
  "patient": {
    "firstName": "James",
    "lastName": "Smith",
    "email": "james@email.com"
  },
  "hipaaConsent": {
    "signed": true,
    "signedAt": "2026-02-16T11:00:00Z"
  },
  "nextAppointment": {
    "date": "2026-03-28",
    "time": "14:00",
    "treatmentType": "KETAMINE",
    "instructions": "Please fast 6-8 hours before treatment..."
  },
  "treatmentHistory": [
    {
      "date": "2026-03-21",
      "treatmentType": "KETAMINE",
      "sessionNumber": 1,
      "totalSessions": 6
    }
  ]
}
```

### POST `/portal/consent/sign-hipaa`
**Purpose**: Patient signs HIPAA consent digitally
**Auth**: Patient portal auth
**Request Body**:
```json
{
  "signatureData": "base64 signature image",
  "consentAcknowledged": true
}
```
**Response**: `{ consentId, signedAt, status: "SIGNED" }`

### GET `/portal/intake-form`
**Purpose**: Get patient intake form for their treatment type
**Auth**: Patient portal auth
**Response**: Intake form object (same as `/intake-forms/{patientId}`)

### POST `/portal/intake-form/submit`
**Purpose**: Submit intake form from patient portal
**Auth**: Patient portal auth
**Request Body**: Completed form data (same as `/intake-forms`)
**Response**: `{ intakeFormId, status: "SUBMITTED", submittedAt }`

### GET `/portal/appointments`
**Purpose**: Get patient's appointments
**Auth**: Patient portal auth
**Response**: Array of patient's appointments (past and upcoming)

### POST `/portal/appointments/book`
**Purpose**: Patient books their own appointment
**Auth**: Patient portal auth
**Request Body**:
```json
{
  "availableSlotId": "slot_123",
  "preferredDate": "2026-03-28",
  "preferredTime": "14:00"
}
```
**Response**: `{ appointmentId, status: "SCHEDULED", confirmationSent: true }`

### GET `/portal/treatment-history`
**Purpose**: Get patient's past treatments
**Auth**: Patient portal auth
**Response**: Array of treatment records

### POST `/portal/messages`
**Purpose**: Patient sends message to clinic
**Auth**: Patient portal auth
**Request Body**:
```json
{
  "message": "I have a question about side effects...",
  "category": "GENERAL" // or URGENT
}
```
**Response**: `{ messageId, status: "SUBMITTED", submittedAt }`

### GET `/portal/messages`
**Purpose**: Get patient's message thread with clinic
**Auth**: Patient portal auth
**Response**: Array of messages (patient questions and clinic replies)

### POST `/portal/chat`
**Purpose**: Send message to chatbot
**Auth**: Patient portal auth
**Request Body**:
```json
{
  "message": "What should I eat before treatment?"
}
```
**Response**:
```json
{
  "chatMessageId": "msg_123",
  "userMessage": "What should I eat before treatment?",
  "botResponse": "Please fast for 6-8 hours before your appointment...",
  "confidence": 0.95,
  "requiresHumanReview": false
}
```

### GET `/portal/chat/history`
**Purpose**: Get chat history with chatbot
**Auth**: Patient portal auth
**Response**: Array of chat exchanges

---

## Dashboard Routes

### GET `/dashboard`
**Purpose**: Get clinic dashboard summary
**Auth**: Required (clinic staff)
**Response**:
```json
{
  "summary": {
    "totalPatients": 247,
    "newReferralsThisWeek": 12,
    "appointmentsToday": 4,
    "appointmentsThisWeek": 18,
    "paApprovalsPending": 5,
    "insufficientVerifications": 2
  },
  "urgentFlags": [
    {
      "type": "UNSIGNED_CONSENT",
      "patientId": "patient_123",
      "patientName": "James Smith",
      "appointmentDate": "2026-03-28T14:00:00Z",
      "severity": "CRITICAL",
      "message": "Consent form unsigned - appointment is tomorrow"
    },
    {
      "type": "PA_EXPIRING_SOON",
      "patientId": "patient_456",
      "patientName": "Maria Garcia",
      "paExpiryDate": "2026-04-02T23:59:59Z",
      "severity": "HIGH",
      "message": "PA approval expiring in 7 days"
    }
  ],
  "pipelineOverview": {
    "newReferral": 3,
    "verifyingInsurance": 5,
    "paPending": 4,
    "scheduled": 12,
    "inTreatment": 2,
    "complete": 221
  }
}
```

### GET `/dashboard/pipeline`
**Purpose**: Get full patient pipeline board state
**Auth**: Required (clinic staff)
**Response**: 
```json
{
  "stages": {
    "newReferral": [
      {
        "patientId": "patient_123",
        "name": "James Smith",
        "referredBy": "Dr. Sarah Johnson",
        "dateAdded": "2026-03-25T10:00:00Z"
      }
    ],
    "verifyingInsurance": [...],
    "paPending": [...],
    "scheduled": [...],
    "inTreatment": [...],
    "complete": [...]
  }
}
```

### GET `/dashboard/analytics`
**Purpose**: Get clinic analytics and metrics
**Auth**: Required (clinic staff)
**Query Parameters**:
- `dateFrom`: ISO date
- `dateTo`: ISO date
- `metric`: PATIENTS_PROCESSED | INSURANCE_SUCCESS | PA_APPROVAL_RATE | NO_SHOW_RATE | FOLLOW_UP_COMPLETION | REVENUE

**Response**:
```json
{
  "period": {
    "from": "2026-03-01",
    "to": "2026-03-31"
  },
  "metrics": {
    "patientsProcessed": 47,
    "avgDaysInPipeline": 8.3,
    "insuranceVerificationSuccessRate": 0.94,
    "paApprovalRate": 0.89,
    "noShowRate": 0.04,
    "followUpCompletionRate": 0.96,
    "estimatedRevenue": 18750
  },
  "trends": {
    "weekOverWeek": 0.12,
    "monthOverMonth": 0.08
  }
}
```

---

## Webhook Routes
*Internal receiving endpoints for third-party integrations*

### POST `/webhooks/covermymeds`
**Purpose**: Receive Prior Authorization status updates from CoverMyMeds
**Auth**: Webhook signature validation
**Request Body**: CoverMyMeds PA status update payload
**Response**: `{ received: true, processed: true }`

### POST `/webhooks/insurance-payer`
**Purpose**: Receive EDI responses from insurance payers
**Auth**: Webhook signature validation
**Request Body**: EDI 271 or other payer response
**Response**: `{ received: true, processed: true }`

### POST `/webhooks/voice-agent/call-complete`
**Purpose**: Receive call completion events from voice service provider
**Auth**: Webhook signature validation
**Request Body**: Call event with transcript and recording URL
**Response**: `{ received: true, processed: true }`

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "error": "INVALID_REQUEST",
  "message": "Required field 'email' is missing",
  "details": {
    "field": "email",
    "issue": "required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication token is invalid or expired"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Patient with ID 'patient_999' not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please wait before retrying",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Support ticket ID: ticket_xyz",
  "ticketId": "ticket_xyz"
}
```

---

## Authentication

### Bearer Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Includes
- `userId`: User ID
- `clinicId`: Clinic ID
- `role`: User role (CLINIC_ADMIN, CLINIC_STAFF, PATIENT)
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp

### Token Refresh
POST `/auth/refresh`
```json
{
  "refreshToken": "refresh_token_xyz"
}
```
Response: `{ accessToken, expiresIn: 3600 }`

---

## Rate Limiting

- Standard: 1000 requests/hour per API key
- Burst: 100 requests/minute
- Webhooks: No rate limit

---

## Pagination

Standard pagination parameters for list endpoints:
```
GET /resource?page=1&limit=20&sort=createdAt&order=desc
```

Response includes:
```json
{
  "total": 247,
  "page": 1,
  "limit": 20,
  "pages": 13,
  "data": [...]
}
```
