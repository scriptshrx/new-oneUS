'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Fullscreen, CheckCircle2, Loader, RefreshCcwIcon } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useChairDashboardView } from '../ChairDashboardLayout';
import PatientDetailModal from '@/components/PatientDetailModal';

interface Chair {
  id: string;
  name: string;
  email?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  primaryDiagnosis?: string;
  prescribedTreatment?: string;
  urgencyLevel?: string;
  referringPhysician?: string;
  status?: string;
  pipelineStage?: string;
  [key: string]: any;
}

interface ChairWithPatients extends Patient {
  patients?: Patient[];
}

export default function PatientsView() {
  const { chair, patients, patientsLoading, patientsError } = useChairDashboardView();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [nextStages, setNextStages] = useState<Record<string, string>>({});
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

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
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    }
  };

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-foreground/70">Loading patient pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Pipelines</h1>
        <p className="text-foreground/60 mt-1">View your assigned patients and their treatment stages</p>
      </div>

      {patientsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{patientsError}</p>
        </div>
      )}

      {patients.length === 0 && !patientsError && (
        <div className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-2">No patients found</p>
          <p className="text-sm text-foreground/50">Assigned patients will appear here</p>
        </div>
      )}

      {patients.length > 0 && (
        <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-background/60 border border-border/20 rounded-lg p-4 cursor-pointer hover:bg-background/80 relative transition-colors"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-primary/95 font-semibold text-lg">{patient.firstName} {patient.lastName}</p>
                        <p className="text-foreground/75 text-sm font-bold mt-1">{patient.prescribedTreatment || 'N/A'}</p>
                        <p className="text-foreground/60 text-sm mt-1">
                          Referring Physician: <span className="font-semibold text-primary/70">{patient.referringPhysician || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getUrgencyColor(
                            patient.urgencyLevel
                          )}`}
                        >
                          {patient.urgencyLevel || 'N/A'}
                        </span>
                        <Fullscreen className="h-4 w-4 text-accent/80" />
                      </div>
                    </div>

                    {/* Pipeline Stages */}
                    <div
                      className="flex items-center gap-1 py-2 overflow-x-auto rounded-lg pl-2 overflow-y-visible"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {pipelineStages.map((stage, idx) => {
                        const status = getStageStatus(stage.id, patient.pipelineStage);
                        const nextStage = nextStages[patient.id];

                        return (
                          stage.id !== 'inactive_archived' && (
                            <div key={stage.id} className="flex items-center gap-1">
                              <div
                                className="relative"
                                onMouseEnter={() => setHoveredStage(`${patient.id}-${stage.id}`)}
                                onMouseLeave={() => setHoveredStage(null)}
                              >
                                <div
                                  className={`${
                                    status === 'completed'
                                      ? 'bg-accent/80 text-white'
                                      : status === 'active'
                                      ? 'bg-primary/80 text-white border-2 border-gray-300'
                                      : stage.id === nextStage
                                      ? 'shadow-md bg-border/50 text-foreground'
                                      : 'bg-border/30 text-foreground/40'
                                  } rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap flex items-center justify-center transition-colors`}
                                >
                                  {status === 'completed' && <CheckCircle2 className="h-4 mr-2 w-4 text-white" />}
                                  {status === 'active' && stage.id !== 'complete' && (
                                    <div className="h-3 w-3 border-gray-100/30 rounded-full mr-2 border-l-gray-100 border-[2px] flex items-center animate-spin" />
                                  )}
                                  <span className={`${stage.id === nextStage && 'text-gray-600'}`}>
                                    {stage.label}
                                  </span>
                                </div>

                                {/* Tooltip */}
                                {hoveredStage === `${patient.id}-${stage.id}` && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 pointer-events-none" style={{ whiteSpace: 'nowrap' }}>
                                    <div className="bg-white text-foreground px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
                                      {stage.detail}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {idx < pipelineStages.length - 2 && (
                                <div className="w-4 h-0.5 bg-border/80 mx-1" />
                              )}
                            </div>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
