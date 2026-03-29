'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Disable prerendering for authenticated pages
export const dynamic = 'force-dynamic';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Heart,
  Calendar,
  FileText,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  pipelineStage: string;
  clinicName: string;
  nextAppointment?: string;
}

export default function PatientDashboardPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || localStorage.getItem('patientEmail') || '';
  
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock patient data for demo
    // In production, fetch from backend using email
    setPatientData({
      id: 'patient_123',
      firstName: 'John',
      lastName: 'Smith',
      pipelineStage: 'PA_PENDING',
      clinicName: 'Bright Infusion Clinic',
      nextAppointment: '2026-04-15',
    });
    setLoading(false);
  }, [email]);

  const getPipelineStages = () => {return([
    {
      id: 'NEW_REFERRAL',
      label: 'Referral Received',
      description: 'Your referral has been submitted',
      icon: FileText,
    },
    {
      id: 'VERIFYING_INSURANCE',
      label: 'Insurance Verification',
      description: 'Clinic is verifying your coverage',
      icon: AlertCircle,
    },
    {
      id: 'PA_PENDING',
      label: 'Prior Authorization',
      description: 'Awaiting insurance approval',
      icon: Clock,
    },
    {
      id: 'SCHEDULED',
      label: 'Appointment Scheduled',
      description: 'Your appointment is booked',
      icon: Calendar,
    },
    {
      id: 'IN_TREATMENT',
      label: 'In Treatment',
      description: 'Receiving your treatment',
      icon: Heart,
    },
    {
      id: 'COMPLETE',
      label: 'Treatment Complete',
      description: 'Your treatment has completed',
      icon: CheckCircle,
    },
  ])}

  const getCurrentStageIndex = () => {
    const stages = getPipelineStages();
    return stages.findIndex(s => s.id === patientData?.pipelineStage) || 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
          <p className="text-foreground/60">Loading your treatment information...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md p-8 border-border/30 bg-primary/10">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center text-foreground mb-2">Patient Not Found</h2>
          <p className="text-sm text-foreground/60 text-center">Please check your email for the correct login link.</p>
        </Card>
      </div>
    );
  }

  const stages = getPipelineStages();
  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {patientData.firstName}
              </h1>
              <p className="text-foreground/60 mt-1">
                {patientData.clinicName}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-accent/30 text-accent hover:bg-accent/10 gap-2"
              onClick={() => {
                localStorage.removeItem('patientEmail');
                localStorage.removeItem('authToken');
                window.location.href = '/patient-portal/login';
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Treatment Pipeline */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Treatment Journey</h2>
            <p className="text-foreground/60">
              Here's where you are in your treatment process with us
            </p>
          </div>

          {/* Pipeline Visualization */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-8">
              {stages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isUpcoming = index > currentStageIndex;

                return (
                  <div key={stage.id} className="flex-1 flex items-center">
                    {/* Stage bubble */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : isCurrent
                          ? 'bg-accent/20 border-accent text-accent ring-4 ring-accent/20'
                          : 'bg-muted border-border/30 text-foreground/40'
                      }`}>
                        <StageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium text-center text-foreground/70 max-w-[80px]">
                        {stage.label}
                      </p>
                    </div>

                    {/* Connector line */}
                    {index < stages.length - 1 && (
                      <div className={`h-1 flex-1 mx-1 rounded ${
                        isCompleted ? 'bg-green-500/30' : 'bg-border/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Pipeline */}
          <div className="lg:hidden space-y-3">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-xl border-2 flex items-start gap-4 transition-all ${
                    isCompleted
                      ? 'bg-green-500/10 border-green-500/30'
                      : isCurrent
                      ? 'bg-accent/10 border-accent ring-2 ring-accent/20'
                      : 'bg-muted/30 border-border/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    isCompleted
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : isCurrent
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-border/30 border-border/30 text-foreground/40'
                  }`}>
                    <StageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isCurrent ? 'text-accent' : 'text-foreground'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-foreground/60">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Status */}
          <Card className="border-border/30 bg-primary/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Current Status</p>
                <h3 className="text-xl font-bold text-accent">
                  {stages[currentStageIndex].label}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                {(()=>{
                  const Icon = stages[currentStageIndex].icon;
                  return(
                  <Icon className="w-6 h-6 text-accent" />)
                })()}
              </div>
            </div>
            <p className="text-sm text-foreground/70">
              {stages[currentStageIndex].description}
            </p>
          </Card>

          {/* Next Appointment */}
          <Card className="border-border/30 bg-primary/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Next Appointment</p>
                <h3 className="text-xl font-bold text-foreground">
                  {patientData.nextAppointment || 'TBD'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-foreground/70">
              {patientData.nextAppointment 
                ? 'Your appointment is scheduled' 
                : 'Being scheduled by clinic'}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Intake Form */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background: 'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Intake Form</h3>
              <p className="text-xs text-foreground/60">
                Complete your pre-treatment intake form
              </p>
            </div>
          </button>

          {/* Send Message */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background: 'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Message Clinic</h3>
              <p className="text-xs text-foreground/60">
                Send a message to your clinic staff
              </p>
            </div>
          </button>

          {/* View Documents */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background: 'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">My Documents</h3>
              <p className="text-xs text-foreground/60">
                View consent forms and signed documents
              </p>
            </div>
          </button>
        </div>

        {/* HIPAA Notice */}
        <div className="mt-12 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-blue-300/80">
            🔒 <strong>Privacy Notice:</strong> All your medical information is transmitted using 256-bit encryption and stored in HIPAA-compliant servers. Your privacy and security are our top priority.
          </p>
        </div>
      </div>
    </div>
  );
}
