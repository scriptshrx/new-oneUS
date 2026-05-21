'use client';

import { ArrowLeft, Calendar as CalendarIcon, AlertCircle, Loader, Clock, CheckCircle2, Mail, Phone, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, useMemo } from 'react';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { addDays, format, startOfToday } from 'date-fns';
import { ReminderType } from './ReminderButtons';
import { patientDisplayName, type EnrichedChair } from '@/lib/chairDisplay';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  pipelineStage?: string;
  prescribedTreatment?: string;
  [key: string]: unknown;
}

interface TimeSlot {
  startTime: string;
  display: string;
  clinicLocalTime?: string;
}

interface SchedulingProps {
  patients?: Patient[];
  patientsError?: string | null;
  patientsLoading?: boolean;
  onBack?: () => void;
  clinicId?: string;
}

const CLINIC_SLOT_OPEN_TIME = '08:00';
const CLINIC_SLOT_CLOSE_TIME = '20:30';

function formatTimeTriggerLabel(timeDisplay: string | null): string {
  if (!timeDisplay) return 'Select time';
  const timePart = timeDisplay.split('T')[1];
  if (!timePart) return timeDisplay;
  const [hours, minutes] = timePart.split(':');
  const h = parseInt(hours || '0', 10);
  const m = parseInt(minutes || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function Scheduling({
  patients = [],
  patientsError,
  patientsLoading = false,
  onBack,
  clinicId,
}: SchedulingProps) {
  const { clinic } = useClinicDashboardView();
  const effectiveClinicId = clinicId || clinic?.id;

  const [bookingSelectedPatient, setBookingSelectedPatient] = useState<Patient | null>(null);
  const [bookingSelectedDate, setBookingSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingSelectedTime, setBookingSelectedTime] = useState<string | null>(null);
  const [bookingSelectedTimeDisplay, setBookingSelectedTimeDisplay] = useState<string | null>(null);
  const [bookingSelectedChair, setBookingSelectedChair] = useState<string | null>(null);
  const [chairs, setChairs] = useState<EnrichedChair[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [chairsLoading, setChairsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<Set<ReminderType>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => {
    if (!bookingSuccess) return;
    const timer = window.setTimeout(() => setBookingSuccess(null), 8000);
    return () => window.clearTimeout(timer);
  }, [bookingSuccess]);

  useEffect(() => {
    if (!effectiveClinicId) return;
    const loadChairs = async () => {
      try {
        setChairsLoading(true);
        setBookingError(null);
        const response = await fetchWithAuth(
          `https://scriptishrxnewmark.onrender.com/v1/chairs/${effectiveClinicId}`
        );
        if (!response.ok) throw new Error('Failed to fetch chairs');
        const data = await response.json();
        setChairs(data.data || []);
      } catch (err) {
        console.error('Error fetching chairs:', err);
        setBookingError(err instanceof Error ? err.message : 'Failed to fetch chairs');
      } finally {
        setChairsLoading(false);
      }
    };
    loadChairs();
  }, [effectiveClinicId]);

  useEffect(() => {
    if (!bookingSelectedDate || !effectiveClinicId) {
      setAvailableSlots([]);
      return;
    }
    const loadSlots = async () => {
      try {
        setSlotsLoading(true);
        setBookingError(null);
        const dateStr = bookingSelectedDate.toISOString().split('T')[0];
        const chairQuery = bookingSelectedChair ? `&chairId=${bookingSelectedChair}` : '';
        const hoursQuery = `&openTime=${CLINIC_SLOT_OPEN_TIME}&closeTime=${CLINIC_SLOT_CLOSE_TIME}`;
        const response = await fetchWithAuth(
          `https://scriptishrxnewmark.onrender.com/v1/appointments/availability/${effectiveClinicId}/${dateStr}?durationMinutes=60${chairQuery}${hoursQuery}`
        );
        if (!response.ok) throw new Error('Failed to fetch available time slots');
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
    loadSlots();
  }, [bookingSelectedDate, bookingSelectedChair, effectiveClinicId]);

  const bookableChairs = useMemo(
    () => chairs.filter((chair) => Boolean(chair.patient)),
    [chairs]
  );

  const selectedChair = chairs.find((c) => c.id === bookingSelectedChair);

  const patientContact = useMemo(() => {
    if (!bookingSelectedPatient) {
      return { phone: null as string | null, email: null as string | null };
    }
    const fromReferrals = patients.find((p) => p.id === bookingSelectedPatient.id);
    const portalEmail = selectedChair?.patient?.user?.email;
    return {
      phone: fromReferrals?.phone?.trim() || null,
      email: fromReferrals?.email?.trim() || portalEmail?.trim() || null,
    };
  }, [bookingSelectedPatient, patients, selectedChair]);

  const handleSelectPatient = (chairId: string) => {
    const chair = chairs.find((c) => c.id === chairId);
    if (!chair?.patient) {
      setBookingError('This chair has no patient assigned.');
      return;
    }
    setBookingError(null);
    setBookingSuccess(null);
    setBookingSelectedChair(chair.id);
    setBookingSelectedPatient({
      id: chair.patient.id,
      firstName: chair.patient.firstName,
      lastName: chair.patient.lastName,
      prescribedTreatment: chair.patient.prescribedTreatment ?? undefined,
      pipelineStage: chair.patient.pipelineStage,
    });
    setBookingSelectedTime(null);
    setBookingSelectedTimeDisplay(null);
  };

  const handleSelectDate = (date: Date | undefined) => {
    setBookingSelectedDate(date);
    setBookingSelectedTime(null);
    setBookingSelectedTimeDisplay(null);
    if (date) setCalendarOpen(false);
  };

  const handleSelectTime = (slot: TimeSlot) => {
    setBookingSelectedTime(slot.startTime);
    setBookingSelectedTimeDisplay(slot.clinicLocalTime || slot.startTime);
    setTimeOpen(false);
  };

  const toggleReminder = (type: ReminderType) => {
    setSelectedReminders((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const scheduleRemindersForAppointment = async (appointmentId: string, patientId: string) => {
    if (selectedReminders.size === 0) return;
    await fetchWithAuth('https://scriptishrxnewmark.onrender.com/v1/reminders', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        appointmentId,
        types: Array.from(selectedReminders),
      }),
    });
  };

  const resetForm = () => {
    setBookingSelectedPatient(null);
    setBookingSelectedDate(undefined);
    setBookingSelectedTime(null);
    setBookingSelectedTimeDisplay(null);
    setBookingSelectedChair(null);
    setSelectedReminders(new Set());
    setAvailableSlots([]);
  };

  const handleCreateAppointment = async () => {
    if (!bookingSelectedPatient || !bookingSelectedDate || !bookingSelectedTime || !bookingSelectedChair) {
      setBookingError('Select a patient, date, and time before creating the appointment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingError(null);
      setBookingSuccess(null);

      const patientName = `${bookingSelectedPatient.firstName} ${bookingSelectedPatient.lastName}`.trim();
      const chairLabel = selectedChair?.chairNumber ?? 'selected chair';

      const response = await fetchWithAuth('https://scriptishrxnewmark.onrender.com/v1/appointments', {
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
            const newHours = (parseInt(hours, 10) + 1).toString().padStart(2, '0');
            return `${datePart}T${newHours}:${minutes}:${seconds}`;
          })(),
          treatmentType: 'IV_THERAPY',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const appointmentData = await response.json();
      await scheduleRemindersForAppointment(appointmentData.data.id, bookingSelectedPatient.id);

      setBookingSuccess(
        `Appointment created for ${patientName} in chair ${chairLabel} on ${format(bookingSelectedDate, 'MMM d, yyyy')}.`
      );
      resetForm();
    } catch (err) {
      console.error('Error creating appointment:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCreate =
    Boolean(bookingSelectedPatient && bookingSelectedDate && bookingSelectedTime && bookingSelectedChair);

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-foreground/70">Loading scheduling...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border/30 bg-primary/5">
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
        <p className="text-sm text-foreground/70 mt-1">Schedule patient appointment</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {patientsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{patientsError}</p>
              </div>
            </div>
          )}

          {bookingSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Appointment scheduled</p>
                <p className="text-sm text-green-700">{bookingSuccess}</p>
              </div>
            </div>
          )}

          {bookingError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{bookingError}</p>
              </div>
            </div>
          )}

          <div className="bg-primary/10 border border-border/30 rounded-2xl p-6 space-y-6">
            {/* Row 1: Patient, Calendar, Time */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-sm font-semibold text-foreground">Patient</label>
                <Select
                  value={bookingSelectedChair ?? ''}
                  onValueChange={handleSelectPatient}
                  disabled={chairsLoading}
                >
                  <SelectTrigger className="w-full bg-background border-border/30 h-10">
                    <SelectValue
                      placeholder={chairsLoading ? 'Loading patients...' : 'Select patient'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {bookableChairs.map((chair) => (
                      <SelectItem key={chair.id} value={chair.id}>
                        {patientDisplayName(chair.patient)} · Chair {chair.chairNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-sm font-semibold text-foreground">Date</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-10 bg-background border-border/30 font-normal"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CalendarIcon className="w-4 h-4 shrink-0 text-primary" />
                        {bookingSelectedDate
                          ? format(bookingSelectedDate, 'EEE, MMM d, yyyy')
                          : 'Select date'}
                      </span>
                      <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bookingSelectedDate}
                      onSelect={handleSelectDate}
                      disabled={(date) => {
                        const today = startOfToday();
                        const maxDate = addDays(today, 90);
                        return date < today || date > maxDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-sm font-semibold text-foreground">Time</label>
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!bookingSelectedDate}
                      className="w-full justify-between h-10 bg-background border-border/30 font-normal disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Clock className="w-4 h-4 shrink-0 text-primary" />
                        {bookingSelectedTimeDisplay
                          ? formatTimeTriggerLabel(bookingSelectedTimeDisplay)
                          : bookingSelectedDate
                            ? 'Select time'
                            : 'Pick a date first'}
                      </span>
                      <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" align="start">
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-sm text-foreground/70">
                        <Loader className="w-5 h-5 animate-spin text-primary" />
                        Loading slots...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-center text-foreground/70 py-6">
                        No available time slots for this date
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => handleSelectTime(slot)}
                            className={cn(
                              'rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                              bookingSelectedTime === slot.startTime
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border/30 hover:bg-primary/5'
                            )}
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 2: Phone, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/80 px-4 py-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {bookingSelectedPatient
                      ? patientContact.phone || 'Not on file'
                      : 'Select a patient'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/80 px-4 py-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {bookingSelectedPatient
                      ? patientContact.email || 'Not on file'
                      : 'Select a patient'}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Reminders */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => toggleReminder('BEFORE_INFUSION_72H')}
                className={cn(
                  'flex-1 min-w-[200px] px-4 py-3 rounded-lg border text-sm text-left transition-colors',
                  selectedReminders.has('BEFORE_INFUSION_72H')
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/30 bg-background hover:bg-primary/5'
                )}
              >
                72hrs reminder before infusion
              </button>
              <button
                type="button"
                onClick={() => toggleReminder('BEFORE_INFUSION_24H')}
                className={cn(
                  'flex-1 min-w-[200px] px-4 py-3 rounded-lg border text-sm text-left transition-colors',
                  selectedReminders.has('BEFORE_INFUSION_24H')
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/30 bg-background hover:bg-primary/5'
                )}
              >
                24hrs reminder before infusion
              </button>
              <button
                type="button"
                onClick={() => toggleReminder('AFTER_TREATMENT_2H')}
                className={cn(
                  'flex-1 min-w-[200px] px-4 py-3 rounded-lg border text-sm text-left transition-colors',
                  selectedReminders.has('AFTER_TREATMENT_2H')
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/30 bg-background hover:bg-primary/5'
                )}
              >
                2hrs post-treatment reminder
              </button>
            </div>

            {/* Row 4: Create */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleCreateAppointment}
                disabled={isSubmitting || !canCreate}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white h-11 px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Appointment'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
