'use client';

import { Fullscreen, Trash2 } from 'lucide-react';
import {
  EnrichedChair,
  formatChairAppointment,
  patientDisplayName,
  staffDisplayName,
} from '@/lib/chairDisplay';

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
  const patientName = patientDisplayName(patient);

  return (
    <article className="relative flex min-h-[10.5rem] flex-col rounded-lg border border-border/30 bg-purple-400/10 p-4 shadow-sm transition-colors hover:border-border/50 hover:shadow-md">
      {isInfusing && (
        <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          In treatment
        </span>
      )}

      <header className="mb-3 border-b border-border/20 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/50">Chair</p>
        <p className="text-lg font-bold text-foreground">{chair.chairNumber}</p>
      </header>

      <section className="flex flex-1 flex-col gap-1.5 text-sm text-foreground">
        <p>
          <span className="text-foreground/60">Patient: </span>
          <span className="font-medium">{patientName}</span>
        </p>
        <p>
          <span className="text-foreground/60">Nurse: </span>
          <span className="font-medium">{staff}</span>
        </p>
        <p>
          <span className="text-foreground/60">Medication: </span>
          <span className="font-medium">{treatment}</span>
        </p>
        <p>
          <span className="text-foreground/60">Scheduled Time: </span>
          <span className="font-medium">{appointmentLabel ?? 'None scheduled'}</span>
        </p>
      </section>

      <footer className="mt-3 flex justify-end gap-1 border-t border-border/20 pt-2">
        {onViewPatient && patient && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewPatient();
            }}
            className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-background/80"
            title="View patient details"
          >
            <Fullscreen className="h-5 w-5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={deleting}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            title="Delete chair"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </footer>
    </article>
  );
}
