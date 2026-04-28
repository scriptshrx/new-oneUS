'use client';

import { ArrowLeft, Mail, Phone, Calendar, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PatientDetailModal from '@/components/PatientDetailModal';
import { useState } from 'react';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import InsuranceOnlyModal from '../registration/InsuranceOnlymodal';


interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  referringPhysician?: string;
  primaryDiagnosis?: string;
  prescribedTreatment?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: string;
  pipelineStage?: string;
  createdAt?: string;
  [key: string]: any;
}

interface PatientListViewProps {
  patients: Patient[];
  insuranceOnly:boolean;
  patientsError: string | null;
  patientsLoading: boolean;
  onBack?: () => void;
  clinicId?: string;
}

const getUrgencyColor = (urgency: string | undefined) => {
  switch (urgency) {
    case 'EMERGENT':
      return 'text-red-600 bg-red-50';
    case 'URGENT':
      return 'text-orange-600 bg-orange-50';
    case 'ROUTINE':
      return 'text-yellow-600 bg-yellow-50';
    case 'LOW':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getStatusColor = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const pipelineStages = [
  { id: 'new_referral', detail: 'New Referral', label: 'New Referral' },
  { id: 'insurance', detail: 'Insurance Verification', label: 'Insurance' },
  { id: 'authorization', detail: 'Prior Authorization', label: 'Authorization' },
  { id: 'scheduling', detail: 'Scheduling Treatment', label: 'Scheduling' },
  { id: 'treatment', detail: 'Treatment In Process', label: 'Treatment' },
  { id: 'complete', detail: 'Treatment Is Completed', label: 'Completed' },
  { id: 'follow_up', detail: 'Treatment Follow-ups', label: 'Follow-up' },
  { id: 'inactive_archived', label: 'Patient Archived', detail: 'INACTIVE_ARCHIVED' }
];

export default function PatientListView({
  patients,
  patientsError,
  patientsLoading,
  insuranceOnly,
  onBack,
  clinicId,
}: PatientListViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showInsurance, setShowInsurance] = useState(false);
  const [updatingPatientId, setUpdatingPatientId] = useState<string | null>(null);
  const { setCurrentView, clinic } = useClinicDashboardView();
  const effectiveClinicId = clinicId || clinic?.id;

  // Group patients by pipeline stage
  const patientsByStage = pipelineStages.reduce((acc, stage) => {
    const stagePatients = patients.filter(
      (p) => (p.pipelineStage || '').toLowerCase() === stage.id
    );
    if (stagePatients.length > 0) {
      acc[stage.id] = stagePatients;
    }
    return acc;
  }, {} as Record<string, Patient[]>);

  const handleUpdateStatus = async (patientId: string, newStage: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    setUpdatingPatientId(patientId);
    const referralId = patient._referral?.id;
    console.log('Starting to update status for patient referral is:', referralId);
    try {
      const response = await fetchWithAuth(`https://scriptishrxnewmark.onrender.com/v1/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStage: newStage.toLocaleUpperCase() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const updatedPatient = await response.json();
      setUpdatingPatientId(null);
      localStorage.setItem('dashboardView','patientsList')

      window.location.reload();

      console.log('✅ Patient status updated:', updatedPatient);
    } catch (error) {
      setUpdatingPatientId(null);
      console.error('❌ Error updating patient status:', error);
      throw error;
    }
  };

  const[showInsur,setShowInssur]=useState(false)

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 mb-3 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
            )}
            <h1 className="text-3xl font-bold text-foreground">Patients CRM</h1>
            <p className="text-sm text-foreground/70 mt-1">
              {patients.length} patient{patients.length !== 1 ? 's' : ''} referred
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {patientsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error loading patients</p>
              <p className="text-sm text-red-700">{patientsError}</p>
            </div>
          </div>
        )}

        {patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-primary/50" />
            </div>
            {insuranceOnly && <button className='rounded-lg bg-blue-500 text-white p-2 px-4' onClick={()=>setShowInssur(true)}>Verify Insurance</button>}

            <p className="text-foreground/70">No patients to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Tables for each pipeline stage */}
            {pipelineStages
              .filter((stage) => stage.id !== 'inactive_archived')
              .map((stage) => {
                const stagePatients = patientsByStage[stage.id] || [];
                return (stagePatients.length>0&&
                  <div key={stage.id} className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-bold text-primary">{stage.label}</h2>
                        <span className="ml-auto text-sm text-foreground/60 font-semibold">
                          {stagePatients.length} patient{stagePatients.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {stagePatients.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-primary/80 rounded-tl-lg rounded-tr-lg rounded-full text-white border-border/30">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white border-r border-border/40">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Contact</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Urgency</th>
                                
                                {!insuranceOnly && <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Status</th>}
                                <th className="px-6 py-3 text-right text-sm font-semibold ">Action</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Referred</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stagePatients.map((patient,i) => (
                                <tr
                                  key={i}
                                  className={`${(i%2)===0?'bg-primary/5':'bg-transparent'} border-b border-gray-400/50 hover:bg-white/10 transition-colors`}
                                >
                                  <td className="px-6 py-4 border-r border-primary/40">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium text-foreground">
                                        {patient.firstName} {patient.lastName}
                                      </span>
                                      <span className="text-xs text-foreground/50">
                                        DOB: {patient.dateOfBirth || 'N/A'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 border-r border-primary/40">
                                    <div className="flex flex-col gap-2">
                                      {patient.email && (
                                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                                          <Mail className="w-4 h-4" />
                                          <a
                                            href={`mailto:${patient.email}`}
                                            className="hover:text-primary transition-colors truncate"
                                          >
                                            {patient.email}
                                          </a>
                                        </div>
                                      )}
                                      {patient.phone && (
                                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                                          <Phone className="w-4 h-4" />
                                          <a
                                            href={`tel:${patient.phone}`}
                                            className="hover:text-primary transition-colors"
                                          >
                                            {patient.phone}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 border-r border-primary/40">
                                    <span className="text-sm text-foreground">
                                      {patient.primaryDiagnosis || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 border-r border-primary/40">
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                                        patient.urgencyLevel
                                      )}`}
                                    >
                                      {patient.urgencyLevel || 'N/A'}
                                    </span>
                                  </td>
                                 
                                  {!insuranceOnly && (
                                    <td className="px-6 py-4 text-sm border-r border-primary/40" 
                                    onClick={(e) => e.stopPropagation()}>
                                      {updatingPatientId === patient.id ? (
                                        <div className="flex items-center gap-2">
                                          <Loader className="w-4 h-4 animate-spin text-primary" />
                                          <span className="text-foreground/70">Updating...</span>
                                        </div>
                                      ) : (
                                        <Select
                                          value={(patient.pipelineStage || '').toLowerCase()}
                                          
                                          onValueChange={(newStage) => {console.log('selected patient is:',patient);handleUpdateStatus(patient.id, newStage)}}
                                        >
                                          <SelectTrigger className="w-40 text-accent shadow-md font-bold">
                                            <SelectValue placeholder={patient.pipelineStage} className='text-gray-600'/>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {pipelineStages
                                              // .filter((s) => s.id !== 'inactive_archived')
                                              .map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                  {s.label}
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </td>
                                  )}
                                  <td className="px-6 py-4 text-right">
                                    {insuranceOnly ? (
                                      <button
                                        onClick={() => {
                                          setSelectedPatient(patient);
                                          setShowInsurance(true);
                                        }}
                                        className="px-3 py-2 text-sm text-white font-medium bg-blue-500 hover:bg-blue-500/70 rounded-lg transition-colors"
                                      >
                                        Verify
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setSelectedPatient(patient)}
                                        className="px-3 py-2 text-sm text-white bg-primary font-medium text-primary hover:bg-primary/60 rounded-lg transition-colors"
                                      >
                                        View
                                      </button>
                                    )}
                                  </td>

                                   <td className="px-6 py-4 border-r border-primary/40">
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                      <Calendar className="w-4 h-4" />
                                      {patient.createdAt
                                        ? new Date(patient.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border/20 bg-primary/5 p-6 text-center text-foreground/70">
                          No patients in this stage yet.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Archived Patients Section */}
            {patientsByStage['inactive_archived'] && patientsByStage['inactive_archived'].length > 0 && (
              <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-bold text-primary">Archived Patients</h2>
                    <span className="ml-auto text-sm text-foreground/60 font-semibold">
                      {patientsByStage['inactive_archived'].length} patient
                      {patientsByStage['inactive_archived'].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Contact</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Diagnosis</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Urgency</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Referred</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientsByStage['inactive_archived'].map((patient) => (
                          <tr
                            key={patient.id}
                            className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-6 py-4 border-r border-primary/40">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-foreground">
                                  {patient.firstName} {patient.lastName}
                                </span>
                                <span className="text-xs text-foreground/50">
                                  DOB: {patient.dateOfBirth || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 border-r border-primary/40">
                              <div className="flex flex-col gap-2">
                                {patient.email && (
                                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                                    <Mail className="w-4 h-4" />
                                    <a
                                      href={`mailto:${patient.email}`}
                                      className="hover:text-primary transition-colors truncate"
                                    >
                                      {patient.email}
                                    </a>
                                  </div>
                                )}
                                {patient.phone && (
                                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                                    <Phone className="w-4 h-4" />
                                    <a
                                      href={`tel:${patient.phone}`}
                                      className="hover:text-primary transition-colors"
                                    >
                                      {patient.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 border-r border-primary/40">
                              <span className="text-sm text-foreground">
                                {patient.primaryDiagnosis || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 border-r border-primary/40">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                                  patient.urgencyLevel
                                )}`}
                              >
                                {patient.urgencyLevel || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 border-r border-primary/40">
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <Calendar className="w-4 h-4" />
                                {patient.createdAt
                                  ? new Date(patient.createdAt).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedPatient(patient)}
                                className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && !showInsurance && (
        <PatientDetailModal
          patient={selectedPatient as any}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
          clinicId={effectiveClinicId || ''}
          clinicName={clinic?.name || ''}
        />
      )}

      {showInsurance && selectedPatient && (
        <InsuranceOnlyModal
          patientName={`${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim()}
          onClose={() => {
            setShowInsurance(false);
            setSelectedPatient(null);
          }}
        />
      )}
      {showInsur && (
        <InsuranceOnlyModal
          patientName={''}
          onClose={() => {
            setShowInssur(false);
            
          }}
        />
      )}
    </div>
  );
}
