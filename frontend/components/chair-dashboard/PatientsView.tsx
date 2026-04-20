'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Fullscreen, CheckCircle2, Loader } from 'lucide-react';
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
  urgencyLevel?: string;
  status?: string;
}

interface ChairWithPatients extends Patient {
  patients?: Patient[];
}

export default function PatientsView() {
  const { chair, patients, patientsLoading, patientsError } = useChairDashboardView();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [nextStages, setNextStages] = useState<Record<string, string>>({});

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

  if (patientsLoading) {
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chairs Pipeline</h1>
        <p className="text-foreground/60 mt-1">View your assigned patients and their pipelines</p>
      </div>

      {patients.length === 0 && !patientsError && (
        <div className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-2">No patients found</p>
          <p className="text-sm text-foreground/50">Assigned patients will appear here</p>
        </div>
      )}

      {patients.length > 0 && (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-background/50 border border-border/30 rounded-lg p-6 hover:border-border/50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{patient.firstName} {patient.lastName}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-foreground/60">Diagnosis</p>
                      <p className="text-foreground">{patient.primaryDiagnosis}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Urgency</p>
                      <p className={`text-foreground ${getUrgencyColor(patient.urgencyLevel)}`}>{patient.urgencyLevel || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => setSelectedPatient(patient)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientDetailModal patient={selectedPatient} isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
