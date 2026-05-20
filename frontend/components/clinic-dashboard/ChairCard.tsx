'use client';

import { Fullscreen, Trash2 } from 'lucide-react';
import { EnrichedChair, formatChairAppointment, staffDisplayName } from '@/lib/chairDisplay';

interface ChairCardProps {
  chair: EnrichedChair;
  isInfusing?: boolean;
  onViewPatient?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

export default function ChairCard({
  chair,
  isInfusing = false,
  onViewPatient,
  onDelete,
  deleting = false,
}: ChairCardProps) {
  const patient = chair.patient;
  const appointmentLabel = formatChairAppointment(patient?.appointment);
  const treatment = patient?.prescribedTreatment?.trim() || 'Not specified';
  const staff = staffDisplayName(chair.user, chair.staffName);

  const cardBase =
    'rounded-lg p-4 shadow-sm transition-colors relative overflow-hidden border flex items-center justify-center';
  const cardStyle = isInfusing
    ? `${cardBase} col-span-2 bg-gradient-to-br from-purple-700/80 to-purple-600/70 border-transparent text-white shadow-lg min-h-40`
    : `${cardBase} bg-background/40 border-border/30 hover:border-border/50 hover:shadow-lg min-h-36`;

  const mutedClass = isInfusing ? 'text-purple-100/80' : 'text-foreground/60';
  const textClass = isInfusing ? 'text-white' : 'text-foreground';

  return (
    <article className={cardStyle}>
      <section className="flex flex-col h-full w-full justify-between gap-2">
        <section className="space-y-1.5 text-center">
          <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Chair</p>
          <p className={`text-lg font-bold ${textClass}`}>{chair.chairNumber}</p>

          <section className={`text-left text-sm space-y-1 mt-2 ${textClass}`}>
            <p>
              <span className={mutedClass}>Staff: </span>
              {staff}
            </p>
            <p>
              <span className={mutedClass}>Treatment: </span>
              {treatment}
            </p>
            <p>
              <span className={mutedClass}>Appointment: </span>
              {appointmentLabel ?? 'None scheduled'}
            </p>
          </section>
        </section>

        <section className="flex justify-end items-center gap-2 absolute bottom-2 right-2">
          {onViewPatient && patient && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewPatient();
              }}
              className={`p-2 rounded-lg transition-colors ${
                isInfusing ? 'text-white/80 hover:bg-white/10' : 'text-foreground/60 hover:bg-background/80'
              }`}
              title="View patient details"
            >
              <Fullscreen className="w-5 h-5" />
            </button>
          )}
          {onDelete && !isInfusing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={deleting}
              className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              title="Delete chair"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </section>
      </section>
    </article>
  );
}
