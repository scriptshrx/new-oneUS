'use client';

import { useEffect, useState } from 'react';
import { Users, ArrowLeft, Plus, ZoomIn, Expand, LucideExpand, Maximize, Loader, Fullscreen, CheckCheck, CheckCircle, RefreshCcw, RefreshCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientDetailModal from '@/components/PatientDetailModal';

interface PatientsViewProps {
  patients:any[];
  patientsError:string;
  patientsLoading:boolean;
  onBack?: () => void;
}

const mockPatients = [
  {
    id: '1',
    name: 'Jennifer L.',
    treatmentType: 'IV Therapy',
    referringPhysician: 'Dr. Sarah Chen, MD',
    status: 'scheduled',
  },
  {
    id: '2',
    name: 'Marcus T.',
    treatmentType: 'Ketamine Therapy',
    referringPhysician: 'Dr. David Martinez, MD',
    status: 'in-treatment',
  },
  {
    id: '3',
    name: 'Robert H.',
    treatmentType: 'Biologic Infusion',
    referringPhysician: 'Dr. Angela White, MD',
    status: 'pa-pending',
  },
];

const pipelineStages = [
  { id: 'new_referral', label: 'New Referral' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'authorization', label: 'Authorization' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'treatment', label: 'Treatment' },
  { id: 'followup', label: 'Follow-up' },
];



function getStageStatus(stageId: string, patientStatus: string) {
  const order = pipelineStages.map(s => s.id);
  const currentIdx = order.indexOf((patientStatus || '').toLowerCase());
  const stageIdx = order.indexOf(stageId);
  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
}



export default function PatientsView({ onBack, patientsLoading, patientsError, patients }: PatientsViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [nextStages, setNextStages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patients.length > 0) {
      console.log('Patients:', patients);
      // Calculate next stages for all patients
      const stages: Record<string, string> = {};
      patients.forEach((patient) => {
        const currentStage = patient.pipelineStage;
        if (currentStage === 'NEW_REFERRAL') stages[patient.id] = 'insurance';
        else if (currentStage === 'INSURANCE') stages[patient.id] = 'authorization';
        else if (currentStage === 'AUTHORIZATION') stages[patient.id] = 'scheduling';
        else if (currentStage === 'SCHEDULING') stages[patient.id] = 'treatment';
        else if (currentStage === 'TREATMENT') stages[patient.id] = 'followup';
      });
      setNextStages(stages);
    }
  }, [patients]);
  return (
    <>
      {/* Header */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-accent" />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-accent">Patients</h1>
                <p className="text-foreground/75">Manage and track all patients</p>
                {patientsLoading&&<Loader className='h-5 w-5 animate-spin'/>}
              </div>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-white font-semibold gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Intake Form
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Patients List */}
          <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-primary">Patient List</h2>
              </div>

              <div className="space-y-3">
                {patients.length>0&& patients.map((patient) => (
                  <div key={patient.id} className="bg-background/60 overflow-hidden border border-border/20 rounded-lg p-2 cursor-pointer px-4 hover:bg-background/60 relative  transition-colors"
                   onClick={() => setSelectedPatient(patient)}>
                    <Fullscreen className='absolute h-4 w-4 text-accent/80 right-4 top-4'/>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-primary/95 font-semibold">{patient.firstName + ' ' + patient.lastName}</p>
                       <p className="text-foreground/75 text-sm font-bold mt-1">{patient.prescribedTreatment}</p>
                       {/* CRM Pipeline */}
                        <div className="flex items-center gap-2 my-3 py-2 overflow-x-auto overflow-hidden"
                        style={{scrollbarWidth:'thin'}}>
                          {pipelineStages.map((stage, idx) => {
                            const status = getStageStatus(stage.id, patient.pipelineStage);
                            const nextStage = nextStages[patient.id];

                            return (
                              <div key={stage.id} className="flex items-center">
                                <div
                                  className={`${
                                    status === 'completed'
                                      ? 'bg-accent text-white'
                                      : status === 'active'
                                      ? 'bg-primary text-white border-2 border-gray-300'
                                      : stage.id==nextStage?'shadow-md'
                                      :
                                      'bg-border/30 text-foreground/40'
                                  } rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap flex items-center justify-center transition-colors`}
                                >{status=='active'&&
                                 <CheckCircle className='h-4 mr-2 w-4 text-white'/>}
                                 {stage.id==nextStage&&
                                 <div className='h-4 w-4 border-gray-500/30  rounded-full mr-2 border-l-gray-500 border-[2px] flex items-center animate-spin'/>}
                                  <span className={`${stage.id==nextStage&&'text-gray-600'}`}>{stage.label}</span>
                                </div>
                                {idx < pipelineStages.length - 1 && (
                                  <div className="w-4 h-0.5 bg-border/50 mx-1" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-foreground/60 text-sm mt-1">Referring Physician: {patient.referringPhysician}</p>
                      </div>
                      <RefreshCcwIcon
                      onClick={(e)=>e.stopPropagation()} 
                      className='h-4 w-4 text-primary absolute top-4 right-32'/>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 absolute top-3 right-2 rounded-full mr-8 text-xs font-semibold ${patient.urgencyLevel=='ROUTINE'?'bg-primary/20 text-primary':patient.urgencyLevel=='URGENT'?'bg-orange/20 text-orange':'bg-red-500/20 text-red-500'}  border border-accent/30 whitespace-nowrap`}>
                          {patient.urgencyLevel}
                        </span>
                
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}
    </>
  );
}
