'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';

interface Chair {
  id: string;
  name: string;
  email: string;
  specialty: string;
  operatingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  createdAt: string;
  patientPipelineStage:string;
  // optional display fields that may come from the API
  patientName?: string;
}

export default function AllChairsView() {
  const { clinic } = useClinicDashboardView();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchChairs();
  }, []);

  const fetchChairs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chairs/${clinic.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chairs: ${response.statusText}`);
      }

      const data = await response.json();
      const chairsData: Chair[] = data.data || [];

      // Fetch patient (if any) for each chair in parallel and attach a display name
      const chairsWithPatients = await Promise.all(
        chairsData.map(async (chair) => {
          try {
            const resp = await fetchWithAuth(`${apiUrl}/patients/by-chair/${chair.id}`, { method: 'GET' });
            if (resp.ok) {
              const patients = await resp.json();
              const first = Array.isArray(patients) ? patients[0] : patients?.[0];
              if (first) {
                chair.patientName = `${first.firstName || ''} ${first.lastName || ''}`.trim();
                chair.patientPipelineStage = first.pipelineStage;
              }

              console.log('Chair is now updated to reflect patient pipeline:',chair)
            }
          } catch (e) {
            console.warn('Failed to fetch patients for chair', chair.id, e);
          }
          return chair;
        })
      );

      setChairs(chairsWithPatients);
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
      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chair/${chairId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chair');
      }

      // Remove from local state
      setChairs(chairs.filter(c => c.id !== chairId));
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-foreground/70">Loading chairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Infusion Chairs</h1>
          <p className="text-foreground/60 mt-1">Manage your infusion chair officers</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {chairs.length === 0 && !error && (
        <div className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-4">No infusion chairs added yet</p>
          <p className="text-sm text-foreground/50 mb-6">
            Go to "Add Infusion Chairs" to create your first chair
          </p>
        </div>
      )}

      {/* Chairs Grid (2-column, compact cards; INFUSING cards span full width) */}
      {chairs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chairs.map((chair, idx) => {
            const isInfusing = chair.patientPipelineStage === 'treatment' || chair.status === 'IN_USE';
            const displayStatus = isInfusing ? 'Infusing' : chair.status === 'ACTIVE' ? 'Available' : 'Unavailable';
            const subtitle = isInfusing ? (chair.patientName || 'In progress') : 'No appt today';

            // Small compact card vs large highlighted card for infusing
            const cardBase = `rounded-lg p-4 hover:shadow-lg shadow-sm transition-colors relative bg-purple-400/10 overflow-hidden border`;
            const cardStyle = isInfusing
              ? `${cardBase} col-span-2 bg-gradient-to-br from-purple-700/80 to-purple-600/70 border-transparent text-white shadow-lg h-36`
              : `${cardBase} bg-background/40 border-border/30 hover:border-border/50 h-28`;

            return (
              <div key={chair.id} className={`${cardStyle}  flex items-center justify-center`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground/60 mb-2 text-center">{chair.name}</div>
                    <div className="text-base font-semibold text-center {isInfusing ? 'text-white' : 'text-foreground'}">
                      
                      {displayStatus}

                    </div>
               
                    <div className={`text-center text-sm mt-1 ${isInfusing ? 'text-purple-100/90' : 'text-foreground/60'}`}>
                      {subtitle}
                    </div>
                  </div>

                  {!isInfusing && (
                    <div className="flex justify-end items-center absolute  bottom-1 right-1 gap-2">
                      <button
                        onClick={() => handleDeleteChair(chair.id)}
                        disabled={deleting === chair.id}
                        className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete chair"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating chat / help button (visual only) */}
      {/* <button
        aria-label="Chat support"
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button> */}
    </div>
  );
}
