'use client';

import { useState, useEffect } from 'react';
import { X, Loader, AlertCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { format, addDays, startOfToday } from 'date-fns';
import { ReminderType } from '@/components/clinic-dashboard/ReminderButtons';

interface Chair {
  id: string;
  chairNumber: string;
  status: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  display: string;
  clinicLocalTime?: string;
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

interface ChairSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  clinicId: string;
  patientId: string;
  treatmentType?: string;
  appointment?: Appointment | null;
  onChairSelected: (chairId: string) => Promise<void>;
  onAppointmentCreated?: (appointmentId: string) => Promise<void>;
  onAppointmentRescheduled?: (appointmentId: string) => Promise<void>;
}

export default function ChairSelectionModal({
  isOpen,
  onClose,
  clinicId,
  clinicName,
  patientId,
  treatmentType = 'IV_THERAPY',
  appointment = null,
  onChairSelected,
  onAppointmentCreated,
  onAppointmentRescheduled,
}: ChairSelectionModalProps) {
  const [step, setStep] = useState<'chair' | 'date' | 'time' | 'confirm'>('chair');
  const [mode, setMode] = useState<'create' | 'reschedule'>('create');
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<Set<ReminderType>>(new Set());

  useEffect(() => {
    if (isOpen) {
      // Determine mode based on whether appointment exists
      const appointmentMode = appointment ? 'reschedule' : 'create';
      setMode(appointmentMode);
      setStep('chair');
      
      // Reset state
      setSelectedDate(undefined);
      setSelectedTime(null);
      setSelectedTimeDisplay(null);
      setSelectedReminders(new Set());
      setError(null);
      
      // Pre-fill chair if rescheduling
      if (appointment && appointment.assignedChair) {
        setSelectedChairId(appointment.assignedChair);
      } else {
        setSelectedChairId(null);
      }
      
      fetchChairs();
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (selectedDate && step === 'time') {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, step]);

  const fetchChairs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/chairs/${clinicId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chairs');
      }

      const data = await response.json();
      setChairs(data.data || []);
    } catch (err) {
      console.error('Error fetching chairs:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch chairs'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      setSlotsLoading(true);
      setError(null);
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/appointments/availability/${clinicId}/${dateStr}?durationMinutes=60`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }

      const data = await response.json();
      setAvailableSlots(data.data || []);
      setSelectedTime(null);
      setSelectedTimeDisplay(null);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch available time slots'
      );
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectChair = () => {
    if (!selectedChairId) return;
    setStep('date');
  };

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep('time');
    }
  };

  const handleSelectTime = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot.startTime); // UTC time for API
    const displayTime = timeSlot.clinicLocalTime || timeSlot.startTime;
    setSelectedTimeDisplay(displayTime);
    setSelectedReminders(new Set());
    setStep('confirm');
  };

  const toggleReminder = (type: ReminderType) => {
    setSelectedReminders((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const scheduleRemindersForAppointment = async (appointmentId: string) => {
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

  const handleRescheduleAppointment = async () => {
    if (!appointment || !selectedChairId || !selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Update existing appointment
      const updateResponse = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/appointments/${appointment.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            scheduledDate: selectedDate.toISOString(),
            scheduledStartTime: selectedTimeDisplay,  // ← Send clinic's local time, not UTC
            scheduledEndTime: (() => {
              // Add 1 hour to clinic local time string without timezone conversion
              const [datePart, timePart] = selectedTimeDisplay.split('T');
              const [hours, minutes, seconds = '00'] = timePart.split(':');
              const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
              return `${datePart}T${newHours}:${minutes}:${seconds}`;
            })(),
            assignedChair: selectedChairId,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to reschedule appointment');
      }

      // Update chair if changed
      if (selectedChairId !== appointment.assignedChair) {
        await onChairSelected(selectedChairId);
      }

      // Trigger callback
      await scheduleRemindersForAppointment(appointment.id);

      if (onAppointmentRescheduled) {
        await onAppointmentRescheduled(appointment.id);
      }

      // Reset and close
      setSelectedChairId(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setSelectedTimeDisplay(null);
      setIsSubmitting(false)
      setStep('chair');
      onClose();
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule appointment';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedChairId || !selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Create appointment
      const appointmentResponse = await fetchWithAuth(
        'https://scriptishrxnewmark.onrender.com/v1/appointments',
        {
          method: 'POST',
          body: JSON.stringify({
            patientId,
            clinicId,
            chairId: selectedChairId,
            appointmentType: 'IN_CLINIC',
            scheduledDate: selectedDate.toISOString(),
            scheduledStartTime: selectedTimeDisplay,  // ← Send clinic's local time, not UTC
            scheduledEndTime: (() => {
              // Add 1 hour to clinic local time string without timezone conversion
              const [datePart, timePart] = selectedTimeDisplay.split('T');
              const [hours, minutes, seconds = '00'] = timePart.split(':');
              const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
              return `${datePart}T${newHours}:${minutes}:${seconds}`;
            })(),
            treatmentType,
          }),
        }
      );

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const appointmentData = await appointmentResponse.json();
      const newAppointmentId = appointmentData.data.id;

      await scheduleRemindersForAppointment(newAppointmentId);

      await onChairSelected(selectedChairId);

      if (onAppointmentCreated) {
        await onAppointmentCreated(newAppointmentId);
      }

      // Reset and close
      setSelectedChairId(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setSelectedTimeDisplay(null);
      setIsSubmitting(false)
      setStep('chair');
      onClose();
    } catch (err) {
      console.error('Error creating appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'date') {
      setStep('chair');
      setSelectedDate(undefined);
    } else if (step === 'time') {
      setStep('date');
      setSelectedTime(null);
      setSelectedTimeDisplay(null);
    } else if (step === 'confirm') {
      setStep('time');
    }
  };

  const getBackButtonLabel = () => {
    switch (step) {
      case 'date':
        return 'Back to Chairs';
      case 'time':
        return 'Back to Date';
      case 'confirm':
        return 'Back to Time';
      default:
        return 'Back';
    }
  };

  const getModalTitle = () => {
    if (mode === 'reschedule') {
      if (step === 'chair') return 'Change Infusion Chair';
      if (step === 'date') return 'Reschedule Appointment Date';
      if (step === 'time') return 'Reschedule Appointment Time';
      return 'Confirm Rescheduled Appointment';
    }
    
    if (step === 'chair') return 'Select Infusion Chair';
    if (step === 'date') return 'Select Appointment Date';
    if (step === 'time') return 'Select Appointment Time';
    return 'Confirm Appointment';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/30 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/30 bg-background z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{getModalTitle()}</h2>
            {mode === 'reschedule' && (
              <p className="text-xs text-foreground/60 mt-1">Update existing appointment details</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Step: Chair Selection */}
          {step === 'chair' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-foreground/70">Loading infusion chairs...</p>
                  </div>
                </div>
              ) : chairs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                  <p className="text-foreground/70">No infusion chairs available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chairs.map((chair) => (
                    <label
                      key={chair.id}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedChairId === chair.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/30 hover:bg-primary/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="chair"
                        value={chair.id}
                        checked={selectedChairId === chair.id}
                        onChange={(e) => setSelectedChairId(e.target.value)}
                        className="mt-1 mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{chair.chairNumber}</div>
                        <div className="text-sm text-foreground/70 mt-1">
                          <p>{clinicName}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                          chair.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {chair.status}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step: Date Selection */}
          {step === 'date' && selectedChairId && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-sm text-foreground/70">
                <p className="font-semibold text-foreground mb-2">Selected Chair:</p>
                <p>{chairs.find(c => c.id === selectedChairId)?.chairNumber}</p>
              </div>
              <div className="w-full flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  disabled={(date) => {
                    const today = startOfToday();
                    const maxDate = addDays(today, 90);
                    return date < today || date > maxDate;
                  }}
                  className="rounded-lg border border-border/30"
                />
              </div>
              <p className="text-xs text-foreground/50 text-center">
                Select a date within the next 90 days
              </p>
            </div>
          )}

          {/* Step: Time Selection */}
          {step === 'time' && selectedDate && (
            <div className="flex flex-col gap-6">
              <div className="text-sm text-foreground/70">
                <p className="font-semibold text-foreground mb-2">Selected Chair:</p>
                <p className="mb-3">{chairs.find(c => c.id === selectedChairId)?.chairNumber}</p>
                <p className="font-semibold text-foreground mb-2">Selected Date:</p>
                <p className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-primary mr-2" />
                  <p className="text-foreground/70">Loading available time slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                  <p className="text-foreground/70">No available time slots for this date</p>
                  <p className="text-xs text-foreground/50 mt-2">Please select a different date</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Available Time Slots:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTime(slot)}
                        className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
                          selectedTime === slot.startTime
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/30 text-foreground hover:bg-primary/5'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Confirmation */}
          {step === 'confirm' && selectedChairId && selectedDate && selectedTime && (
            <div className="space-y-6">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Infusion Chair</p>
                  <p className="text-foreground font-semibold">
                    {chairs.find(c => c.id === selectedChairId)?.chairNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Appointment Date</p>
                  <p className="text-foreground font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Appointment Time</p>
                  <p className="text-foreground font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedTimeDisplay
                      ? (() => {
                          // Parse the clinic local time string directly without timezone conversion
                          const parts = selectedTimeDisplay.split('T')[1]?.split(':') || [];
                          const hours = parseInt(parts[0] || '0');
                          const minutes = parseInt(parts[1] || '0');
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                          return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
                        })()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary/80 uppercase mb-1">Clinic</p>
                  <p className="text-foreground font-semibold">{clinicName}</p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Schedule SMS Reminders</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReminder('BEFORE_INFUSION_72H')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                      selectedReminders.has('BEFORE_INFUSION_72H')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/30 hover:bg-primary/5'
                    }`}
                  >
                    72hrs reminder before infusion start time
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleReminder('BEFORE_INFUSION_24H')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                      selectedReminders.has('BEFORE_INFUSION_24H')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/30 hover:bg-primary/5'
                    }`}
                  >
                    24hrs reminder before infusion start time
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleReminder('AFTER_TREATMENT_2H')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                      selectedReminders.has('AFTER_TREATMENT_2H')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/30 hover:bg-primary/5'
                    }`}
                  >
                    2hrs reminder after treatment stop time
                  </button>
                </div>
                {selectedReminders.size > 0 && (
                  <p className="text-xs text-foreground/60 mt-2">
                    {selectedReminders.size} reminder{selectedReminders.size > 1 ? 's' : ''} will be scheduled when you confirm.
                  </p>
                )}
              </div>

              <p className="text-sm text-foreground/70">
                {mode === 'reschedule'
                  ? <span>Click <span className="font-semibold">Reschedule Appointment</span> to update your appointment.</span>
                  : <span>Click <span className="font-semibold">Create Appointment</span> to create your appointment.</span>}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-between gap-3 p-6 border-t border-border/30 bg-background">
          <Button
            variant="outline"
            onClick={step === 'chair' ? onClose : handleBack}
            className="border-border/30 text-foreground hover:bg-primary/10"
          >
            {step === 'chair' ? 'Cancel' : getBackButtonLabel()}
          </Button>

          {step === 'chair' && (
            <Button
              onClick={handleSelectChair}
              disabled={!selectedChairId || loading}
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Date
            </Button>
          )}

          {step === 'date' && (
            <Button
              onClick={() => selectedDate && setStep('time')}
              disabled={!selectedDate}
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Time
            </Button>
          )}

          {step === 'time' && (
            <Button
              onClick={() => selectedTime && setStep('confirm')}
              disabled={!selectedTime}
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Selection
            </Button>
          )}

          {step === 'confirm' && (
            <Button
              onClick={mode === 'reschedule' ? handleRescheduleAppointment : handleCreateAppointment}
              disabled={isSubmitting}
              className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (mode === 'reschedule' ? 'Rescheduling...' : 'Creating...') : (mode === 'reschedule' ? 'Reschedule Appointment' : 'Create Appointment')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
