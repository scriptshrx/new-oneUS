'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import PatientDetailModal from '@/components/PatientDetailModal';
import ChairCard from './ChairCard';
import { EnrichedChair } from '@/lib/chairDisplay';

const API_URL = 'https://scriptishrxnewmark.onrender.com/v1';

export default function ChairsPipelineView() {
  const { clinic, patients } = useClinicDashboardView();
  const [chairs, setChairs] = useState<EnrichedChair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    fetchChairsWithPatients();
  }, [clinic?.id]);

  const fetchChairsWithPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const response = await fetchWithAuth(`${API_URL}/chairs/${clinic.id}/with-patients`, {
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

  const handleUpdateStatus = async (patientId: string, nextStage: string) => {
    try {
      const referralId = selectedPatient?._referral?.id;
      if (!referralId) throw new Error('Referral id not found');
      const response = await fetchWithAuth(`${API_URL}/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStage }),
      });
      if (!response.ok) throw new Error(`Failed to update status: ${response.statusText}`);
      window.location.reload();
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  };

  const openPatientModal = (chair: EnrichedChair) => {
    const patientId = chair.patient?.id;
    if (!patientId) return;
    const fullPatient = patients.find((p) => p.id === patientId);
    setSelectedPatient(fullPatient || chair.patient);
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center h-full">
        <p className="text-center text-foreground/70">
          <span className="block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          Loading chairs pipeline...
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Chairs Pipeline</h1>
        <p className="text-foreground/60 mt-1">View infusion chairs with staff, treatment, and appointments</p>
      </header>

      {error && (
        <section className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </section>
      )}

      {chairs.length === 0 && !error && (
        <section className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-2">No infusion chairs found</p>
          <p className="text-sm text-foreground/50">Create chairs to start managing your patient pipeline</p>
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
                isInfusing={isInfusing}
                onViewPatient={() => openPatientModal(chair)}
              />
            );
          })}
        </section>
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
          clinicId={clinic?.id}
        />
      )}
    </section>
  );
}
