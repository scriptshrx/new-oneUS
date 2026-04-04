'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  treatmentType?: string;
  prescribedTreatment?: string;
  referringPhysician: string;
  status?: string;
  pipelineStage: string;
  primaryDiagnosis?: string;
  clinicalNotes?: string;
  urgencyLevel?: string;
}

interface PatientCRMNodeProps {
  patient: Patient;
  onClose: () => void;
  onUpdateStatus?: (patientId: string, nextStage: string) => Promise<void>;
}

const pipelineStages = [
  { id: 'new_referral', label: 'New Referral', detail: 'New Referral' },
  { id: 'insurance', label: 'Insurance Verification', detail: 'Insurance Verification' },
  { id: 'authorization', label: 'Prior Authorization', detail: 'Prior Authorization' },
  { id: 'scheduling', label: 'Scheduling Treatment', detail: 'Scheduling Treatment' },
  { id: 'treatment', label: 'Treatment In Process', detail: 'Treatment In Process' },
  { id: 'followup', label: 'Treatment Follow-ups', detail: 'Treatment Follow-ups' },
];

const getStageStatus = (stageId: string, patientPipelineStage: string) => {
  const order = pipelineStages.map(s => s.id);
  const currentIdx = order.indexOf((patientPipelineStage || '').toLowerCase());
  const stageIdx = order.indexOf(stageId);

  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
};

const getNextStage = (currentStage: string): string | null => {
  const order = pipelineStages.map(s => s.id);
  const currentIdx = order.indexOf((currentStage || '').toLowerCase());
  
  if (currentIdx === -1 || currentIdx === order.length - 1) {
    return null; // No next stage or stage not found
  }
  
  return order[currentIdx + 1].toUpperCase();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 border-green-500/50 text-green-400';
    case 'active':
      return 'bg-blue-500/20 border-blue-500/50 text-blue-400 animate-pulse';
    case 'pending':
      return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    default:
      return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-6 h-6" />;
    case 'active':
      return <Clock className="w-6 h-6" />;
    case 'pending':
      return <AlertCircle className="w-6 h-6" />;
    default:
      return <AlertCircle className="w-6 h-6" />;
  }
};

export default function PatientDetailModal({ patient, onClose, onUpdateStatus }: PatientCRMNodeProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!onUpdateStatus || !patient.id) return;
    
    const nextStage = getNextStage(patient.pipelineStage);
    if (!nextStage) return; // Already at final stage
    
    try {
      setIsUpdating(true);
      // console.log('Selected referral id:',patient._referral.id)
      await onUpdateStatus(patient.id, nextStage);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      setIsUpdating(false);
    }
  };

  return (
  <div className="fixed inset-0 absolute z-50 bg-white/50 shadow-md backdrop-blur-md flex items-center justify-center py-4 overflow-y-auto"
    onClick={()=>onClose()}>
    <div className=" border border-border/30 rounded-2xl max-w-5xl overflow-hidden overflow-y-auto w-full h-full bg-primary/20 space-y-4 my-8"
    style={{scrollbarWidth:'none',scrollbarColor:'inherit'}}
      onClick={(e)=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-[4px] border-primary/80 ">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{patient.firstName + ' ' + patient.lastName}</h2>
          
               <div className="text-primary/70 text-sm mt-1 flex flex-col">
               <div>Prescribed Treatment </div>
               <div className='rounded p-1 px-2 bg-accent/10 border-l-[4px] border-primary bg-background/80 text-primary font-bold'>{patient.prescribedTreatment}</div>
               </div>
                <div className="text-primary/70 text-sm mt-1 flex flex-col">
               <div>Medical Notes </div>
               <div className='rounded p-1 px-2 bg-accent/10 border-l-[4px] border-primary bg-background/80 text-primary font-bold'>{patient.clinicalNotes}</div>
               </div>
          </div>
          <button
            onClick={()=>{onClose()}}
            className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Patient Info */}
        <div className="p-6 border-b border-primary/20 ">
          <div className="grid mx-auto grid-cols-1 md:grid-cols-3 gap-6 mx-auto items-center justify-center">
            <div>
              <label className="text-sm font-semibold text-primary/80">Referring Physician</label>
              <p className="text-foreground mt-1">{patient.referringPhysician}</p>
            </div>
            <div>
              
              <label className="text-sm font-semibold text-primary/80">Primary Diagnosis</label>
              <p className="text-foreground mt-1">{patient.primaryDiagnosis}</p>
            </div>
            

            <div>
              <label className="text-sm font-semibold text-primary/80">Current Status</label>
              <p className="text-accent mt-1 font-semibold capitalize">{patient.pipelineStage?.replace(/_/g, ' ').toLowerCase()}</p>
            </div>
          </div>
        </div>
        

        {/* CRM Pipeline */}
        <div className="p-8">
          <h3 className="text-lg font-bold text-primary/95 mb-8">Treatment Pipeline</h3>

          {/* Pipeline Nodes */}
          <div className="flex flex-col lg:flex-row gap-6 hidden items-start lg:items-center justify-between">
            {pipelineStages.map((stage, index) => {
              const status = getStageStatus(stage.id, patient.pipelineStage);
              const isLast = index === pipelineStages.length - 1;

              return (
                <div key={stage.id} className="flex items-center gap-6 w-full lg:w-auto">
                  {/* Stage Node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(status)}`}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-xs font-semibold text-foreground/80 mt-3 text-center w-20">
                      {stage.label}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1 capitalize">{status}</p>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="hidden lg:block flex-1 h-1 bg-border/30 mx-2 relative">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all ${
                          getStageStatus(pipelineStages[index + 1].id, patient.pipelineStage) === 'completed'
                            ? 'bg-green-500/50'
                            : getStageStatus(pipelineStages[index + 1].id, patient.pipelineStage) === 'active'
                              ? 'bg-blue-500/50'
                              : 'bg-gray-500/30'
                        }`}
                        style={{
                          width: getStageStatus(pipelineStages[index + 1].id, patient.pipelineStage) === 'completed' ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}

                  {/* Vertical Connector on Mobile */}
                  {!isLast && (
                    <div className="lg:hidden flex-col items-center">
                      <div
                        className={`w-1 h-8 transition-all ${
                          getStageStatus(pipelineStages[index + 1].id, patient.pipelineStage) === 'completed'
                            ? 'bg-green-500/50'
                            : getStageStatus(pipelineStages[index + 1].id, patient.pipelineStage) === 'active'
                              ? 'bg-blue-500/50'
                              : 'bg-gray-500/30'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage Details */}
          <div className="mt-12 p-6 bg-background/80 rounded-xl border border-border/20">
            <h4 className="text-sm font-semibold text-foreground/80 mb-4">Stage Details</h4>
            <div className="space-y-3">
              {pipelineStages.map((stage) => {
                const status = getStageStatus(stage.id, patient.pipelineStage);
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : status === 'active'
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-current" />
                      <span className="text-sm font-medium text-foreground">{stage.label}</span>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${
                      status === 'completed'
                        ? 'text-green-400'
                        : status === 'active'
                          ? 'text-blue-400'
                          : 'text-gray-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-border/30 ">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/30 text-foreground hover:bg-primary/20"
          >
            Close
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            disabled={isUpdating || !getNextStage(patient.pipelineStage)}
            className="bg-accent hover:bg-accent/90 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
        </div>

      
      </div>
    </div>
  );
}
