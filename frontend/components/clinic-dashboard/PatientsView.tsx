'use client';

import { useEffect, useState } from 'react';
import { Users, ArrowLeft, Plus, ZoomIn, Expand, LucideExpand, Maximize, Loader, Fullscreen, CheckCheck, CheckCircle, RefreshCcw, RefreshCcwIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientDetailModal from '@/components/PatientDetailModal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';

interface PatientsViewProps {
  patients: any[];
  patientsError: string | null;
  patientsLoading: boolean;
  archivedOnly?: boolean;
  onBack?: () => void;
}



const pipelineStages = [
  { id: 'new_referral', detail: 'New Referral',label:'New Referral' },
  { id: 'insurance', detail: 'Insurance Verification',label:'Insurance' },
  { id: 'authorization', detail: 'Prior Authorization', label:'Authorization' },
  { id: 'scheduling', detail: 'Scheduling Treatment',label:'Scheduling' },
  { id: 'treatment', detail: 'Treatment In Process',label:'Treatment' },
  { id: 'complete', detail: 'Treatment Is Completed',label:'Completed' },
  { id: 'follow_up', detail: 'Treatment Follow-ups', label:'Follow-up' },
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



export default function PatientsView({ onBack, patientsLoading, patientsError, patients, archivedOnly }: PatientsViewProps) {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [nextStages, setNextStages] = useState<Record<string, string>>({});
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const {setCurrentView, clinicId,clinic} = useClinicDashboardView();

  const activePatients = patients.filter(
    (patient) => !['INACTIVE_ARCHIVED', 'inactive_archived'].includes(patient.pipelineStage)
  );
  const archivedPatients = patients.filter((patient) =>
    ['INACTIVE_ARCHIVED', 'inactive_archived'].includes(patient.pipelineStage)
  );
  const displayedPatients = archivedOnly ? archivedPatients : activePatients;
  const pageTitle = archivedOnly ? 'Archived Patients' : 'Patient Pipelines';
  const archiveBoxTitle = 'Archived Patients';

  useEffect(() => {
    if (patients.length > 0) {
      console.log('The clinic id is:',clinicId)
      console.log('Patients:', patients);
      
      // Calculate next stages for all patients
      const stages: Record<string, string> = {};
      patients.forEach((patient) => {
        const currentStage = patient.pipelineStage;
        if (currentStage === 'NEW_REFERRAL') stages[patient.id] = 'insurance';
        else if (currentStage === 'INSURANCE') stages[patient.id] = 'authorization';
        else if (currentStage === 'AUTHORIZATION') stages[patient.id] = 'scheduling';
        else if (currentStage === 'SCHEDULING') stages[patient.id] = 'treatment';
        else if (currentStage === 'TREATMENT') stages[patient.id] = 'complete';
        else if (currentStage==='COMPLETE') stages[patient.id] = 'follow_up';
         else if (currentStage==='FOLLOW_UP') stages[patient.id] = 'inactive_archived';
         

      });
      setNextStages(stages);
    }
  }, [patients]);

  const handleUpdateStatus = async (patientId: string, nextStage: string) => {
    const referralId = selectedPatient?._referral.id;
    console.log('Starting to update status for patient referral is:', referralId)
    try {
      const response = await fetchWithAuth(`https://scriptishrxnewmark.onrender.com/v1/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStage }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      // Update the local patient data
      const updatedPatient = await response.json();
      window.location.reload();
      
      // Update patients list with the new patient data
      const updatedPatients = patients.map((p) =>
        p.id === patientId ? { ...p, pipelineStage: nextStage } : p
      );
      
      console.log('✅ Patient status updated:', updatedPatient);
    } catch (error) {
      console.error('❌ Error updating patient status:', error);
      throw error;
    }
  };

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
                <h1 className="text-3xl font-bold text-accent">{pageTitle}</h1>
                <p className="text-foreground/75">
                  {archivedOnly ? 'Review archived patients' : 'Manage and track all pipeline stages'}
                </p>
                {patientsLoading && <Loader className='h-5 w-5 animate-spin' />}
              </div>
            </div>
            <Button 
              onClick={() => setCurrentView('intakeForm')}
              className="bg-accent hover:bg-accent/90 text-white font-semibold gap-2 w-full sm:w-auto"
            >
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

                <h2 className="text-lg font-bold text-primary">Active Patients</h2>
              </div>

              <div className="space-y-3">
                {displayedPatients.length > 0 ? (
                  displayedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-background/60 -mx-4 overflow-hidden border border-border/20 rounded-lg p-2 cursor-pointer px-4 hover:bg-background/60 relative transition-colors"
                      onClick={() => {
                        setSelectedPatient(patient);
                        console.log('Selected Patient:', patient);
                      }}
                    >
                    <Fullscreen className='absolute h-4 w-4 text-accent/80 right-4 top-4'/>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-primary/95 font-semibold">{patient.firstName + ' ' + patient.lastName}</p>
                       <p className="text-foreground/75 text-sm font-bold mt-1">{patient.prescribedTreatment}</p>
                       {/* CRM Pipeline */}
                        <div className={`flex items-center gap-2 my-3 py-2 overflow-x-auto h-10 rounded-lg hover:bg-primary/2 -pb-10 pl-2 hover:h-20 transition-all items-end overflow-y-visible`}

                        style={{scrollbarWidth:'none'}}>
                          {pipelineStages.map((stage, idx) => {
                            const status = getStageStatus(stage.id, patient.pipelineStage);
                            const nextStage = nextStages[patient.id];

                            return (
                             stage.id !=='inactive_archived'&&
                              <div key={stage.id} className="flex self-end relative">
                                <div
                                  className="relative"
                                     onMouseEnter={() => setHoveredStage(stage.id)}
                                  onMouseLeave={() => setHoveredStage(null)}
                                
                                 
                                >
                                  <div
                                    className={`${
                                      status === 'completed'
                                        ? 'bg-accent/80 text-white'
                                        : status === 'active'
                                        ? 'bg-primary/80 text-white border-2 border-gray-300'
                                        : stage.id==nextStage?'shadow-md'
                                        :
                                        'bg-border/30 text-foreground/40'
                                    } rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap flex items-center justify-center transition-colors`}
                                  >{status=='completed'&&
                                   <CheckCircle2 className='h-4 mr-2 w-4 text-white'/>}
                                   {status=='active' && stage.id!=='complete'&&<div className='h-3 w-3 border-gray-100/30  rounded-full mr-2 border-l-gray-100 border-[2px] flex items-center animate-spin'/>}
                                   
                                    <span className={`${stage.id==nextStage&&'text-gray-600'}`}>{stage.label}</span>
                                  </div>
                                </div>

                                {/* Tooltip Speech Bubble */}
                                {hoveredStage === stage.id && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 pointer-events-none" style={{whiteSpace: 'nowrap'}}>
                                    <div className="bg-white text-foreground px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
                                      {stage.detail}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                                    </div>
                                  </div>
                                )}
                                {idx <pipelineStages.length -2 && (
                                  <div className="w-4 h-0.5 bg-border/80 self-center mx-1" />
                                )}
                              </div>
                             
                            );
                          })}
                        </div>
                        <p className="text-foreground/60 text-sm mt-1">Referring Physician:<span className='font-semibold text-primary/70'> {patient.referringPhysician}</span></p>
                      </div>
                      <RefreshCcwIcon
                      onClick={(e)=>{e.stopPropagation();localStorage.setItem('dashboardView','patients');window.location.reload();}} 
                      className='h-4 w-4 text-primary absolute top-4 right-32 cursor-pointer hover:text-accent transition-colors'/>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 absolute top-3 right-2 rounded-full mr-8 text-xs font-semibold border whitespace-nowrap ${
                          patient.urgencyLevel === 'ROUTINE' 
                            ? 'bg-blue-500/20 text-blue-700 border-blue-500/30'
                            : patient.urgencyLevel === 'URGENT'
                            ? 'bg-orange-500/20 text-orange-700 border-orange-500/30'
                            : 'bg-red-500/20 text-red-700 border-red-500/30'
                        }`}>
                          {patient.urgencyLevel}
                        </span>
                
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/20 bg-primary/5 p-6 text-center text-foreground/70">
                  {archivedOnly
                    ? 'No archived patients yet.'
                    : 'No active patients available right now.'}
                </div>
              )}
              </div>
            </div>
          </div>

          {!archivedOnly && archivedPatients.length > 0 && (
            <div className="bg-primary/10 border border-border/30 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-primary">{archiveBoxTitle}</h2>
                </div>
                <div className="space-y-3">
                  {archivedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-background/60 overflow-hidden border border-border/20 rounded-lg p-2 cursor-pointer px-4 hover:bg-background/60 relative transition-colors"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-primary/95 font-semibold">{patient.firstName + ' ' + patient.lastName}</p>
                          <p className="text-foreground/75 text-sm font-bold mt-1">{patient.prescribedTreatment}</p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground/70">
                          {patient.pipelineStage?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient} 
          clinicId={clinicId}
          clinicName={clinic.name}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
}
