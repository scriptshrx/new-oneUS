import { format } from 'date-fns';

export interface ChairStaffUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role?: string;
}

export interface ChairAppointment {
  id: string;
  appointmentType: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  status: string;
  treatmentType?: string;
}

export interface ChairPatient {
  id: string;
  firstName: string;
  lastName: string;
  pipelineStage?: string;
  prescribedTreatment?: string | null;
  primaryDiagnosis?: string | null;
  user?: ChairStaffUser | null;
  appointment?: ChairAppointment | null;
}

export interface EnrichedChair {
  id: string;
  chairNumber: string;
  status?: string;
  staffName?: string | null;
  user?: ChairStaffUser | null;
  patient?: ChairPatient | null;
}

export function staffDisplayName(user?: ChairStaffUser | null, staffName?: string | null): string {
  if (staffName?.trim()) return staffName.trim();
  if (!user) return 'Unassigned';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email || 'Unassigned';
}

export function patientDisplayName(patient?: ChairPatient | null): string {
  if (!patient) return 'No patient';
  const portalName = [patient.user?.firstName, patient.user?.lastName].filter(Boolean).join(' ');
  if (portalName) return portalName;
  return `${patient.firstName} ${patient.lastName}`.trim();
}

export function formatChairAppointment(appointment?: ChairAppointment | null): string | null {
  if (!appointment) return null;
  try {
    const start = new Date(appointment.scheduledStartTime);
    const dateLabel = format(start, 'MMM d, yyyy');
    const timeLabel = format(start, 'h:mm a');
    const type = appointment.appointmentType?.replace(/_/g, ' ') || appointment.treatmentType || 'Appointment';
    return `${type} · ${dateLabel} at ${timeLabel}`;
  } catch {
    return 'Scheduled appointment';
  }
}
