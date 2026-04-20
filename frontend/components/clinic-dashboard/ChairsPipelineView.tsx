'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Fullscreen, CheckCircle2, RefreshCcwIcon, Loader } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import PatientDetailModal from '@/components/PatientDetailModal';

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
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  primaryDiagnosis?: string;
  urgencyLevel?: string;
  status?: string;
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

      // Map patients to chairs (example mapping - you may need to adjust based on your data structure)
      const chairsWithPatients = chairsData.map((chair: Chair) => ({
        ...chair,
        // In a real scenario, you'd have a relationship to fetch patients assigned to this chair
        // For now, we'll show all patients as a demo
        patients: patients.slice(0, Math.floor(Math.random() * 3) + 1),
      }));

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

      {/* Chairs Pipeline */}
      {chairs.length > 0 && (
        <div className="space-y-4">
          {chairs.map((chair) => (
            <div
              key={chair.id}
              onMouseEnter={() => setHoveredChair(chair.id)}
              onMouseLeave={() => setHoveredChair(null)}
              className="border border-border/30 rounded-lg overflow-hidden bg-background/30 hover:bg-background/50 transition-colors"
            >
              {/* Chair Header */}
              <div className="bg-background/50 border-b border-border/30 p-4 cursor-pointer" onClick={() => setExpandedChairs(prev => ({ ...prev, [chair.id]: !prev[chair.id] }))}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {chair.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-1">{chair.specialty}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    chair.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-700'
                      : chair.status === 'INACTIVE'
                      ? 'bg-yellow-500/20 text-yellow-700'
                      : 'bg-gray-500/20 text-gray-700'
                  }`}>
                    {chair.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-foreground/60">Email</p>
                    <p className="text-foreground">{chair.email}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Address</p>
                    <p className="text-foreground">{chair.city}, {chair.state} {chair.zipCode}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Patients Assigned</p>
                    <p className="text-foreground font-semibold">{chair.patients?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Patients List (collapsed by default) */}
              <div
                aria-hidden={!((expandedChairs[chair.id] || hoveredChair === chair.id))}
                className="transition-all duration-300 ease-out overflow-hidden"
                style={{ maxHeight: (expandedChairs[chair.id] || hoveredChair === chair.id) ? '1200px' : '0px', opacity: (expandedChairs[chair.id] || hoveredChair === chair.id) ? 1 : 0 }}
              >
                {chair.patients && chair.patients.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {chair.patients.map(patient => (
                      <div key={patient.id} className="p-4 hover:bg-background/30 transition-colors cursor-pointer relative" onClick={() => setSelectedPatient(patient)}>
                        <Fullscreen className='absolute h-4 w-4 text-accent/80 right-4 top-4'/>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            {patient.primaryDiagnosis && (
                              <p className="text-sm text-foreground/60 mt-1">
                                {patient.primaryDiagnosis}
                              </p>
                            )}

                            <div className={`flex items-center gap-2 my-3 py-2 overflow-x-auto h-10 rounded-lg -pb-10 pl-2 transition-all items-end overflow-y-visible`} style={{scrollbarWidth:'none'}}>
                              {pipelineStages.map((stage, idx) => {
                                const status = getStageStatus(stage.id, patient.pipelineStage);
                                const nextStage = nextStages[patient.id];
                                const stageClass = status === 'completed'
                                  ? 'bg-accent/80 text-white'
                                  : status === 'active'
                                  ? 'bg-primary/80 text-white border-2 border-gray-300'
                                  : (stage.id === nextStage ? 'shadow-md' : 'bg-border/30 text-foreground/40');

                                if (stage.id === 'inactive_archived') return null;

                                return (
                                  <div key={stage.id} className="flex self-end relative">
                                    <div
                                      className="relative"
                                      onMouseEnter={() => setHoveredStage(stage.id)}
                                      onMouseLeave={() => setHoveredStage(null)}
                                    >
                                      <div
                                        className={`${stageClass} rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap flex items-center justify-center transition-colors`}
                                      >
                                        {status === 'completed' && (
                                          <CheckCircle2 className='h-4 mr-2 w-4 text-white'/>
                                        )}
                                        {status === 'active' && stage.id !== 'complete' && (
                                          <div className='h-3 w-3 border-gray-100/30  rounded-full mr-2 border-l-gray-100 border-[2px] flex items-center animate-spin'/>
                                        )}
                                        <span className={`${stage.id === nextStage ? 'text-gray-600' : ''}`}>{stage.label}</span>
                                      </div>
                                    </div>

                                    {hoveredStage === stage.id && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 pointer-events-none" style={{whiteSpace: 'nowrap'}}>
                                        <div className="bg-white text-foreground px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
                                          {stage.detail}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                                        </div>
                                      </div>
                                    )}
                                    {idx < pipelineStages.length - 2 && (
                                      <div className="w-4 h-0.5 bg-border/80 self-center mx-1" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
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
                  <div className="p-4 text-center text-foreground/60 text-sm">
                    No patients assigned to this chair
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
