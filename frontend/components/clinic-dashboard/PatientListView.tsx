'use client';

import { ArrowLeft, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientDetailModal from '@/components/PatientDetailModal';
import { useState } from 'react';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';


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
  patientsError: string | null;
  patientsLoading: boolean;
  onBack?: () => void;
  clinicId?: string;
}

const getUrgencyColor = (urgency: string | undefined) => {
  switch (urgency) {
    case 'URGENT':
      return 'text-red-600 bg-red-50';
    case 'HIGH':
      return 'text-orange-600 bg-orange-50';
    case 'MEDIUM':
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

export default function PatientListView({
  patients,
  patientsError,
  patientsLoading,
  onBack,
  clinicId,
}: PatientListViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { setCurrentView, clinic } = useClinicDashboardView();
  const effectiveClinicId = clinicId || clinic?.id;

  const handleUpdateStatus = async (patientId: string, nextStage: string) => {
    const referralId = selectedPatient?._referral.id;
    console.log('Starting to update status for patient referral is:', referralId)
    try {
      const response = await fetchWithAuth(`https://scriptishrxnewmark.onrender.com/v1/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStage }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      // Update the local patient data
      const updatedPatient = await response.json();
      window.location.reload();
      
      console.log('✅ Patient status updated:', updatedPatient);
    } catch (error) {
      console.error('❌ Error updating patient status:', error);
      throw error;
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Patient List</h1>
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
            <p className="text-foreground/70">No patients to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-primary/5">
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground/70">Name</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground/70">Contact</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground/70">Diagnosis</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground/70">Urgency</span>
                  </th>
                 
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground/70">Referred</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-foreground/70">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="text-xs text-foreground/50">
                          DOB: {patient.dateOfBirth || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {patient.primaryDiagnosis || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                          patient.urgencyLevel
                        )}`}
                      >
                        {patient.urgencyLevel || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
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
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
          clinicId={effectiveClinicId}
        />
      )}
    </div>
  );
}
