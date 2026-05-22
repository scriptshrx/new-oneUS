'use client';

import { ArrowLeft, Mail, Phone, Calendar, AlertCircle, Loader, Trash2, Plus } from 'lucide-react';
import PatientDetailModal from '@/components/PatientDetailModal';
import { useState, useEffect } from 'react';
import { useChairDashboardView } from '../ChairDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import {
  formatAppointmentScheduledDate,
  formatScheduledStartTimeFromIso,
} from '@/lib/clinicAppointmentDisplay';

const API_URL = 'https://scriptishrxnewmark.onrender.com/v1';

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
  [key: string]: unknown;
}

interface Appointment {
  id: string;
  status?: string;
  appointmentType?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  assignedChair?: string;
  patient?: {
    id: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    pipelineStage?: string;
    primaryDiagnosis?: string;
    prescribedTreatment?: string;
    urgencyLevel?: string;
  };
}

interface PatientListViewProps {
  patients: Patient[];
  patientsError: string | null;
  patientsLoading: boolean;
  onBack?: () => void;
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

function appointmentPatientToPatient(apt: Appointment, patients: Patient[]): Patient | null {
  const p = apt.patient;
  if (!p?.id) return null;
  const existing = patients.find((row) => row.id === p.id);
  if (existing) return existing;
  return {
    id: p.id,
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    email: p.emailAddress,
    phone: p.phoneNumber,
    pipelineStage: p.pipelineStage,
    primaryDiagnosis: p.primaryDiagnosis,
    prescribedTreatment: p.prescribedTreatment,
    urgencyLevel: p.urgencyLevel as Patient['urgencyLevel'],
  };
}

export default function PatientListView({
  patients,
  patientsError,
  patientsLoading,
  onBack,
}: PatientListViewProps) {
  const { chair } = useChairDashboardView();
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments'>('patients');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!chair?.id) {
      setAppointmentsError('Chair ID not found');
      setAppointments([]);
      return;
    }

    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      const response = await fetchWithAuth(`${API_URL}/appointments/chair/${chair.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setAppointmentsError(message);
      console.error('Error fetching chair appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, chair?.id]);

  const handleUpdateStatus = async (_patientId: string, nextStage: string) => {
    const referralId = (selectedPatient?._referral as { id?: string } | undefined)?.id;
    if (!referralId) throw new Error('Referral id not found');
    try {
      const response = await fetchWithAuth(`${API_URL}/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStage }),
      });
      if (!response.ok) throw new Error(`Failed to update status: ${response.statusText}`);
      window.location.reload();
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw error;
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('Archive this patient?')) return;

    try {
      setDeletingPatientId(patientId);
      const response = await fetchWithAuth(`${API_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || 'Failed to archive patient');
      }
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive patient';
      console.error('Error archiving patient:', err);
      alert(message);
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Cancel this appointment?')) return;

    try {
      setDeletingId(appointmentId);
      const response = await fetchWithAuth(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || 'Failed to cancel appointment');
      }
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setAppointmentsError(message);
      console.error('Error cancelling appointment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenPatientFromAppointment = (appointment: Appointment) => {
    const patient = appointmentPatientToPatient(appointment, patients);
    if (patient) setSelectedPatient(patient);
  };

  if (patientsLoading && activeTab === 'patients') {
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
              {activeTab === 'patients'
                ? `${patients.length} patient${patients.length !== 1 ? 's' : ''} assigned`
                : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'patients'
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-foreground hover:bg-primary/20'
            }`}
          >
            Patients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-foreground hover:bg-primary/20'
            }`}
          >
            Appointments
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {(patientsError || appointmentsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{patientsError || appointmentsError}</p>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <>
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
                                <a href={`tel:${patient.phone}`} className="hover:text-primary transition-colors">
                                  {patient.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">{patient.primaryDiagnosis || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(patient.urgencyLevel)}`}
                          >
                            {patient.urgencyLevel || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Calendar className="w-4 h-4" />
                            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 items-center">
                            <button
                              type="button"
                              onClick={() => setSelectedPatient(patient)}
                              className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePatient(patient.id)}
                              disabled={deletingPatientId === patient.id}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              title="Archive patient"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'appointments' && (
          <>
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-primary mr-2" />
                <p className="text-foreground/70">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                <p className="text-foreground/70">No appointments scheduled</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-primary/5">
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-foreground/70">Patient</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-foreground/70">Date</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-foreground/70">Time</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-foreground/70">Status</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-foreground/70">Type</span>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-foreground/70">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground/70">
                            {formatAppointmentScheduledDate(appointment.scheduledDate) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground/70">
                            {formatScheduledStartTimeFromIso(appointment.scheduledStartTime) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'SCHEDULED'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {appointment.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground/70">
                            {appointment.appointmentType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenPatientFromAppointment(appointment)}
                              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                              title="View patient / schedule"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              disabled={deletingId === appointment.id}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              title="Cancel appointment"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          clinicName={chair?.name || 'Infusion Chair'}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
          clinicId={chair?.clinicId}
        />
      )}
    </div>
  );
}
