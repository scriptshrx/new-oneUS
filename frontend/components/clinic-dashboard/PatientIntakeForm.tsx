'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, Plus, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import InsuranceVerificationModal from '../registration/InsuranceVerificationModal';

const API_BASE_URL = 'https://scriptishrxnewmark.onrender.com/v1';

const URGENCY_LEVELS = [
  { id: 'ROUTINE', label: 'Routine' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'EMERGENT', label: 'Emergent' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const INSURANCE_PLAN_TYPES = [
  { id: 'PPO', label: 'PPO - Preferred Provider Organization' },
  { id: 'HMO', label: 'HMO - Health Maintenance Organization' },
  { id: 'MEDICARE', label: 'United States MEDICARE' },
  { id: 'MEDICAID', label: 'United States MEDICAID' }
];

interface IntakeFormData {
  // Patient info
  patientFirstName: string;
  patientLastName: string;
  patientDOB: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZipCode: string;

  // Insurance
  insuranceCarrier: string;
  insuranceMemberId: string;
  insuranceGroupNumber: string;
  insurancePlanType: string;

  // Referring physician
  physicianFirstName: string;
  physicianLastName: string;
  physicianNPI: string;
  physicianPracticeName: string;
  physicianPhone: string;
  physicianSpecialty: string;

  // Clinical core
  primaryDiagnosis: string;
  diagnosisDescription: string;
  prescribedTreatment: string;
  urgencyLevel: string;
}

interface StructuredNotes {
  chiefComplaint: string;
  medicalHistory: string;
  medications: string;
  vitalSigns: string;
  allergies: string;
  rosGeneral: string;
  rosHEENT: string;
  rosCardio: string;
  rosRespiratory: string;
  rosAbdomen: string;
  rosExtremities: string;
  rosSkin: string;
  rosNeuro: string;
  labs: string;
  assessmentAndPlan: string;
}

const initialStructuredNotes: StructuredNotes = {
  chiefComplaint: '',
  medicalHistory: '',
  medications: '',
  vitalSigns: '',
  allergies: '',
  rosGeneral: '',
  rosHEENT: '',
  rosCardio: '',
  rosRespiratory: '',
  rosAbdomen: '',
  rosExtremities: '',
  rosSkin: '',
  rosNeuro: '',
  labs: '',
  assessmentAndPlan: '',
};

interface PatientIntakeFormProps {
  onBack: () => void;
}

export default function PatientIntakeForm({ onBack }: PatientIntakeFormProps) {
  const { clinic, patients } = useClinicDashboardView();
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  useEffect(() => {
    if (clinic && patients) {
      const activePatients = patients.filter(
        (patient: any) =>
          patient.pipelineStage !== 'INACTIVE_ARCHIVED' &&
          patient.pipelineStage !== 'COMPLETE' &&
          patient.pipelineStage?.toLowerCase() !== 'inactive_archived' &&
          patient.pipelineStage?.toLowerCase() !== 'complete'
      );

      const activeCount = activePatients.length;
      const chairCount = clinic.infusionChairCount || 0;

      if (activeCount >= chairCount) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          CapacityError: `This clinic has reached its capacity. Currently has ${activeCount} active patients with ${chairCount} available chairs.`,
        }));
      }
    }
  }, [clinic, patients]);

  const [formData, setFormData] = useState<IntakeFormData>({
    patientFirstName: '',
    patientLastName: '',
    patientDOB: '',
    patientPhone: '',
    patientEmail: '',
    patientAddress: '',
    patientCity: '',
    patientState: '',
    patientZipCode: '',
    insuranceCarrier: '',
    insuranceMemberId: '',
    insuranceGroupNumber: '',
    insurancePlanType: '',
    physicianFirstName: '',
    physicianLastName: '',
    physicianNPI: '',
    physicianPracticeName: '',
    physicianPhone: '',
    physicianSpecialty: '',
    primaryDiagnosis: '',
    diagnosisDescription: '',
    prescribedTreatment: '',
    urgencyLevel: 'ROUTINE',
  });

  const [structuredNotes, setStructuredNotes] = useState<StructuredNotes>(initialStructuredNotes);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedPatientName, setSubmittedPatientName] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientFirstName.trim()) newErrors.patientFirstName = 'First name required';
    if (!formData.patientLastName.trim()) newErrors.patientLastName = 'Last name required';
    if (!formData.patientDOB) newErrors.patientDOB = 'Date of birth required';
    if (!formData.patientEmail) newErrors.patientEmail = 'Email required';
    if (!formData.patientPhone) newErrors.patientPhone = 'Phone required';

    if (!formData.insuranceCarrier.trim()) newErrors.insuranceCarrier = 'Insurance carrier required';
    if (!formData.insuranceMemberId.trim()) newErrors.insuranceMemberId = 'Member ID required';
    if (!formData.insuranceGroupNumber.trim()) newErrors.insuranceGroupNumber = 'Group number required';
    if (!formData.insurancePlanType) newErrors.insurancePlanType = 'Plan type required';

    if (!formData.primaryDiagnosis.trim()) newErrors.primaryDiagnosis = 'Diagnosis code required';
    if (!formData.prescribedTreatment.trim()) newErrors.prescribedTreatment = 'Prescribed treatment required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const handleNoteChange = (field: keyof StructuredNotes, value: string) => {
    setStructuredNotes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const activePatients = patients.filter(
      (patient: any) =>
        patient.pipelineStage !== 'INACTIVE_ARCHIVED' &&
        patient.pipelineStage !== 'COMPLETE' &&
        patient.pipelineStage?.toLowerCase() !== 'inactive_archived' &&
        patient.pipelineStage?.toLowerCase() !== 'complete'
    );

    const activeCount = activePatients.length;
    const chairCount = clinic.infusionChairCount || 0;

    if (activeCount >= chairCount) {
      setErrors({
        CapacityError: `This clinic has reached its capacity. Currently has ${activeCount} active patients with ${chairCount} available chairs.`
      });
      return; 
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      if (!clinic?.id) {
        setApiError('Clinic information not available. Please reload the dashboard.');
        setIsSubmitting(false);
        return;
      }

      // Compile the individual note fields into the final formatted string
      const compiledClinicalNotes = `Chief Complaint:
${structuredNotes.chiefComplaint}

Medical History:
${structuredNotes.medicalHistory}

Medications:
${structuredNotes.medications}

Vital Signs:
${structuredNotes.vitalSigns}

Allergies:
${structuredNotes.allergies}

Review of Systems:
- General review: ${structuredNotes.rosGeneral}
- HEENT: ${structuredNotes.rosHEENT}
- Cardio: ${structuredNotes.rosCardio}
- Respiratory: ${structuredNotes.rosRespiratory}
- Abdomen: ${structuredNotes.rosAbdomen}
- Extremities: ${structuredNotes.rosExtremities}
- Skin: ${structuredNotes.rosSkin}
- Neuro: ${structuredNotes.rosNeuro}

Labs:
${structuredNotes.labs}

Assessment and Plan:
${structuredNotes.assessmentAndPlan}`;

      const referralPayload = {
        clinicId: clinic.id,
        hospitalId: clinic.id,
        patientInfo: {
          firstName: formData.patientFirstName,
          lastName: formData.patientLastName,
          dateOfBirth: formData.patientDOB,
          phone: formData.patientPhone,
          email: formData.patientEmail,
          address: formData.patientAddress,
          city: formData.patientCity,
          state: formData.patientState,
          zipCode: formData.patientZipCode,
        },
        insurance: {
          carrier: formData.insuranceCarrier,
          memberId: formData.insuranceMemberId,
          groupNumber: formData.insuranceGroupNumber,
          planType: formData.insurancePlanType,
        },
        referringPhysician: {
          firstName: formData.physicianFirstName,
          lastName: formData.physicianLastName,
          npiNumber: formData.physicianNPI,
          practice: formData.physicianPracticeName,
          phone: formData.physicianPhone,
          specialty: formData.physicianSpecialty,
        },
        clinical: {
          primaryDiagnosis: formData.primaryDiagnosis,
          diagnosisDescription: formData.diagnosisDescription,
          prescribedTreatment: formData.prescribedTreatment,
          urgencyLevel: formData.urgencyLevel,
          // You originally passed allergy, medications, medicalHistory as separate fields too.
          // Extracting them from structured notes so your backend still gets them if it expects them there!
          allergy: structuredNotes.allergies,
          medications: structuredNotes.medications,
          medicalHistory: structuredNotes.medicalHistory,
          clinicalNotes: compiledClinicalNotes, 
        },
      };

      setSubmittedPatientName(`${formData.patientFirstName} ${formData.patientLastName}`);

      const response = await fetch(`${API_BASE_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(referralPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit patient intake');
      }

      const result = await response.json();
      setSuccessMessage(
        `✓ Patient intake submitted successfully! ${result.patientName} has been added to ${clinic.name}.`
      );
      setIsSubmitting(false);
      setShowInsuranceModal(true);

      setFormData({
        patientFirstName: '',
        patientLastName: '',
        patientDOB: '',
        patientPhone: '',
        patientEmail: '',
        patientAddress: '',
        patientCity: '',
        patientState: '',
        patientZipCode: '',
        insuranceCarrier: '',
        insuranceMemberId: '',
        insuranceGroupNumber: '',
        insurancePlanType: '',
        physicianFirstName: '',
        physicianLastName: '',
        physicianNPI: '',
        physicianPracticeName: '',
        physicianPhone: '',
        physicianSpecialty: '',
        primaryDiagnosis: '',
        diagnosisDescription: '',
        prescribedTreatment: '',
        urgencyLevel: 'ROUTINE',
      });

      setStructuredNotes(initialStructuredNotes);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit patient intake';
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm text-primary font-medium">Back to Dashboard</span>
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">New Patient Intake</h2>
        <p className="text-foreground/70">
          Register a new patient for {clinic?.name}. All marked fields are required.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
        <h3 className="text-lg font-semibold text-accent mb-4">Intake Form</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Clinic Name</p>
            <p className="text-lg font-semibold text-foreground">{clinic?.name || 'Loading...'}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">NPI Number</p>
            <p className="text-lg font-semibold text-foreground">{clinic?.npiNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-lg font-semibold text-foreground">{clinic?.primaryPhone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Address</p>
            <p className="text-lg font-semibold text-foreground">{clinic?.streetAddress || 'N/A'}</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mt-0.5">
            <div className="text-sm font-bold text-green-400">✓</div>
          </div>
          <div>
            <p className="text-sm font-medium text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {apiError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">{apiError}</p>
          </div>
        </div>
      )}

      {errors.CapacityError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">{errors.CapacityError}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Patient Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">First Name <span className="text-destructive">*</span></Label>
              <Input placeholder="John" value={formData.patientFirstName} onChange={(e) => handleChange('patientFirstName', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.patientFirstName && <p className="text-xs text-destructive mt-1">{errors.patientFirstName}</p>}
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Last Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Smith" value={formData.patientLastName} onChange={(e) => handleChange('patientLastName', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.patientLastName && <p className="text-xs text-destructive mt-1">{errors.patientLastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Date of Birth <span className="text-destructive">*</span></Label>
              <Input type="date" value={formData.patientDOB} onChange={(e) => handleChange('patientDOB', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.patientDOB && <p className="text-xs text-destructive mt-1">{errors.patientDOB}</p>}
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Email <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="patient@email.com" value={formData.patientEmail} onChange={(e) => handleChange('patientEmail', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.patientEmail && <p className="text-xs text-destructive mt-1">{errors.patientEmail}</p>}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Phone <span className="text-destructive">*</span></Label>
            <Input placeholder="+125550000" value={formData.patientPhone} onChange={(e) => handleChange('patientPhone', e.target.value)} className="bg-background/50 border-border/30" />
            {errors.patientPhone && <p className="text-xs text-destructive mt-1">{errors.patientPhone}</p>}
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Address</Label>
            <Input placeholder="123 Main St" value={formData.patientAddress} onChange={(e) => handleChange('patientAddress', e.target.value)} className="bg-background/50 border-border/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input placeholder="City" value={formData.patientCity} onChange={(e) => handleChange('patientCity', e.target.value)} className="bg-background/50 border-border/30" />
            <div>
              <Select value={formData.patientState} onValueChange={(val) => handleChange('patientState', val)}>
                <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="border-border/30">
                  {US_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="ZIP" value={formData.patientZipCode} onChange={(e) => handleChange('patientZipCode', e.target.value)} className="bg-background/50 border-border/30" />
          </div>
        </div>

        {/* Insurance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Insurance Information <span className="text-destructive">*</span></h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Insurance Carrier <span className="text-destructive">*</span></Label>
              <Input placeholder="E.g., Blue Cross" value={formData.insuranceCarrier} onChange={(e) => handleChange('insuranceCarrier', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.insuranceCarrier && <p className="text-xs text-destructive mt-1">{errors.insuranceCarrier}</p>}
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Member ID <span className="text-destructive">*</span></Label>
              <Input placeholder="Member ID" value={formData.insuranceMemberId} onChange={(e) => handleChange('insuranceMemberId', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.insuranceMemberId && <p className="text-xs text-destructive mt-1">{errors.insuranceMemberId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Group Number <span className="text-destructive">*</span></Label>
              <Input placeholder="Group Number" value={formData.insuranceGroupNumber} onChange={(e) => handleChange('insuranceGroupNumber', e.target.value)} className="bg-background/50 border-border/30" />
              {errors.insuranceGroupNumber && <p className="text-xs text-destructive mt-1">{errors.insuranceGroupNumber}</p>}
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Plan Type <span className="text-destructive">*</span></Label>
              <Select value={formData.insurancePlanType} onValueChange={(val) => handleChange('insurancePlanType', val)}>
                <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent className="border-border/30">
                  {INSURANCE_PLAN_TYPES.map((plan) => <SelectItem key={plan.id} value={plan.id}>{plan.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.insurancePlanType && <p className="text-xs text-destructive mt-1">{errors.insurancePlanType}</p>}
            </div>
          </div>
        </div>

        {/* Referring Physician */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Referring Physician</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Physician First Name" value={formData.physicianFirstName} onChange={(e) => handleChange('physicianFirstName', e.target.value)} className="bg-background/50 border-border/30" />
            <Input placeholder="Physician Last Name" value={formData.physicianLastName} onChange={(e) => handleChange('physicianLastName', e.target.value)} className="bg-background/50 border-border/30" />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Physician NPI</Label>
            <Input placeholder="10-digit NPI" maxLength={10} value={formData.physicianNPI} onChange={(e) => handleChange('physicianNPI', e.target.value.replace(/\D/g, ''))} className="bg-background/50 border-border/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Practice Name" value={formData.physicianPracticeName} onChange={(e) => handleChange('physicianPracticeName', e.target.value)} className="bg-background/50 border-border/30" />
            <Input placeholder="Practice Phone" value={formData.physicianPhone} onChange={(e) => handleChange('physicianPhone', e.target.value)} className="bg-background/50 border-border/30" />
          </div>

          <Input placeholder="Specialty (e.g., Psychiatry)" value={formData.physicianSpecialty} onChange={(e) => handleChange('physicianSpecialty', e.target.value)} className="bg-background/50 border-border/30" />
        </div>

        {/* Clinical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Clinical Information</h3>

          <div>
            <Label className="block text-sm font-medium mb-2">Primary Diagnosis (ICD-10) <span className="text-destructive">*</span></Label>
            <Input type="text" placeholder="E.g., F41.1 - Generalized Anxiety Disorder" value={formData.primaryDiagnosis} onChange={(e) => handleChange('primaryDiagnosis', e.target.value)} className="bg-background/50 border-border/30" />
            {errors.primaryDiagnosis && <p className="text-xs text-destructive mt-1">{errors.primaryDiagnosis}</p>}
          </div>

          <Input placeholder="Diagnosis Description" value={formData.diagnosisDescription} onChange={(e) => handleChange('diagnosisDescription', e.target.value)} className="bg-background/50 border-border/30" />

          

          <div>
            <Label className="block text-sm font-medium mb-2">Urgency Level</Label>
            <Select value={formData.urgencyLevel} onValueChange={(val) => handleChange('urgencyLevel', val)}>
              <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/30">
                {URGENCY_LEVELS.map((level) => <SelectItem key={level.id} value={level.id}>{level.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* STRUCTURED CLINICAL NOTES */}
          <div className="pt-6 border-t border-border/30 space-y-6">
            <h3 className="text-lg font-semibold text-foreground/90">Clinical Notes</h3>
            
            {/* Main Sections */}
            {[
              { id: 'chiefComplaint', label: 'Chief Complaint:' },
              { id: 'medicalHistory', label: 'Medical History:' },
              { id: 'medications', label: 'Medications:' },
              { id: 'vitalSigns', label: 'Vital Signs:' },
              { id: 'allergies', label: 'Allergies:' },
            ].map((field) => (
              <div key={field.id}>
                <Label className="block text-sm font-bold mb-2 text-foreground/80">{field.label}</Label>
                <textarea
                  rows={2}
                  value={structuredNotes[field.id as keyof StructuredNotes]}
                  onChange={(e) => handleNoteChange(field.id as keyof StructuredNotes, e.target.value)}
                  className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-lg text-foreground text-sm focus:outline-none focus:border-accent/50 resize-y placeholder:text-foreground/30"
                  placeholder={`Enter ${field.label.toLowerCase().replace(':', '')}...`}
                />
              </div>
            ))}

            {/* Review of Systems */}
            <div className="p-4 bg-primary/5 rounded-xl border border-border/30 space-y-4">
              <Label className="block text-sm font-bold text-foreground/80">Review of Systems:</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'rosGeneral', label: '- General review:' },
                  { id: 'rosHEENT', label: '- HEENT:' },
                  { id: 'rosCardio', label: '- Cardio:' },
                  { id: 'rosRespiratory', label: '- Respiratory:' },
                  { id: 'rosAbdomen', label: '- Abdomen:' },
                  { id: 'rosExtremities', label: '- Extremities:' },
                  { id: 'rosSkin', label: '- Skin:' },
                  { id: 'rosNeuro', label: '- Neuro:' },
                ].map((field) => (
                  <div key={field.id}>
                    <Label className="block text-xs font-semibold mb-2 text-foreground/70">{field.label}</Label>
                    <textarea
                      rows={2}
                      value={structuredNotes[field.id as keyof StructuredNotes]}
                      onChange={(e) => handleNoteChange(field.id as keyof StructuredNotes, e.target.value)}
                      className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-lg text-foreground text-sm focus:outline-none focus:border-accent/50 resize-y"
                    />
                  </div>
                ))}
                
              </div>
            </div>

            {/* Final Sections */}
            {[
              { id: 'labs', label: 'Labs:' },
              { id: 'assessmentAndPlan', label: 'Assessment and Plan:' },
            ].map((field) => (
              <div key={field.id}>
                <Label className="block text-sm font-bold mb-2 text-foreground/80">{field.label}</Label>
                <textarea
                  rows={2}
                  value={structuredNotes[field.id as keyof StructuredNotes]}
                  onChange={(e) => handleNoteChange(field.id as keyof StructuredNotes, e.target.value)}
                  className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-lg text-foreground text-sm focus:outline-none focus:border-accent/50 resize-y placeholder:text-foreground/30"
                  placeholder={`Enter ${field.label.toLowerCase().replace(':', '')}...`}
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">Prescribed Treatment <span className="text-destructive">*</span></Label>
            <Input placeholder="Prescribed Treatment" value={formData.prescribedTreatment} onChange={(e) => handleChange('prescribedTreatment', e.target.value)} className="bg-background/50 border-border/30" />
            {errors.prescribedTreatment && <p className="text-xs text-destructive mt-1">{errors.prescribedTreatment}</p>}
          </div>
        </div>

        {showInsuranceModal && (
          <InsuranceVerificationModal
            patientName={submittedPatientName}
            onClose={() => {
              setShowInsuranceModal(false);
              setSuccessMessage('');
              onBack();
            }}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-10">
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Intake...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Submit Patient Intake
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="border-accent/30 text-accent hover:bg-accent/10">
          Cancel
        </Button>
      </div>
    </form>
  );
}