'use client';

import ClinicPatientCRM from '@/components/ClinicPatientCRM';
import AlertsSection from '@/components/AlertsSection';
import PatientCard from '@/components/PatientCard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {useClinicDashboardView} from '@/components/ClinicDashboardLayout'
import {
  FileText,
  Clock,
  Hourglass,
  Calendar,
  Activity,
  CheckCircle,
} from 'lucide-react';
const pipelineStages = [
  { id: 'new_referral', label: 'New Referral', color: 'bg-blue-100 dark:bg-blue-950', icon: FileText, iconColor: 'text-blue-400' },
  { id: 'insurance', label: 'Verifying Insurance', color: 'bg-yellow-100 dark:bg-yellow-950', icon: Clock, iconColor: 'text-yellow-400' },
  { id: 'authorization', label: 'PA Pending', color: 'bg-orange-100 dark:bg-orange-950', icon: Hourglass, iconColor: 'text-orange-400' },
  { id: 'scheduling', label: 'Scheduled', color: 'bg-cyan-100 dark:bg-cyan-950', icon: Calendar, iconColor: 'text-cyan-400' },
  { id: 'treatment', label: 'In Treatment', color: 'bg-purple-100 dark:bg-purple-950', icon: Activity, iconColor: 'text-purple-400' },
  { id: 'complete', label: 'Complete', color: 'bg-green-100 dark:bg-green-950', icon: CheckCircle, iconColor: 'text-green-400' },
];




interface OverviewViewProps {
  onBack?: () => void;
}

export default function OverviewView({ onBack }: OverviewViewProps) {
  const {patients,setCurrentView} =useClinicDashboardView();
  const [activeStage, setActiveStage] = useState('new_referral');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Group patients by pipeline stage
  const patientsByStage = patients.reduce((acc: Record<string, any[]>, patient: any) => {
    const stage = patient.pipelineStage?.toLowerCase() || 'new_referral';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(patient);
    return acc;
  }, {});

  const currentPatients = patientsByStage[activeStage] || [];

  return (
    <>
      {/* Header */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Clinic Dashboard</h1>
            <p className="text-foreground/75">Manage your clinic's patient referrals and appointments</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Alerts Section */}
       

        {/* Pipeline Stages */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-accent mb-6">Quick Overview</h2>

          {/* Stage Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              const patientCount = patientsByStage[stage.id]?.length || 0;
              return (
                <button
                  key={stage.id}
                  onClick={() => {setActiveStage(stage.id);
                    setCurrentView('patients')
                  }}
                  
                  className={`group relative p-6 rounded-2xl border transition-all ${
                    activeStage === stage.id
                      ? 'border-accent/70 bg-accent/20 hover:border-accent'
                      : 'border-border/30 bg-primary/10 hover:border-accent/50'
                  }`}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{
                      background:
                        'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stage.iconColor.replace('text-', 'bg-')}/20 border ${stage.iconColor.replace('text-', 'border-')}/30 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stage.iconColor}`} />
                      </div>
                    </div>
                    <p className="text-foreground/80 text-sm mb-2 font-medium text-center">{stage.label}</p>
                    <p className={`text-3xl font-bold text-center ${stage.iconColor}`}>
                      {patientCount}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Patient Cards Grid */}
          {currentPatients.length > 0 ? (
            <div 
            onClick={()=>setCurrentView('patients')}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 cursor-pointer  sm:gap-6">
              {currentPatients.map((patient, index) => (
                <PatientCard 
                  key={index} 
                  {...patient} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-primary/10 rounded-lg border border-border/20">
              <p className="text-foreground/60 mb-4">No patients in this stage</p>
              <Button
              onClick={()=>{setCurrentView('intakeForm');localStorage.setItem('dashboardView','intakeForm')}} variant="outline" size="sm">
                Add New Referral
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        
      </main>

    
    </>
  );
}
