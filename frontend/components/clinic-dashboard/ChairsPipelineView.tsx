'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Fullscreen, CheckCircle2, RefreshCcwIcon, Loader } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import PatientDetailModal from '@/components/PatientDetailModal';

interface Chair {
  chairNumber: string
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  primaryDiagnosis?: string;
  urgencyLevel?: string;
  status?: string;
  pipelineStage?: string;
}

interface ChairWithPatients extends Chair {
  patients?: Patient[];
}

export default function ChairsPipelineView() {
  const { clinic, patients } = useClinicDashboardView();
  const [chairs, setChairs] = useState<ChairWithPatients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [nextStages, setNextStages] = useState<Record<string, string>>({});
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [expandedChairs, setExpandedChairs] = useState<Record<string, boolean>>({});
  const [hoveredChair, setHoveredChair] = useState<string | null>(null);

  useEffect(() => {
    fetchChairsWithPatients();
  }, []);

  const fetchChairsWithPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chairs/${clinic.id}/with-patients`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chairs: ${response.statusText}`);
      }

      const data = await response.json();
      const chairsData = data.data || [];

      console.log('Patients:',patients)

      console.log('Chairs befor joining',chairsData)
      // Map patients to chairs (example mapping - you may need to adjust based on your data structure)
      const chairsWithPatients = chairsData.map((chair: Chair) => ({
        ...chair,
        // In a real scenario, you'd have a relationship to fetch patients assigned to this chair
        // For now, we'll show all patients as a demo
        patients: patients.filter((patient)=>patient.infusionChairId===chair.id),
      }));

      console.log("Chairs with patient:",chairsWithPatients)

      setChairs(chairsWithPatients);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chairs';
      setError(errorMessage);
      console.error('Error fetching chairs:', err);
    } finally {
      setLoading(false);
    }
  };

  const pipelineStages = [
    { id: 'new_referral', detail: 'New Referral', label: 'New Referral' },
    { id: 'insurance', detail: 'Insurance Verification', label: 'Insurance' },
    { id: 'authorization', detail: 'Prior Authorization', label: 'Authorization' },
    { id: 'scheduling', detail: 'Scheduling Treatment', label: 'Scheduling' },
    { id: 'treatment', detail: 'Treatment In Process', label: 'Treatment' },
    { id: 'complete', detail: 'Treatment Is Completed', label: 'Completed' },
    { id: 'follow_up', detail: 'Treatment Follow-ups', label: 'Follow-up' },
    { id: 'inactive_archived', label: 'Patient Archived', detail: 'INACTIVE_ARCHIVED' }
  ];

  function getStageStatus(stageId: string, currentPipelineStage: string) {
    const order = pipelineStages.map(s => s.id);
    const currentIdx = order.indexOf((currentPipelineStage || '').toLowerCase());
    const stageIdx = order.indexOf(stageId);
    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  }

  useEffect(() => {
    if (patients && patients.length > 0) {
      const stages: Record<string, string> = {};
      patients.forEach((patient) => {
        const currentStage = patient.pipelineStage;
        if (currentStage === 'NEW_REFERRAL') stages[patient.id] = 'insurance';
        else if (currentStage === 'INSURANCE') stages[patient.id] = 'authorization';
        else if (currentStage === 'AUTHORIZATION') stages[patient.id] = 'scheduling';
        else if (currentStage === 'SCHEDULING') stages[patient.id] = 'treatment';
        else if (currentStage === 'TREATMENT') stages[patient.id] = 'complete';
        else if (currentStage === 'COMPLETE') stages[patient.id] = 'follow_up';
        else if (currentStage === 'FOLLOW_UP') stages[patient.id] = 'inactive_archived';
      });
      setNextStages(stages);
    }
  }, [patients]);

  const handleUpdateStatus = async (patientId: string, nextStage: string) => {
    try {
      const referralId = selectedPatient?._referral?.id;
      if (!referralId) throw new Error('Referral id not found');
      const response = await fetchWithAuth(`https://scriptishrxnewmark.onrender.com/v1/referrals/${referralId}/status`, {
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

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-700';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-700';
      default:
        return 'bg-blue-500/20 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-foreground/70">Loading chairs pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chairs Pipeline</h1>
        <p className="text-foreground/60 mt-1">View infusion chairs and their assigned patients</p>
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
          <p className="text-foreground/60 mb-2">No infusion chairs found</p>
          <p className="text-sm text-foreground/50">
            Create chairs to start managing your patient pipeline
          </p>
        </div>
      )}

      {/* Chairs Grid (2-column, compact cards) - show patient pipeline stage on card */}
      {chairs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chairs.map((chair) => {
            const firstPatient = chair.patients?.[0];
            const patientStageRaw = firstPatient?.pipelineStage?.toUpperCase().replace('_',' ') || '';
            const patientStage = patientStageRaw ? patientStageRaw : '';
            const isInfusing = patientStage === 'treatment' || chair.status === 'IN_USE';
            const subtitle = firstPatient ? `${firstPatient.firstName} ${firstPatient.lastName}` : 'No Patient';

            const cardBase = ` bg-purple-400/10 shadow-sm hover:shadow-lg rounded-lg p-4 hover:shadow-lg shadow-sm transition-colors relative overflow-hidden border`;
            const cardStyle = isInfusing
              ? `${cardBase} col-span-2 bg-gradient-to-br from-purple-700/80 to-purple-600/70 border-transparent text-white shadow-lg h-36`
              : `${cardBase} bg-background/40 border-border/30 hover:border-border/50 h-28`;

            return (
              <div key={chair.id} className={`${cardStyle} items-center justify-center`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground/60 mb-2 text-center">{chair.chairNumber}</div>
                    <div className="text-base font-semibold text-center">
                      {patientStage || 'No Patient'}
                    </div>
                    <div className={`text-sm mt-1 text-center ${isInfusing ? 'text-purple-100/90' : 'text-foreground/60'}`}>
                      {subtitle}
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const firstPatient = chair.patients?.[0];
                        if (firstPatient) {
                          setSelectedPatient(firstPatient);
                        }
                      }}
                      className="p-2 text-foreground/60 absolute bottom-1 right-1 hover:bg-background/80 rounded-lg transition-colors"
                      title="View patient details"
                    >
                      <Fullscreen className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Expanded patients area (keeps original behavior) */}
                  {expandedChairs[chair.id] && (
                    <div className="col-span-2 mt-3">
                      {chair.patients && chair.patients.length > 0 ? (
                        <div className="divide-y divide-border/30 rounded-md overflow-hidden">
                          {chair.patients.map(patient => (
                            <div key={patient.id} className="p-3 bg-background/20">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium text-foreground">{patient.firstName} {patient.lastName}</div>
                                  {patient.primaryDiagnosis && <div className="text-sm text-foreground/60">{patient.primaryDiagnosis}</div>}
                                </div>
                                <div className="text-right">
                                  {patient.urgencyLevel && (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(patient.urgencyLevel)}`}>
                                      {patient.urgencyLevel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-foreground/60 text-sm">No patients assigned to this chair</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
          clinicId={clinic?.id}
        />
      )}
    </div>
  );
}
