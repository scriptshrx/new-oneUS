import { formatAppointmentDateFromIso, formatScheduledStartTimeFromIso } from '@/lib/clinicAppointmentDisplay';

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

export function matchesSchedulingSearch(
  query: string,
  ...fields: Array<string | null | undefined>
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields
    .filter((f): f is string => Boolean(f?.trim()))
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export function chairMatchesSchedulingSearch(chair: EnrichedChair, query: string): boolean {
  return matchesSchedulingSearch(
    query,
    chair.chairNumber,
    staffDisplayName(chair.user, chair.staffName),
    chair.patient ? patientDisplayName(chair.patient) : '',
  );
}

export function formatChairAppointment(appointment?: ChairAppointment | null): string | null {
  if (!appointment?.scheduledStartTime) return null;
  try {
    const dateLabel = formatAppointmentDateFromIso(appointment.scheduledStartTime);
    const timeLabel = formatScheduledStartTimeFromIso(appointment.scheduledStartTime);
    const type = appointment.appointmentType?.replace(/_/g, ' ') || appointment.treatmentType || 'Appointment';
    if (!dateLabel || !timeLabel) return `${type} · Scheduled`;
    return `${type} · ${dateLabel} at ${timeLabel}`;
  } catch {
    return 'Scheduled appointment';
  }
}
