'use client';

import { ArrowLeft, Mail, Phone, Calendar, AlertCircle, Loader, Users, Clock, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PatientDetailModal from '@/components/PatientDetailModal';
import EditPatientModal from '@/components/EditPatientModal';
import { useState, useEffect } from 'react';
import ClinicDashboardLayout, { useClinicDashboardView } from '../ClinicDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import {
  formatAppointmentScheduledDate,
  formatScheduledStartTimeFromIso,
} from '@/lib/clinicAppointmentDisplay';
import InsuranceOnlyModal from '../registration/InsuranceOnlymodal';
import dayjs from 'dayjs';
import { Input } from '../ui/input';
import { set } from 'date-fns';
import axios from 'axios';

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

interface StaffMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  status: string;
  lastLogin:string;
  createdAt?: string;
}

interface PatientListViewProps {
  patients: Patient[];
  insuranceOnly: boolean;
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

const getDisplayDate = (patient: Patient) => {
  if (patient.appointment?.scheduledDate) {
    return formatAppointmentScheduledDate(patient.appointment.scheduledDate) || 'N/A';
  }
  return patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A';
};

const getDateTimeDisplay = (patient: Patient) => {
  if (patient.appointment?.scheduledStartTime) {
    return formatScheduledStartTimeFromIso(patient.appointment.scheduledStartTime);
  }
  return '';
};

const getDateLabel = (patient: Patient) => {
  if (patient.appointment?.scheduledStartTime) {
    return 'Scheduled';
  }
  return null;
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


// ============================================================================
// PATIENTS TAB COMPONENT
// ============================================================================
function PatientsTab({
  patients,
  patientsError,
  patientsLoading,
  insuranceOnly,
  updatingPatientId,
  setUpdatingPatientId,
  setSelectedPatient,
  setEditingPatient,
  setShowInsurance,
  handleUpdateStatus,
  effectiveClinicId,
  onDeletePatient,
  onPermanentDeletePatient,
  deletingPatientId,
}: {
  patients: Patient[];
  patientsError: string | null;
  patientsLoading: boolean;
  insuranceOnly: boolean;
  updatingPatientId: string | null;
  setUpdatingPatientId: (id: string | null) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setEditingPatient: (patient: Patient | null) => void;
  setShowInsurance: (show: boolean) => void;
  handleUpdateStatus: (patientId: string, newStage: string) => Promise<void>;
  effectiveClinicId: string;
  onDeletePatient?: (patientId: string) => Promise<void>;
  onPermanentDeletePatient?: (patientId: string) => Promise<void>;
  deletingPatientId?: string | null;
}) {
  const [showInssur, setShowInssur] = useState(false);

  const patientsByStage = pipelineStages.reduce((acc, stage) => {
    const stagePatients = patients.filter(
      (p) => (p.pipelineStage || '').toLowerCase() === stage.id
    );
    if (stagePatients.length > 0) {
      acc[stage.id] = stagePatients;
    }
    return acc;
  }, {} as Record<string, Patient[]>);

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
    <>
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
          {insuranceOnly && (
            <button
              className="rounded-lg bg-blue-500 text-white p-2 px-4"
              onClick={() => setShowInssur(true)}
            >
              Verify Insurance
            </button>
          )}
          <p className="text-foreground/70">No patients to display</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {pipelineStages
            .filter((stage) => stage.id !== 'inactive_archived')
            .map((stage) => {
              const stagePatients = patientsByStage[stage.id] || [];
              return (
                stagePatients.length > 0 && (
                  <div
                    key={stage.id}
                    className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-bold text-primary">{stage.label}</h2>
                        <span className="ml-auto text-sm text-foreground/60 font-semibold">
                          {stagePatients.length} patient{stagePatients.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-primary/80 text-white border-border/30">
                              <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                Contact
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                Diagnosis
                              </th>
                              {!insuranceOnly && (
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                  Status
                                </th>
                              )}
                              <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                Action
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                                Referred
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stagePatients.map((patient, i) => (
                              <tr
                                key={i}
                                className={`${
                                  i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent'
                                } border-b border-gray-400/50 hover:bg-white/10 transition-colors`}
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
                                {!insuranceOnly && (
                                  <td
                                    className="px-6 py-4 text-sm border-r border-primary/40"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {updatingPatientId === patient.id ? (
                                      <div className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-foreground/70">Updating...</span>
                                      </div>
                                    ) : (
                                      <Select
                                        value={(patient.pipelineStage || '').toLowerCase()}
                                        onValueChange={(newStage) => {
                                          handleUpdateStatus(patient.id, newStage);
                                        }}
                                      >
                                        <SelectTrigger className="w-40 text-accent shadow-md font-bold">
                                          <SelectValue placeholder={patient.pipelineStage} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {pipelineStages.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                              {s.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </td>
                                )}
                                <td className="px-6 py-4 text-right border border-r-primary/40">
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
                                    <div className="flex gap-2 justify-end items-center">
                                      <button
                                        onClick={() => setSelectedPatient(patient)}
                                        className="px-3 py-2 text-sm text-white bg-primary font-medium hover:bg-primary/60 rounded-lg transition-colors"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => setEditingPatient(patient)}
                                        className="px-3 py-2 text-sm text-white bg-accent font-medium hover:bg-accent/80 rounded-lg transition-colors"
                                      >
                                        Edit
                                      </button>
                                      {onDeletePatient && (
                                        <button
                                          type="button"
                                          onClick={() => onDeletePatient(patient.id)}
                                          disabled={deletingPatientId === patient.id}
                                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                          title="Archive patient"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 border-r border-primary/40">
                                  <div className="flex flex-col gap-1 text-sm text-foreground/70">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      {getDisplayDate(patient)}
                                    </div>
                                    {getDateTimeDisplay(patient) && (
                                      <span className="text-xs font-semibold text-accent">
                                        {getDateTimeDisplay(patient)}
                                      </span>
                                    )}
                                    <span className="text-xs text-foreground/50">{getDateLabel(patient)}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              );
            })}

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
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">
                          Diagnosis
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">
                          Referred
                        </th>
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
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <button
                                onClick={() => setSelectedPatient(patient)}
                                className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                              {onPermanentDeletePatient && (
                                <button
                                  type="button"
                                  onClick={() => onPermanentDeletePatient(patient.id)}
                                  disabled={deletingPatientId === patient.id}
                                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                  title="Permanently delete patient record"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-primary/40">
                            <div className="flex flex-col gap-1 text-sm text-foreground/70">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {getDisplayDate(patient)}
                              </div>
                              {getDateTimeDisplay(patient) && (
                                <span className="text-xs font-semibold text-accent">
                                  {getDateTimeDisplay(patient)}
                                </span>
                              )}
                              <span className="text-xs text-foreground/50">{getDateLabel(patient)}</span>
                            </div>
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
    </>
  );
}

// ============================================================================
// STAFF TAB COMPONENT
// ============================================================================
function StaffTab({
  staff,
  staffLoading,
  staffError,
  onDeleteStaff,
  deletingStaffId,
}: {
  staff: StaffMember[];
  staffLoading: boolean;
  staffError: string | null;
  onDeleteStaff?: (userId: string) => Promise<void>;
  deletingStaffId?: string | null;
}) {
  if (staffLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {staffError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error loading staff</p>
            <p className="text-sm text-red-700">{staffError}</p>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary/50" />
          </div>
          <p className="text-foreground/70">No staff members</p>
        </div>
      ) : (
        <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-primary">Clinic Staff</h2>
              <span className="ml-auto text-sm text-foreground/60 font-semibold">
                {staff.length} staff member{staff.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-primary/80 text-white border-border/30">
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member, i) => (
                    <tr
                      key={member.id}
                      className={`${
                        i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent'
                      } border-b border-gray-400/50 hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-6 py-4 border-r border-primary/40">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {member.firstName || member.lastName
                              ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {member.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {member.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="text-sm text-foreground/70">
                          {member.lastLogin
                            ? dayjs(member.lastLogin).format('hh:mm A MMM DD, YYYY')
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {onDeleteStaff && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => onDeleteStaff(member.id)}
                              disabled={deletingStaffId === member.id}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              title="Remove staff member"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// APPOINTMENTS TAB COMPONENT
// ============================================================================
function AppointmentsTab({
  patients,
  effectiveClinicId,
  onOpenPatient,
}: {
  patients: Patient[];
  effectiveClinicId: string;
  clinic: any;
  onOpenPatient?: (patient: Patient) => void;
}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      setError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/appointments/clinic/${effectiveClinicId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.data || []);
      console.log('Appointments fetched:',data.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Cancel this appointment?')) return;

    try {
      setDeletingId(appointmentId);
      setError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/appointments/${appointmentId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to cancel appointment');
      }
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      console.error('Error cancelling appointment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const openPatientFromAppointment = (appointment: any) => {
    if (!onOpenPatient || !appointment.patient?.id) return;
    const existing = patients.find((p) => p.id === appointment.patient.id);
    onOpenPatient(
      existing || {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName || '',
        lastName: appointment.patient.lastName || '',
        email: appointment.patient.emailAddress,
        phone: appointment.patient.phoneNumber,
        pipelineStage: appointment.patient.pipelineStage,
        primaryDiagnosis: appointment.patient.primaryDiagnosis,
        prescribedTreatment: appointment.patient.prescribedTreatment,
        urgencyLevel: appointment.patient.urgencyLevel,
      }
    );
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {/* Appointments Table */}
      <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary mb-6">Clinic Appointments</h2>

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
                  <tr className="border-b bg-primary/80 text-white border-border/30">
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Chair
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, i) => (
                    <tr
                      key={appointment.id}
                      className={`${
                        i % 2 === 0 ? 'bg-primary/5' : 'bg-transparent'
                      } border-b border-gray-400/50 hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="font-medium text-foreground">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="text-sm text-foreground/70">
                          {formatAppointmentScheduledDate(appointment.scheduledDate) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="text-sm text-foreground/70">
                          {formatScheduledStartTimeFromIso(appointment.scheduledStartTime) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="text-sm text-foreground/70">
                          {appointment.assignedChair || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-primary/40">
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
                      <td className="px-6 py-4 border-r border-primary/40">
                        <span className="text-sm text-foreground/70">
                          {appointment.appointmentType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          {/* {onOpenPatient && (
                            <button
                              type="button"
                              onClick={() => openPatientFromAppointment(appointment)}
                              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                              title="View patient / schedule"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          )} */}
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
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PatientListView({
  patients,
  patientsError,
  patientsLoading,
  insuranceOnly,
  onBack,
  clinicId,
}: PatientListViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showInsurance, setShowInsurance] = useState(false);
  const [updatingPatientId, setUpdatingPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'staff' | 'appointments'>('patients');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const { setCurrentView, clinic } = useClinicDashboardView();
  const effectiveClinicId = clinicId || clinic?.id;
  const[notice,setNotice]=useState('')

  // Fetch staff when Staff tab is clicked
  useEffect(() => {
    if (activeTab === 'staff' && effectiveClinicId && staff.length === 0) {
      fetchStaff();
    }
  }, [activeTab, effectiveClinicId]);

  const fetchStaff = async () => {
    if (!effectiveClinicId) return;

    setStaffLoading(true);
    setStaffError(null);
    try {
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/clinics/${effectiveClinicId}/staff`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.statusText}`);
      }

      const staffData = await response.json();
      setStaff(
        (Array.isArray(staffData) ? staffData : []).filter(
          (member: StaffMember) => member.status !== 'DELETED'
        )
      );
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffError(error instanceof Error ? error.message : 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const roles =[
  'CLINIC_ADMIN',
  'AUXILIARY_STAFF',
  'NURSE',
  'PHYSICIAN'
]

const[selectedRole,setSelectedRole]=useState('');
const[selecTrigger,setSelectTrigger]=useState(false);
const [link,setLink]=useState('')
const[copied,setCopied]=useState(false)
const[phone,setPhone]=useState('');
const[notifying,setNotifying]=useState(false)

const handleGenerateLink=(value: string)=>{
  if(!value)return;

  const encodedPayload = encodeURIComponent(
    btoa(
      JSON.stringify({
        clinicId: clinic.id,
        role: value.replace(' ', '_'),
        clinicName: clinic.name,
      })
    )
  );
  const linkUrl = `https://scriptishrx.net/register/staff?data=${encodedPayload}`;
setLink(linkUrl)
console.log('Link generated successfully')
setNotice('Link Generated!')
setTimeout(()=>setNotice(''),2000)
}
const handleNotifyStaff=async()=>{
 setNotifying(true)
 setNotice('')
  try{
    const res = await axios.post('https://scriptishrxnewmark.onrender.com/notify-staff',
    {phone,link,clinicName:clinic.name}
  );
  setNotice('Staff notified successfully');


  console.log('Staff notified successfully',res.data);
   setSelectTrigger(false)
   setNotifying(false)
  setTimeout(()=>setNotice(''),2000)
}
catch(e){
  console.log('Error notifying staff',e)
  setNotice('Failed to notify via SMS')
}

}
const handleCopy=()=>{
 navigator.clipboard.writeText(link)
  setCopied(true);
  setTimeout(()=>setCopied(false),2000)
}

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('Archive this patient? They will move to Archived Patients.')) return;

    try {
      setDeletingPatientId(patientId);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/patients/${patientId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to archive patient');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error archiving patient:', error);
      setNotice(error instanceof Error ? error.message : 'Failed to archive patient');
      setTimeout(() => setNotice(''), 3000);
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handlePermanentDeletePatient = async (patientId: string) => {
    if (
      !window.confirm(
        'Permanently delete this patient and all related records? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingPatientId(patientId);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/patients/${patientId}?permanent=true`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to delete patient');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error permanently deleting patient:', error);
      setNotice(error instanceof Error ? error.message : 'Failed to delete patient');
      setTimeout(() => setNotice(''), 3000);
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    if (!effectiveClinicId) return;
    if (!window.confirm('Remove this staff member from the clinic?')) return;

    try {
      setDeletingStaffId(userId);
      setStaffError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/clinics/${effectiveClinicId}/staff/${userId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to remove staff member');
      }
      setStaff((prev) => prev.filter((member) => member.id !== userId));
    } catch (error) {
      console.error('Error removing staff:', error);
      setStaffError(error instanceof Error ? error.message : 'Failed to remove staff member');
    } finally {
      setDeletingStaffId(null);
    }
  };

  const handleUpdateStatus = async (patientId: string, newStage: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    setUpdatingPatientId(patientId);
    const referralId = patient._referral?.id;
    console.log('Starting to update status for patient referral is:', referralId);
    try {
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/referrals/${referralId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ nextStage: newStage.toUpperCase() }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const updatedPatient = await response.json();
      setUpdatingPatientId(null);
      localStorage.setItem('dashboardView', 'patientsList');

      window.location.reload();

      console.log('✅ Patient status updated:', updatedPatient);
    } catch (error) {
      setUpdatingPatientId(null);
      console.error('❌ Error updating patient status:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {notice&&<div className='fixed p-4 mt-16 ml-16 px-6 rounded-lg shadow-lg bg-accent text-white font-semibold'>{notice}</div>}
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
                <span className="text-sm">Back to Dasboard</span>
              </button>
            )}
            <h1 className="text-3xl font-bold text-foreground">Clinic CRM</h1>
            <p className="text-sm text-foreground/70 mt-1">
              Manage clinic patients, staff, and appointments
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className=' flex flex-col justify-between md:flex-row gap-4 items-center'>
        <div className="flex gap-2 mt-6">
          <button
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
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'staff'
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-foreground hover:bg-primary/20'
            }`}
          >
            Staff
          </button>
          <button
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
        {/**Link generation buttton */}
        {
       <div className='flex flex-col space-y-4'>
          {!selecTrigger&&<button onClick={()=>{setSelectTrigger(true);if(selectedRole)return}}
          className='rounded-md shadow-lg cursor-pointer p-2 font-boldhover:shadow-md text-center bg-blue-900 text-white'>Register Staff</button>}
             {selecTrigger &&
           <div className='flex flex-col space-y-4'>
           <Select
                                        
           value={selectedRole}
                                        
           onValueChange={(value) => {
                                          
            setSelectedRole(value);handleGenerateLink(value)
                                        
          }}>
                                        
                                      <SelectTrigger className="w-40 text-accent shadow-md font-bold">
                                          <SelectValue placeholder={'Select Role'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {roles.map((r,i) => (
                                            <SelectItem key={i} value={r}>
                                              {r}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {link &&<div className='flex gap-2 items-center w-20 justify-between'>
                                        <div className='text-black text-xs'>{link.slice(0,25)}</div>
                                        <button onClick={handleCopy}
                                        className='rounded-lg p-1 px-2 text-center items-center flex justify-center bg-gray-800 text-white cursor-pointer shadow-sm'>{copied?'Copied':'Copy'}</button>
                                        </div>}
                                      <Input
                                      placeholder='phone, e.g: +123423223'
                                      className='border border-primary/20'
                                      onChange={(e)=>setPhone(e.target.value)}/>
                                      <button onClick={()=>{handleNotifyStaff()}}
          className='rounded-md shadow-lg cursor-pointer p-2 hover:shadow-md text-center bg-blue-900 text-white'>Notify Staff</button>
                                      </div>
                                      }
                                      </div>
        
        }</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'patients' && (
          <PatientsTab
            patients={patients}
            patientsError={patientsError}
            patientsLoading={patientsLoading}
            insuranceOnly={insuranceOnly}
            updatingPatientId={updatingPatientId}
            setUpdatingPatientId={setUpdatingPatientId}
            setSelectedPatient={setSelectedPatient}
            setEditingPatient={setEditingPatient}
            setShowInsurance={setShowInsurance}
            handleUpdateStatus={handleUpdateStatus}
            effectiveClinicId={effectiveClinicId || ''}
            onDeletePatient={handleDeletePatient}
            onPermanentDeletePatient={handlePermanentDeletePatient}
            deletingPatientId={deletingPatientId}
          />
        )}

        {activeTab === 'staff' && (
          <StaffTab
            staff={staff}
            staffLoading={staffLoading}
            staffError={staffError}
            onDeleteStaff={handleDeleteStaff}
            deletingStaffId={deletingStaffId}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab
            patients={patients}
            effectiveClinicId={effectiveClinicId || ''}
            clinic={clinic}
            onOpenPatient={setSelectedPatient}
          />
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

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient as any}
          onClose={() => setEditingPatient(null)}
          onSave={() => {
            setEditingPatient(null);
            window.location.reload();
          }}
        />
      )}

      {/* Insurance Modal */}
      {showInsurance && selectedPatient && (
        <InsuranceOnlyModal
          patientName={`${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim()}
          onClose={() => {
            setShowInsurance(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}
