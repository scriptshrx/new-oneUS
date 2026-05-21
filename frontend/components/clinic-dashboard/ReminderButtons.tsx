'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader, Check } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export type ReminderType = 'BEFORE_INFUSION_72H' | 'BEFORE_INFUSION_24H' | 'AFTER_TREATMENT_2H';

const REMINDER_OPTIONS: { type: ReminderType; label: string; shortLabel: string }[] = [
  { type: 'BEFORE_INFUSION_72H', label: '72hrs before infusion start', shortLabel: '72h before' },
  { type: 'BEFORE_INFUSION_24H', label: '24hrs before infusion start', shortLabel: '24h before' },
  { type: 'AFTER_TREATMENT_2H', label: '2hrs after treatment stop', shortLabel: '2h after' },
];

interface ReminderButtonsProps {
  patientId: string;
  appointmentId: string;
  compact?: boolean;
  onScheduled?: () => void;
}

export default function ReminderButtons({
  patientId,
  appointmentId,
  compact = false,
  onScheduled,
}: ReminderButtonsProps) {
  const [selected, setSelected] = useState<Set<ReminderType>>(new Set());
  const [scheduled, setScheduled] = useState<Set<ReminderType>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const response = await fetchWithAuth(
          `https://scriptishrxnewmark.onrender.com/v1/reminders/appointment/${appointmentId}`
        );
        if (response.ok) {
          const data = await response.json();
          const existing = (data.data || [])
            .filter((r: { status: string }) => r.status !== 'CANCELLED')
            .map((r: { type: ReminderType }) => r.type);
          setScheduled(new Set(existing));
        }
      } catch {
        // Non-blocking if reminders endpoint unavailable
      } finally {
        setFetching(false);
      }
    };
    loadExisting();
  }, [appointmentId]);

  const toggle = (type: ReminderType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const scheduleReminders = async () => {
    if (selected.size === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        'https://scriptishrxnewmark.onrender.com/v1/reminders',
        {
          method: 'POST',
          body: JSON.stringify({
            patientId,
            appointmentId,
            types: Array.from(selected),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to schedule reminders');
      }

      setScheduled((prev) => new Set([...prev, ...selected]));
      setSelected(new Set());
      onScheduled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule reminders');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <span className="text-xs text-foreground/50">Loading reminders...</span>;
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <p className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
        SMS Reminders
      </p>
      <div className={`flex ${compact ? 'flex-col gap-1.5' : 'flex-col sm:flex-row gap-2'}`}>
        {REMINDER_OPTIONS.map(({ type, label, shortLabel }) => {
          const isScheduled = scheduled.has(type);
          const isSelected = selected.has(type);

          return (
            <button
              key={type}
              type="button"
              onClick={() => !isScheduled && toggle(type)}
              disabled={isScheduled || loading}
              title={label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                isScheduled
                  ? 'border-green-300 bg-green-50 text-green-800 cursor-default'
                  : isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/30 text-foreground/80 hover:bg-primary/5'
              } ${compact ? 'text-xs' : 'text-sm'}`}
            >
              {isScheduled ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <Bell className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{compact ? shortLabel : label}</span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <button
          type="button"
          onClick={scheduleReminders}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            `Schedule ${selected.size} reminder${selected.size > 1 ? 's' : ''}`
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export { REMINDER_OPTIONS };
