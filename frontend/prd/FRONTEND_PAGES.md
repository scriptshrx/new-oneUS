# Scriptish Frontend Pages - Complete Map

## Public Pages (No Authentication)

### Marketing Site

1. **Homepage** (`/`)
   - Hero section with headline: "The Operating System for Infusion Clinics"
   - Dual CTAs: "Book Demo" + "Start Free Trial"
   - Trust bar: "USA Infusion Clinics Only"
   - Six pain point cards with scroll animations
   - Interactive pipeline section (6 clickable stages with expanding detail panels)
   - HIPAA trust section (4 compliance pillars)
   - Pricing section (3 tiers: $297, $597, $1,200+) with ROI calculator link
   - "Who It Is For" section (6 clinic type cards)
   - Video placeholder section
   - Dark clinical design system (#0F172A background, teal accents)

2. **Solutions Pages** (Clinic-type specific)
   - `/solutions/iv-therapy-clinics` - IV therapy clinic pain points & solutions
   - `/solutions/ketamine-clinics` - Ketamine clinic operations
   - `/solutions/nad-clinics` - NAD+ therapy clinic features
   - `/solutions/home-infusion` - Home infusion agency operations

3. **Comparison Page** (`/compare/scriptish-vs-weinfuse`)
   - Direct comparison table vs WeinFuse
   - Feature matrix
   - ROI comparison

4. **ROI Calculator** (`/roi-calculator`)
   - Standalone interactive tool
   - Input: clinic type, current operations cost, patient volume
   - Output: projected savings with Scriptish

5. **Blog / Content Hub** (`/blog`)
   - Blog post listings with categories
   - Individual blog post pages
   - Content downloads (gated with email capture)

---

## Authentication & Registration Pages

6. **Login** (`/login`)
   - Clinic staff login (work email only)
   - Password field
   - "Forgot Password" link
   - Error messaging for invalid credentials

7. **Register** (`/register`)
   - **Gate 1: Eligibility Check**
     - "Is this a USA infusion clinic?" (Yes/No)
     - Clinic type dropdown (IV therapy, Ketamine, NAD+, Biologic, Antibiotic, Home Infusion, TRT, Other)
     - Proceed only if eligible
   
   - **Gate 2: Work Email Validation**
     - Work email field (must be clinic domain, not Gmail/Yahoo/etc.)
     - Verification email sent to that address
   
   - **Gate 3: Registration Form**
     - Clinic Name
     - Physical Address (street, city, state, ZIP)
     - Primary Phone Number
     - Work Email Address (already captured)
     - NPI Number (10-digit, required)
     - Tax ID / EIN
     - State Medical License Number
     - Number of Infusion Chairs
     - Primary Treatment Types Offered
   
   - **Post-Registration: Digital HIPAA BAA Signature**
     - HIPAA Business Associate Agreement displays
     - Patient must digitally sign with timestamp
     - Signature stored permanently
     - Account activation only after BAA signature

8. **Password Reset** (`/password-reset`)
   - Email-based password reset flow
   - Reset link sent to verified email
   - New password entry form

---

## Clinic Dashboard (After Auth)

### Main Dashboard

9. **Dashboard / Home** (`/dashboard`)
   - Patient Pipeline board in 6 columns:
     - New Referral
     - Verifying Ins.
     - PA Pending
     - Scheduled
     - In Treatment
     - Complete
   - Drag-and-drop patient cards
   - Urgent action flags at top
   - Quick stats: patients in process, PA approvals pending, appointments today, completed this week

### Patient Management

10. **Referral Management** (`/dashboard/referrals`)
    - List of all referrals
    - Add new referral (form or upload document)
    - Referral form fields:
      - Patient info (name, DOB, address, phone, email, insurance ID, group number, carrier)
      - Referring physician (name, NPI, practice name, phone, specialty)
      - Clinical info (diagnosis ICD-10, prescribed treatment, urgency, clinical notes)

11. **Patient Records** (`/dashboard/patients`)
    - List of all patients
    - Patient detail view with full history:
      - Contact info
      - Insurance verification results
      - Prior Authorization status & approval numbers
      - Appointment history
      - Treatment records
      - Follow-up status
      - Signed consent forms
      - Completed intake forms

12. **Scheduling** (`/dashboard/schedule`)
    - Calendar view with infusion chair availability
    - Available staff assignments
    - Appointment creation/editing
    - Drag-drop appointments to chairs/times
    - Color-coded by treatment type
    - Conflict detection

### Operations & Settings

13. **Insurance Verification Results** (`/dashboard/insurance`)
    - Real-time EDI 271 responses
    - Patient eligibility status
    - Coverage details
    - Failed verifications requiring staff intervention

14. **Prior Authorization Tracking** (`/dashboard/authorizations`)
    - PA status by patient
    - Pending, approved, denied PA requests
    - Appeal deadlines
    - Appeal workflow management
    - CoverMyMeds integration

15. **Settings** (`/dashboard/settings`)
    - Clinic information (editable)
    - NPI number, tax ID, license number
    - Treatment types offered
    - Infusion chair count
    - Knowledge Base management (for chatbot)
    - User management (staff members)
    - Billing information

16. **Voice Agent Configuration** (`/dashboard/voice-agent`)
    - Voice agent settings
    - Script customization
    - Call scheduling preferences
    - Call recording logs
    - Inbound/outbound call tracking

17. **Analytics & Reporting** (`/dashboard/analytics`)
    - Patients processed by stage
    - Average time per stage
    - Insurance verification success rate
    - PA approval rate
    - No-show rate
    - Follow-up completion rate
    - Revenue/ROI metrics

---

## Patient Portal (Separate Domain/App)

### Patient-Facing Pages

18. **Patient Portal Login** (`/patient-portal/login`)
    - Unique portal link sent in email
    - Patient-specific, no password initially
    - Magic link or one-time verification code

19. **Patient Dashboard / Home** (`/patient-portal/dashboard`)
    - HIPAA Privacy Notice & Authorization (first-time only)
    - Appointment details & status
    - Pre-treatment instructions
    - Post-treatment recovery tips
    - Upcoming appointments
    - Treatment history
    - Portal chatbot widget (bottom-right)

20. **Patient Intake Form** (`/patient-portal/intake`)
    - Treatment-specific form (IV therapy vs Ketamine vs NAD+ vs Biologic vs Antibiotic vs TRT vs Home Infusion)
    - Clinical history questions
    - Allergy information
    - Current medications
    - Previous experience with treatment type
    - Form validation and submission
    - Status: Incomplete / Completed

21. **Consent & Documentation** (`/patient-portal/consent`)
    - HIPAA Privacy Notice
    - Digital signature capture
    - Timestamp and IP address logging
    - Treatment consent form
    - Downloadable copies of signed documents

22. **Treatment Records** (`/patient-portal/records`)
    - View only - patient's own treatment history
    - Session details (date, drug, dose, duration)
    - Provider notes (limited clinical summary)
    - Adverse reactions documentation

23. **Messages / Support** (`/patient-portal/messages`)
    - Chat with clinic staff
    - FAQ chatbot (reads from Knowledge Base)
    - Creates support tickets if chatbot cannot answer

24. **Appointment Booking** (`/patient-portal/schedule`)
    - View available appointment slots
    - Book own appointment
    - Reschedule or cancel
    - Confirmation details

---

## Gated Pages (Post-Week 5)

25. **Investors Page** (`/investors`)
    - Password protected
    - Demo video
    - Market data & TAM
    - Product roadmap
    - Team information
    - Financial metrics (if applicable)

---

## Summary Table

| Category | Pages |
|----------|-------|
| **Public Marketing** | 5 pages (Home, 4 Solutions, Compare, ROI, Blog) |
| **Authentication** | 3 pages (Login, Register, Password Reset) |
| **Clinic Dashboard** | 9 pages (Dashboard, Referrals, Patients, Schedule, Insurance, Authorizations, Settings, Voice Config, Analytics) |
| **Patient Portal** | 7 pages (Login, Dashboard, Intake, Consent, Records, Messages, Appointments) |
| **Gated/Admin** | 1 page (Investors) |
| **TOTAL** | 25+ pages |

---

## Key UI Components (Reusable)

- Patient pipeline Kanban board
- Insurance eligibility cards
- PA status tracker
- Appointment calendar
- Consent/signature capture modal
- Patient intake form builder (dynamic by treatment type)
- Analytics dashboard widgets
- Alert/notification system
- Chatbot widget
- File upload components (referral forms, documents)
