'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
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

const pipelineStages = [
  { id: 'new_referral', label: 'New 6', color: 'bg-blue-600' },
  { id: 'insurance', label: 'Insurance 3', color: 'bg-purple-600' },
  { id: 'authorization', label: 'Authorization 2', color: 'bg-indigo-600' },
  { id: 'scheduling', label: 'Scheduling', color: 'bg-cyan-600' },
  { id: 'treatment', label: 'In Treatment', color: 'bg-teal-600' },
  { id: 'complete', label: 'Completed', color: 'bg-green-600' },
];

export default function PatientsView() {
  const { chair, patients, patientsLoading, patientsError } = useChairDashboardView();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
  };

  const getTotalValue = (stagePatients: Patient[]) => {
    return stagePatients.length > 0 ? `$${stagePatients.length * 25}K` : '$0';
  };

  const groupPatientsByStage = () => {
    const grouped: Record<string, Patient[]> = {};
    pipelineStages.forEach(stage => {
      grouped[stage.id] = [];
    });
    patients?.forEach(patient => {
      const stage = (patient.pipelineStage || 'new_referral').toLowerCase();
      if (grouped[stage]) {
        grouped[stage].push(patient);
      }
    });
    return grouped;
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

  const groupedPatients = groupPatientsByStage();

  return (
    <div className="p-6 space-y-6 h-full overflow-hidden flex flex-col bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deal pipeline</h1>
          <p className="text-slate-600 mt-1">Main table • mondayskick</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-slate-500 text-sm">Deal insights</span>
            <span className="text-red-600 text-sm font-bold">This deal is at risk</span>
          </div>
        </div>
      </div>

      {patientsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{patientsError}</p>
        </div>
      )}

      {patients.length === 0 && !patientsError && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 mb-2">No patients found</p>
          <p className="text-sm text-slate-500">Assigned patients will appear here</p>
        </div>
      )}

      {patients.length > 0 && (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max pr-6">
            {pipelineStages.map((stage) => {
              const stagePatients = groupedPatients[stage.id] || [];
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header - Monday.com style */}
                  <div className={`${stage.color} rounded-lg px-4 py-3 text-white mb-4 flex items-center justify-between`}>
                    <div>
                      <h2 className="font-bold text-base">{stage.label}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-white/90 text-sm font-semibold">{getTotalValue(stagePatients)}</p>
                    </div>
                  </div>

                  {/* Patient Cards */}
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stagePatients.length === 0 ? (
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <p className="text-slate-400 text-sm">No patients</p>
                      </div>
                    ) : (
                      stagePatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all hover:border-slate-300 group"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          {/* Patient Name */}
                          <div className="px-4 py-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                              {patient.firstName} {patient.lastName}
                            </h3>
                          </div>

                          {/* Deal Value Section */}
                          <div className="px-4 py-2">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Value</p>
                            <p className="text-lg font-bold text-slate-900 mt-0.5">$25,000</p>
                          </div>

                          {/* Urgency Badge */}
                          <div className="px-4 py-2">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getUrgencyColor(patient.urgencyLevel)}`}>
                              {patient.urgencyLevel || 'Low'}
                            </span>
                          </div>

                          {/* Treatment/Details */}
                          <div className="px-4 py-3 space-y-2 bg-slate-50/50 text-xs">
                            <div className="flex justify-between items-start">
                              <span className="text-slate-600">Treatment:</span>
                              <span className="text-slate-900 font-medium text-right flex-1 ml-2">{patient.prescribedTreatment || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-slate-600">Physician:</span>
                              <span className="text-slate-900 font-medium text-right flex-1 ml-2 truncate">{patient.referringPhysician || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Action hint */}
                          <div className="px-4 py-2 border-t border-slate-100">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <span>📌 AI recommendation</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">Schedule a consultation call</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isClient && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
