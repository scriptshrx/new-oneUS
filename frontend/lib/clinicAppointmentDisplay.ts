/**
 * Match clinic dashboard Appointments tab: read calendar date and clock from the ISO string
 * without interpreting the value as an instant in the browser's timezone (see PatientListView).
 */
export function formatScheduledStartTimeFromIso(scheduledStartTime?: string | null): string {
  if (!scheduledStartTime) return '';
  const startParts = scheduledStartTime.split('T')[1]?.split(':') || [];
  const startHours = parseInt(startParts[0] || '0', 10);
  const startMinutes = parseInt(startParts[1] || '0', 10);
  const startAmpm = startHours >= 12 ? 'PM' : 'AM';
  const startDisplay = startHours > 12 ? startHours - 12 : startHours === 0 ? 12 : startHours;
  return `${startDisplay}:${String(startMinutes).padStart(2, '0')} ${startAmpm}`;
}

export function formatAppointmentDateFromIso(scheduledStartTime?: string | null): string {
  if (!scheduledStartTime) return '';
  const dateParts = scheduledStartTime.split('T')[0]?.split('-') || [];
  if (dateParts.length < 3) return '';
  const date = new Date(dateParts.join('-'));
  return date.toLocaleDateString();
}
