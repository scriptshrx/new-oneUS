'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, Plus, Loader2, Hospital } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardView } from '../HospitalDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import InsuranceVerificationModal from './InsuranceVerificationModal';



const URGENCY_LEVELS = [
  { id: 'ROUTINE', label: 'Routine' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'EMERGENT', label: 'Emergent' },
];

const ICD_10_COMMON = [
  { code: 'F41.1', label: 'F41.1 - Generalized Anxiety Disorder' },
  { code: 'F32.9', label: 'F32.9 - Major Depressive Disorder' },
  { code: 'F34.1', label: 'F34.1 - Persistent Depressive Disorder' },
  { code: 'M79.3', label: 'M79.3 - Chronic Myofascial Pain' },
  { code: 'R41.82', label: 'R41.82 - Altered Mental Status' },
  { code: 'G89.29', label: 'G89.29 - Other Chronic Pain' },
];

const INSURANCE_PLAN_TYPES = [
  { id: 'PPO', label: 'PPO - Preferred Provider Organization' },
  { id: 'HMO', label: 'HMO - Health Maintenance Organization' },
  { id: 'EPO', label: 'EPO - Exclusive Provider Organization' },
  { id: 'POS', label: 'POS - Point of Service' },
  { id: 'INDEMNITY', label: 'Indemnity - Fee-for-Service' },
];

interface ReferralFormData {
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
  hospitalId:string;
  physicianLastName: string;
  physicianNPI: string;
  physicianPracticeName: string;
  physicianPhone: string;
  physicianSpecialty: string;

  // Clinical
  primaryDiagnosis: string;
  diagnosisDescription: string;
  prescribedTreatment: string;
  urgencyLevel: string;
  clinicalNotes: string;

  // Target clinic
  targetClinicId: string;
}

interface ReferralCreationPageProps {
  hospitalId: string;
  clinicPartners: Array<{ id: string; name: string }>;
  onBack: () => void;
}

export default function ReferralCreationPage({
  
  clinicPartners,
  onBack,
}: ReferralCreationPageProps) {

 const{hospitalId, clinics}=useDashboardView();
 const API_BASE_URL = 'https://scriptishrxnewmark.onrender.com/v1';
 
  const [formData, setFormData] = useState<ReferralFormData>({
    patientFirstName: '',
    patientLastName: '',
    patientDOB: '',
    patientPhone: '',
    hospitalId: hospitalId || '',
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
    clinicalNotes: '',
    targetClinicId: '',
  });

  // Keep formData.hospitalId in sync if context hospitalId loads after mount
  useEffect(() => {
    if (hospitalId) {
      setFormData(prev => ({ ...prev, hospitalId }));
    }
  }, [hospitalId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capacityError, setCapacityError] = useState<string>('');
  const [selectedClinicData, setSelectedClinicData] = useState<any>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [submittedPatientName, setSubmittedPatientName] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientFirstName.trim()) newErrors.patientFirstName = 'First name required';
    if (!formData.patientLastName.trim()) newErrors.patientLastName = 'Last name required';
    if (!formData.patientDOB) newErrors.patientDOB = 'Date of birth required';
    if (!formData.patientEmail) newErrors.patientEmail = 'Email required';
    if (!formData.patientPhone) newErrors.patientPhone = 'Phone required';
    if (!formData.physicianNPI) newErrors.physicianNPI = 'Physician NPI required';
    if (!formData.primaryDiagnosis) newErrors.primaryDiagnosis = 'Diagnosis code required';
    if (!formData.targetClinicId) newErrors.targetClinicId = 'Target clinic required';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('⚠️ [Validation] Form has errors:', newErrors);
    } else {
      console.log('✅ [Validation] All required fields are valid');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldName: string, value: string) => {
    // Special handling for clinic selection
    if (fieldName === 'targetClinicId') {
      handleClinicSelection(value);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const handleClinicSelection = async (clinicId: string) => {
    console.log('🏥 [Stage 1] Clinic selection initiated:', clinicId);
    setCapacityError('');

    try {
      // Fetch clinic details
      console.log('📡 [Stage 2] Fetching clinic details from:', `${API_BASE_URL}/clinics/${clinicId}`);
      
      const selectedClinic = clinics.find(clinic=>clinic.id==clinicId);
      console.log('Selected clinic:',selectedClinic);

      
      

      console.log('✅ [Stage 2] Clinic data hydrated successfully');

      // Fetch patients linked to this clinic
      console.log('📡 [Stage 3] Fetching patients for clinic:', clinicId);
      const patientsResponse = await fetchWithAuth(`${API_BASE_URL}/patients?clinicId=${clinicId}`
       );

      // Check if the response is OK
      if (!patientsResponse.ok) {
        console.error('❌ [Stage 3] Failed to fetch patients:', patientsResponse.statusText);
        throw new Error('Failed to fetch patients');
      }

      // Parse the response safely
      const responseText = await patientsResponse.text();
      if (!responseText) {
        console.error('❌ [Stage 3] Empty response body received');
        throw new Error('Empty response from server');
      }

      let patientsData;
      try {
        patientsData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [Stage 3] Failed to parse JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      console.log('✅ [Stage 3] Patients data fetched:', patientsData);

      const allPatients = Array.isArray(patientsData) ? patientsData : patientsData.patients || [];
      console.log('📊 [Stage 4] Total patients found:', allPatients.length);

      // Filter out archived and completed patients
      console.log('🔍 [Stage 5] Filtering patients - excluding INACTIVE_ARCHIVED and COMPLETE stages');
      const activePatients = allPatients.filter(
        (patient: any) =>
          patient.pipelineStage !== 'INACTIVE_ARCHIVED' &&
          patient.pipelineStage !== 'COMPLETE' &&
          patient.pipelineStage?.toLowerCase() !== 'inactive_archived' &&
          patient.pipelineStage?.toLowerCase() !== 'complete'
      );

      const activeCount = activePatients.length;
      const chairCount = selectedClinic.infusionChairCount || 0;

      console.log('✅ [Stage 5] Filter complete:');
      console.log(`   - Active patients: ${activeCount}`);
      console.log(`   - Available chairs: ${chairCount}`);
      console.log(`   - Active patients list:`, activePatients.map((p: any) => ({ id: p.id, stage: p.pipelineStage })));

      // Check capacity
      console.log('⚖️ [Stage 6] Checking capacity: activeCount (${activeCount}) >= chairCount (${chairCount})?');
      if (activeCount >= chairCount) {
        console.error('❌ [Stage 6] Clinic at capacity - selection rejected');
        setCapacityError(
          `This clinic has reached its capacity. Currently has ${activeCount} active patients with ${chairCount} available chairs.`
        );
        return; // Reject the selection
      }

      console.log('✅ [Stage 6] Clinic has available capacity - accepting selection');

      // Selection is valid, update form data
      console.log('💾 [Stage 7] Updating form with selected clinic');
      setFormData(prev => ({
        ...prev,
        targetClinicId: clinicId,
      }));

      setSelectedClinicData({
        name: selectedClinic.name,
        infusionChairCount: chairCount,
        activePatients: activeCount,
      });

      // Clear any existing errors for this field
      if (errors.targetClinicId) {
        setErrors(prev => ({
          ...prev,
          targetClinicId: '',
        }));
      }

      console.log('✅ [Stage 7] Form updated successfully');
    } catch (error) {
      console.error('❌ [Error] Exception during clinic selection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error checking clinic availability';
      setCapacityError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ [Submit] Form validation failed');
      return;
    }

    console.log('📋 [Submit - Stage 1] Form validation passed, preparing to submit referral');
    setIsSubmitting(true);
    setApiError('');

    try {
      const effectiveHospitalId = hospitalId || formData.hospitalId;
      if (!effectiveHospitalId) {
        console.error('❌ [Submit - Stage 2] Hospital ID not available');
        setApiError('Hospital not available. Please reload the dashboard.');
        setIsSubmitting(false);
        return;
      }
      console.log('✅ [Submit - Stage 2] Hospital ID confirmed:', effectiveHospitalId);

      const referralPayload = {
        clinicId: formData.targetClinicId,
        hospitalId: effectiveHospitalId,
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
          clinicalNotes: formData.clinicalNotes,
        },
      };

      console.log('📡 [Submit - Stage 3] Sending referral payload:', JSON.stringify(referralPayload));

      const response = await fetchWithAuth(`${API_BASE_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Submit - Stage 4] API returned error:', errorData);
        throw new Error(errorData.error || 'Failed to submit referral');
      }

      const result = await response.json();
      console.log('✅ [Submit - Stage 4] Referral submitted successfully:', result);
      
      setSuccessMessage(
        `✓ Referral submitted successfully! Patient ${result.patientName} has been created.`
      );
      
      // Store patient name and show insurance modal
      setSubmittedPatientName(result.patientName || `${formData.patientFirstName} ${formData.patientLastName}`);
      setShowInsuranceModal(true);

      // Reset form
      console.log('🔄 [Submit - Stage 5] Resetting form');
      setFormData({
        patientFirstName: '',
        patientLastName: '',
        patientDOB: '',
        patientPhone: '',
        patientEmail: '',
        hospitalId: hospitalId || '',
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
        clinicalNotes: '',
        targetClinicId: '',
      });

      console.log('✅ [Submit - Stage 5] Form reset complete, showing insurance verification modal');
      setIsSubmitting(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit referral';
      console.error('❌ [Submit - Error]', errorMessage);
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm text-primary font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Create New Referral</h2>
        <p className="text-foreground/70">
          Submit a patient referral to one of your partner clinics. All marked fields are required.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && showInsuranceModal && (
        <InsuranceVerificationModal
          patientName={submittedPatientName}
          onClose={() => {
            setShowInsuranceModal(false);
            setSuccessMessage('');
            onBack();
          }}
        />
      )}

      {/* Error Alert */}
      {(apiError || capacityError) && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">{apiError || capacityError}</p>
          </div>
        </div>
      )}

      {/* Main Form Sections */}
      <div className="space-y-8">
        {/* Target Clinic Selection */}
        <div className="space-y-4 p-6 rounded-xl bg-primary/10 border border-accent/20">
          <h3 className="text-lg font-semibold text-primary">Target Clinic</h3>
          <div>
            <Label htmlFor="targetClinicId" className="block text-sm font-medium mb-2">
              Select Partner Clinic <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.targetClinicId} onValueChange={(val) => handleClinicSelection(val)}>
              <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent className="bg-primary/10 backdrop-blur-md border-border/30">
                {clinicPartners.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Capacity Error */}
            {capacityError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{capacityError}</p>
              </div>
            )}

            {/* Clinic Info Display */}
            {selectedClinicData && !capacityError && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm font-medium text-green-400">{selectedClinicData.name}</p>
                <p className="text-xs text-green-400/70 mt-1">
                  {selectedClinicData.activePatients} of {selectedClinicData.infusionChairCount} chairs in use
                </p>
              </div>
            )}

            {errors.targetClinicId && !capacityError && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.targetClinicId}
              </p>
            )}
          </div>
        </div>

        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Patient Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="John"
                value={formData.patientFirstName}
                onChange={(e) => handleChange('patientFirstName', e.target.value)}
                className="bg-background/50 border-border/30"
              />
              {errors.patientFirstName && (
                <p className="text-xs text-destructive mt-1">{errors.patientFirstName}</p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Smith"
                value={formData.patientLastName}
                onChange={(e) => handleChange('patientLastName', e.target.value)}
                className="bg-background/50 border-border/30"
              />
              {errors.patientLastName && (
                <p className="text-xs text-destructive mt-1">{errors.patientLastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formData.patientDOB}
                onChange={(e) => handleChange('patientDOB', e.target.value)}
                className="bg-background/50 border-border/30"
              />
              {errors.patientDOB && (
                <p className="text-xs text-destructive mt-1">{errors.patientDOB}</p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                placeholder="patient@email.com"
                value={formData.patientEmail}
                onChange={(e) => handleChange('patientEmail', e.target.value)}
                className="bg-background/50 border-border/30"
              />
              {errors.patientEmail && (
                <p className="text-xs text-destructive mt-1">{errors.patientEmail}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="312-555-0000"
              value={formData.patientPhone}
              onChange={(e) => handleChange('patientPhone', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            {errors.patientPhone && (
              <p className="text-xs text-destructive mt-1">{errors.patientPhone}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Address</Label>
            <Input
              placeholder="123 Main St"
              value={formData.patientAddress}
              onChange={(e) => handleChange('patientAddress', e.target.value)}
              className="bg-background/50 border-border/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="City"
              value={formData.patientCity}
              onChange={(e) => handleChange('patientCity', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            <Input
              placeholder="State"
              maxLength={2}
              value={formData.patientState}
              onChange={(e) => handleChange('patientState', e.target.value.toUpperCase())}
              className="bg-background/50 border-border/30"
            />
            <Input
              placeholder="ZIP"
              value={formData.patientZipCode}
              onChange={(e) => handleChange('patientZipCode', e.target.value)}
              className="bg-background/50 border-border/30"
            />
          </div>
        </div>

        {/* Insurance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Insurance Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Insurance Carrier (e.g., Blue Cross)"
              value={formData.insuranceCarrier}
              onChange={(e) => handleChange('insuranceCarrier', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            <Input
              placeholder="Member ID"
              value={formData.insuranceMemberId}
              onChange={(e) => handleChange('insuranceMemberId', e.target.value)}
              className="bg-background/50 border-border/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Group Number"
              value={formData.insuranceGroupNumber}
              onChange={(e) => handleChange('insuranceGroupNumber', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            <Select value={formData.insurancePlanType} onValueChange={(val) => handleChange('insurancePlanType', val)}>
              <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent className="border-border/30">
                {INSURANCE_PLAN_TYPES.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Referring Physician */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Referring Physician</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Physician First Name"
              value={formData.physicianFirstName}
              onChange={(e) => handleChange('physicianFirstName', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            <Input
              placeholder="Physician Last Name"
              value={formData.physicianLastName}
              onChange={(e) => handleChange('physicianLastName', e.target.value)}
              className="bg-background/50 border-border/30"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">
              Physician NPI <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="10-digit NPI"
              maxLength={10}
              value={formData.physicianNPI}
              onChange={(e) => handleChange('physicianNPI', e.target.value.replace(/\D/g, ''))}
              className="bg-background/50 border-border/30"
            />
            {errors.physicianNPI && (
              <p className="text-xs text-destructive mt-1">{errors.physicianNPI}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Practice Name"
              value={formData.physicianPracticeName}
              onChange={(e) => handleChange('physicianPracticeName', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            <Input
              placeholder="Practice Phone"
              value={formData.physicianPhone}
              onChange={(e) => handleChange('physicianPhone', e.target.value)}
              className="bg-background/50 border-border/30"
            />
          </div>

          <Input
            placeholder="Specialty (e.g., Psychiatry)"
            value={formData.physicianSpecialty}
            onChange={(e) => handleChange('physicianSpecialty', e.target.value)}
            className="bg-background/50 border-border/30"
          />
        </div>

        {/* Clinical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Clinical Information</h3>

          <div>
            <Label className="block text-sm font-medium mb-2">
              Primary Diagnosis (ICD-10) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="E.g., F41.1 - Generalized Anxiety Disorder"
              value={formData.primaryDiagnosis}
              onChange={(e) => handleChange('primaryDiagnosis', e.target.value)}
              className="bg-background/50 border-border/30"
            />
            {errors.primaryDiagnosis && (
              <p className="text-xs text-destructive mt-1">{errors.primaryDiagnosis}</p>
            )}
          </div>

          <Input
            placeholder="Diagnosis Description"
            value={formData.diagnosisDescription}
            onChange={(e) => handleChange('diagnosisDescription', e.target.value)}
            className="bg-background/50 border-border/30"
          />

          <Input
            placeholder="Prescribed Treatment"
            value={formData.prescribedTreatment}
            onChange={(e) => handleChange('prescribedTreatment', e.target.value)}
            className="bg-background/50 border-border/30"
          />

          <div>
            <Label className="block text-sm font-medium mb-2">Urgency Level</Label>
            <Select value={formData.urgencyLevel} onValueChange={(val) => handleChange('urgencyLevel', val)}>
              <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className=" border-border/30">
                {URGENCY_LEVELS.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Clinical Notes</Label>
            <textarea
              placeholder="Additional clinical notes or observations..."
              value={formData.clinicalNotes}
              onChange={(e) => handleChange('clinicalNotes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-background/50 border border-border/30 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col md:flex-row gap-3 mt-10">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Referral...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Submit Referral
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="border-accent/30 text-accent hover:bg-accent/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
