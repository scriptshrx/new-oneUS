'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import ChairCard from './ChairCard';
import { EnrichedChair } from '@/lib/chairDisplay';

const API_URL = 'https://scriptishrxnewmark.onrender.com/v1';

export default function AllChairsView() {
  const { clinic, role } = useClinicDashboardView();
  const [chairs, setChairs] = useState<EnrichedChair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  

  useEffect(() => {
    fetchChairs();
  }, [clinic?.id]);

  const fetchChairs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const response = await fetchWithAuth(`${API_URL}/chairs/${clinic.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chairs: ${response.statusText}`);
      }

      const data = await response.json();
      setChairs(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chairs';
      setError(errorMessage);
      console.error('Error fetching chairs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChair = async (chairId: string) => {
    if (!window.confirm('Are you sure you want to delete this infusion chair?')) {
      return;
    }

    try {
      setDeleting(chairId);
      const response = await fetchWithAuth(`${API_URL}/chair/${chairId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chair');
      }

      setChairs(chairs.filter((c) => c.id !== chairId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chair';
      setError(errorMessage);
      console.error('Error deleting chair:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center h-full">
        <p className="text-center text-foreground/70">
          <span className="block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          Loading chairs...
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Infusion Chairs</h1>
        <p className="text-foreground/60 mt-1">Chair number, staff, treatment, and appointments</p>
      </header>

      {error && (
        <section className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </section>
      )}

      {chairs.length === 0 && !error && (
        <section className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-4">No infusion chairs added yet</p>
          <p className="text-sm text-foreground/50">Go to &quot;Add Infusion Chairs&quot; to create your first chair</p>
        </section>
      )}

      {chairs.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chairs.map((chair) => {
            const stage = (chair.patient?.pipelineStage || '').toUpperCase();
            const isInfusing = stage === 'TREATMENT' || stage === 'IN_TREATMENT' || chair.status === 'IN_USE';

            return (
              <ChairCard
                key={chair.id}
                chair={chair}
                role={role}
                isInfusing={isInfusing}
                onDelete={() => handleDeleteChair(chair.id)}
                deleting={deleting === chair.id}
              />
            );
          })}
        </section>
      )}
    </section>
  );
}
