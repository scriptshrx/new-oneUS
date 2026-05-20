'use client';

import { ArrowLeft, Mail, Phone, Calendar, AlertCircle, Loader, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PatientDetailModal from '@/components/PatientDetailModal';
import { useState, useEffect } from 'react';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import InsuranceOnlyModal from '../registration/InsuranceOnlymodal';
import { format } from 'date-fns';
import { patientDisplayName, staffDisplayName, type EnrichedChair } from '@/lib/chairDisplay';


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

interface Appointment {
  id: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  appointmentType: string;
  treatmentType: string;
  status: string;
  assignedChair?: string;
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

export default function Scheduling({
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
  const [appointmentsByPatientId, setAppointmentsByPatientId] = useState<Record<string, Appointment>>({});
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const { setCurrentView, clinic } = useClinicDashboardView();
  const effectiveClinicId = clinicId || clinic?.id;

  // Booking flow: chair → date → time → confirm (patient comes from selected chair)
  const [bookingStep, setBookingStep] = useState<'chair' | 'date' | 'time' | 'confirm'>('chair');
  const [bookingSelectedPatient, setBookingSelectedPatient] = useState<Patient | null>(null);
  const [bookingSelectedDate, setBookingSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingSelectedTime, setBookingSelectedTime] = useState<string | null>(null);
  const [bookingSelectedTimeDisplay, setBookingSelectedTimeDisplay] = useState<string | null>(null);
  const [bookingSelectedChair, setBookingSelectedChair] = useState<string | null>(null);
  const [chairs, setChairs] = useState<EnrichedChair[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch appointments for all patients
  useEffect(() => {
    const fetchAllAppointments = async () => {
      if (!patients || patients.length === 0) return;

      setLoadingAppointments(true);
      const appointmentsMap: Record<string, Appointment> = {};

      try {
        for (const patient of patients) {
          if (patient.id) {
            try {
              const response = await fetchWithAuth(
                `https://scriptishrxnewmark.onrender.com/v1/appointments/patient/${patient.id}`
              );

              if (response.ok) {
                const data = await response.json();
                const appointments = Array.isArray(data.data) ? data.data : [];
                if (appointments.length > 0) {
                  appointmentsMap[patient.id] = appointments[0]; // Store most recent appointment
                }
              }
            } catch (err) {
              console.error(`Error fetching appointment for patient ${patient.id}:`, err);
            }
          }
        }
        setAppointmentsByPatientId(appointmentsMap);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAllAppointments();
  }, [patients]);

  // Fetch chairs on component mount
  useEffect(() => {
    fetchChairs();
  }, []);

  const fetchChairs = async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/chairs/${effectiveClinicId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chairs');
      }

      const data = await response.json();
      setChairs(data.data || []);
    } catch (err) {
      console.error('Error fetching chairs:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to fetch chairs');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: Date, chairId?: string | null) => {
    try {
      setSlotsLoading(true);
      setBookingError(null);
      const dateStr = date.toISOString().split('T')[0];
      const chairQuery = chairId ? `&chairId=${chairId}` : '';
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/appointments/availability/${effectiveClinicId}/${dateStr}?durationMinutes=60${chairQuery}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }

      const data = await response.json();
      setAvailableSlots(data.data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to fetch available time slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookingSelectChair = (chair: EnrichedChair) => {
    if (!chair.patient) {
      setBookingError('This chair has no patient assigned. Assign a patient when creating or editing the chair.');
      return;
    }

    setBookingError(null);
    setBookingSelectedChair(chair.id);
    setBookingSelectedPatient({
      id: chair.patient.id,
      firstName: chair.patient.firstName,
      lastName: chair.patient.lastName,
      prescribedTreatment: chair.patient.prescribedTreatment ?? undefined,
      pipelineStage: chair.patient.pipelineStage,
    });
    setBookingSelectedDate(undefined);
    setBookingSelectedTime(null);
    setBookingSelectedTimeDisplay(null);
    setAvailableSlots([]);
    setBookingStep('date');
  };

  const handleBookingSelectDate = (date: Date | undefined) => {
    setBookingSelectedDate(date);
  };

  const handleContinueToTime = () => {
    if (!bookingSelectedDate || !bookingSelectedChair) return;
    fetchAvailableSlots(bookingSelectedDate, bookingSelectedChair);
    setBookingStep('time');
  };

  const handleBookingSelectTime = (slot: any) => {
    setBookingSelectedTime(slot.startTime);
    setBookingSelectedTimeDisplay(slot.clinicLocalTime || slot.startTime);
    setBookingStep('confirm');
  };

  const fetchAllAppointmentsForRefresh = async () => {
    if (!patients || patients.length === 0) return;

    setLoadingAppointments(true);
    const appointmentsMap: Record<string, Appointment> = {};

    try {
      for (const patient of patients) {
        if (patient.id) {
          try {
            const response = await fetchWithAuth(
              `https://scriptishrxnewmark.onrender.com/v1/appointments/patient/${patient.id}`
            );

            if (response.ok) {
              const data = await response.json();
              const appointments = Array.isArray(data.data) ? data.data : [];
              if (appointments.length > 0) {
                appointmentsMap[patient.id] = appointments[0];
              }
            }
          } catch (err) {
            console.error(`Error fetching appointment for patient ${patient.id}:`, err);
          }
        }
      }
      setAppointmentsByPatientId(appointmentsMap);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!bookingSelectedPatient || !bookingSelectedDate || !bookingSelectedTime || !bookingSelectedChair) return;

    try {
      setIsSubmitting(true);
      setBookingError(null);

      const response = await fetchWithAuth(
        'https://scriptishrxnewmark.onrender.com/v1/appointments',
        {
          method: 'POST',
          body: JSON.stringify({
            patientId: bookingSelectedPatient.id,
            clinicId: effectiveClinicId,
            chairId: bookingSelectedChair,
            appointmentType: 'IN_CLINIC',
            scheduledDate: bookingSelectedDate.toISOString(),
            scheduledStartTime: bookingSelectedTimeDisplay,
            scheduledEndTime: (() => {
              const [datePart, timePart] = (bookingSelectedTimeDisplay || '').split('T');
              const [hours, minutes, seconds = '00'] = timePart.split(':');
              const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
              return `${datePart}T${newHours}:${minutes}:${seconds}`;
            })(),
            treatmentType: 'IV_THERAPY',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error creating appointment',errorData)
        throw new Error(errorData.error || 'Failed to create appointment');
      }
const res = await response.json()
      console.log('Appointment created successfully:',res)
      setIsSubmitting(false);
      setBookingStep('chair');
      setBookingSelectedPatient(null);
      setBookingSelectedDate(undefined);
      setBookingSelectedTime(null);
      setBookingSelectedTimeDisplay(null);
      setBookingSelectedChair(null);
      
      // Refresh appointments
      await fetchAllAppointmentsForRefresh();
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error creating appointment:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to create appointment');
    }
  };

  const handleBookingBack = () => {
    if (bookingStep === 'date') {
      setBookingStep('chair');
      setBookingSelectedPatient(null);
      setBookingSelectedChair(null);
      setBookingSelectedDate(undefined);
    } else if (bookingStep === 'time') {
      setBookingStep('date');
      setBookingSelectedTime(null);
      setBookingSelectedTimeDisplay(null);
      setAvailableSlots([]);
    } else if (bookingStep === 'confirm') {
      setBookingStep('time');
    }
  };

  const selectedChair = chairs.find((c) => c.id === bookingSelectedChair);

  // Group patients by pipeline stage
  const schedulingPatients = patients.filter(
    (p) => (p.pipelineStage || '').toLowerCase() === 'scheduling'
  );

  const archivedPatients = patients.filter(
    (p) => (p.pipelineStage || '').toLowerCase() === 'inactive_archived'
  );

  const patientsByStage = {
    'scheduling': schedulingPatients,
    'inactive_archived': archivedPatients
  };

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

  const [showInsur, setShowInssur] = useState(false);

  // Helper function to format appointment start time
  const formatAppointmentStartTime = (appointment: Appointment | undefined) => {
    if (!appointment || !appointment.scheduledStartTime) {
      return 'Not Scheduled';
    }

    try {
      // Parse ISO string without timezone conversion
      const dateParts = appointment.scheduledStartTime.split('T')[0]?.split('-') || [];
      const date = new Date(dateParts.join('-') + 'T00:00:00Z');
      const dateStr = format(date, 'MMM d, yyyy');

      // Parse time from ISO string
      const startParts = appointment.scheduledStartTime.split('T')[1]?.split(':') || [];
      const startHours = parseInt(startParts[0] || '0');
      const startMinutes = parseInt(startParts[1] || '0');
      const startAmpm = startHours >= 12 ? 'PM' : 'AM';
      const startDisplay = startHours > 12 ? startHours - 12 : (startHours === 0 ? 12 : startHours);
      const timeStr = `${startDisplay}:${String(startMinutes).padStart(2, '0')} ${startAmpm}`;

      return `${dateStr} at ${timeStr}`;
    } catch (err) {
      console.error('Error formatting appointment time:', err);
      return 'N/A';
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
            <h1 className="text-3xl font-bold text-foreground">Scheduling</h1>
            <p className="text-sm text-foreground/70 mt-1">
              {/* {patients.length} patient{patients.length !== 1 ? 's' : ''} referred */}
              Schedule Patient Appointment
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
            {/* Booking Section */}
            <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-primary mb-6">Book New Appointment</h2>

                {bookingError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{bookingError}</p>
                    </div>
                  </div>
                )}

                {/* Step: Chair Selection */}
                {bookingStep === 'chair' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Select Infusion Chair
                    </label>
                    <p className="text-sm text-foreground/60 mb-2">
                      Patient is taken from the chair assignment. Only chairs with an assigned patient can be booked.
                    </p>
                    {bookingLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-primary mr-2" />
                        <p className="text-foreground/70">Loading chairs...</p>
                      </div>
                    ) : chairs.length === 0 ? (
                      <p className="text-foreground/70 text-center py-8">No chairs available</p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {chairs.map((chair) => {
                          const hasPatient = Boolean(chair.patient);
                          return (
                            <label
                              key={chair.id}
                              className={`flex items-start p-4 border rounded-lg transition-colors ${
                                !hasPatient
                                  ? 'border-border/20 bg-muted/30 cursor-not-allowed opacity-60'
                                  : bookingSelectedChair === chair.id
                                    ? 'border-primary bg-primary/10 cursor-pointer'
                                    : 'border-border/30 hover:bg-primary/5 cursor-pointer'
                              }`}
                            >
                              <input
                                type="radio"
                                name="chair"
                                value={chair.id}
                                disabled={!hasPatient}
                                checked={bookingSelectedChair === chair.id}
                                onChange={() => hasPatient && handleBookingSelectChair(chair)}
                                className="mt-1 mr-4"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">Chair {chair.chairNumber}</p>
                                <p className="text-sm text-foreground/70 mt-1">
                                  Staff: {staffDisplayName(chair.user, chair.staffName)}
                                </p>
                                <p className="text-sm text-foreground/70">
                                  Patient: {hasPatient ? patientDisplayName(chair.patient) : 'Not assigned'}
                                </p>
                                {hasPatient && chair.patient?.prescribedTreatment && (
                                  <p className="text-sm text-foreground/70">
                                    Treatment: {chair.patient.prescribedTreatment}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Date Selection */}
                {bookingStep === 'date' && bookingSelectedPatient && selectedChair && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg mb-4 space-y-2">
                      <p className="text-sm text-foreground/70">
                        Chair: <span className="font-semibold text-foreground">{selectedChair.chairNumber}</span>
                      </p>
                      <p className="text-sm text-foreground/70">
                        Patient:{' '}
                        <span className="font-semibold text-foreground">
                          {bookingSelectedPatient.firstName} {bookingSelectedPatient.lastName}
                        </span>
                      </p>
                    </div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Select Date
                    </label>
                    <div className="flex justify-center">
                      <div className="border border-border/30 rounded-lg">
                        <input
                          type="date"
                          value={bookingSelectedDate ? format(bookingSelectedDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) =>
                            handleBookingSelectDate(e.target.value ? new Date(`${e.target.value}T12:00:00`) : undefined)
                          }
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="p-4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Time Selection */}
                {bookingStep === 'time' && bookingSelectedDate && selectedChair && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg mb-4 space-y-2">
                      <p className="text-sm text-foreground/70">
                        Chair: <span className="font-semibold text-foreground">{selectedChair.chairNumber}</span>
                      </p>
                      {bookingSelectedPatient && (
                        <p className="text-sm text-foreground/70">
                          Patient:{' '}
                          <span className="font-semibold text-foreground">
                            {bookingSelectedPatient.firstName} {bookingSelectedPatient.lastName}
                          </span>
                        </p>
                      )}
                      <p className="text-sm text-foreground/70">
                        Date: <span className="font-semibold text-foreground">{bookingSelectedDate.toLocaleDateString()}</span>
                      </p>
                    </div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Select Time Slot
                    </label>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-primary mr-2" />
                        <p className="text-foreground/70">Loading available slots...</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                        <p className="text-foreground/70">No available time slots for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleBookingSelectTime(slot)}
                            className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
                              bookingSelectedTime === slot.startTime
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border/30 text-foreground hover:bg-primary/5'
                            }`}
                          >
                            <Clock className="w-4 h-4 mx-auto mb-1" />
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Confirmations */}
                {bookingStep === 'confirm' && bookingSelectedPatient && bookingSelectedDate && bookingSelectedTimeDisplay && bookingSelectedChair && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Patient</p>
                        <p className="text-foreground font-semibold">
                          {bookingSelectedPatient.firstName} {bookingSelectedPatient.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Date</p>
                        <p className="text-foreground font-semibold">{bookingSelectedDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Time</p>
                        <p className="text-foreground font-semibold">{bookingSelectedTimeDisplay}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Chair</p>
                        <p className="text-foreground font-semibold">
                          {chairs.find((c) => c.id === bookingSelectedChair)?.chairNumber}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70">
                      Click <span className="font-semibold">Create Appointment</span> to book this appointment.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  {bookingStep !== 'chair' && (
                    <button
                      onClick={handleBookingBack}
                      className="px-4 py-2 rounded-lg border border-border/30 text-foreground hover:bg-primary/10 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {bookingStep === 'date' && (
                    <button
                      onClick={handleContinueToTime}
                      disabled={!bookingSelectedDate}
                      className="ml-auto px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue to Time
                    </button>
                  )}
                  {bookingStep === 'time' && (
                    <button
                      onClick={() => bookingSelectedTime && setBookingStep('confirm')}
                      disabled={!bookingSelectedTime}
                      className="ml-auto px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue to Confirm
                    </button>
                  )}
                  {bookingStep === 'confirm' && (
                    <button
                      onClick={handleCreateAppointment}
                      disabled={isSubmitting}
                      className="ml-auto px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Appointment'}
                    </button>
                  )}
                </div>
              </div>
            </div>
                      {/* Tables for each pipeline stage */}
            {pipelineStages
              .filter((stage) => stage.id !== 'inactive_archived')
              .map((stage) => {
                const stagePatients = patientsByStage[stage.id as keyof typeof patientsByStage] || [];
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
                                <th className="px-6 py-3 text-left text-sm font-semibold border-r border-border/40">Scheduled</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold ">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stagePatients.map((patient: Patient, i: number) => (
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
                                  <td className="px-6 py-4 border-r border-primary/40">
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                      <Calendar className="w-4 h-4" />
                                      {loadingAppointments ? (
                                        <span className="text-foreground/50">Loading...</span>
                                      ) : (
                                        <span className="text-foreground">
                                          {formatAppointmentStartTime(appointmentsByPatientId[patient.id])}
                                        </span>
                                      )}
                                    </div>
                                  </td>
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
                          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70 border-r">Scheduled</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientsByStage['inactive_archived']?.map((patient: Patient) => (
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
                                {loadingAppointments ? (
                                  <span className="text-foreground/50">Loading...</span>
                                ) : (
                                  <span className="text-foreground">
                                    {formatAppointmentStartTime(appointmentsByPatientId[patient.id])}
                                  </span>
                                )}
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
