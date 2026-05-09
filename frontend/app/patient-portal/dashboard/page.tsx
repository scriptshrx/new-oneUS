'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Heart,
  Calendar,
  FileText,
  MessageCircle,
  LogOut,
  Loader,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Disable prerendering for authenticated pages
export const dynamic = 'force-dynamic';

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  pipelineStage: string;
  clinic: {
    name: string;
  };
  prescribedTreatment?: string;
  urgencyLevel?: string;
  referringPhysician?: string;
  nextAppointment?: string;
  _referral?: {
    id: string;
  };
}

interface Referral {
  id: string;
  prescribedTreatment: string;
  urgencyLevel: string;
  referringPhysician: {
    firstName: string;
    lastName: string;
  };
}

const pipelineStages = [
  { id: 'NEW_REFERRAL', detail: 'New Referral', label: 'New Referral' },
  { id: 'INSURANCE', detail: 'Insurance Verification', label: 'Insurance' },
  { id: 'AUTHORIZATION', detail: 'Prior Authorization', label: 'Authorization' },
  { id: 'SCHEDULING', detail: 'Scheduling Treatment', label: 'Scheduling' },
  { id: 'TREATMENT', detail: 'Treatment In Process', label: 'Treatment' },
  { id: 'COMPLETE', detail: 'Treatment Is Completed', label: 'Completed' },
  { id: 'FOLLOW_UP', detail: 'Treatment Follow-ups', label: 'Follow-up' },
  { id: 'INACTIVE_ARCHIVED', label: 'Patient Archived', detail: 'INACTIVE_ARCHIVED' },
];

function getStageStatus(stageId: string, currentPipelineStage: string) {
  const order = pipelineStages.map(s => s.id);
  const currentIdx = order.indexOf((currentPipelineStage || '').toUpperCase());
  const stageIdx = order.indexOf(stageId);
  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'current';
  return 'pending';
}

export default function PatientDashboardPage() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  useEffect(() => {
    // Get patientId from URL search params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('patientId');
      
      if (!id) {
        setError('Patient ID not provided in URL');
        setLoading(false);
        return;
      }

      setPatientId(id);
      
      // Fetch patient data from backend
      const fetchPatient = async () => {
        try {
          const response = await fetch(
            `https://scriptishrxnewmark.onrender.com/v1/patients/${id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch patient: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Patient data:',data)
          setPatientData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load patient data');
        } finally {
          setLoading(false);
        }
      };

      fetchPatient();
    }
  }, []);

  const getPipelineStages = () => {
    return pipelineStages;
  };

  const getCurrentStageIndex = () => {
    if (!patientData) return 0;
    const stages = getPipelineStages();
    return stages.findIndex(s => s.id === patientData.pipelineStage) || 0;
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

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md p-8 border-border/30 bg-primary/10">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center text-foreground mb-2">
            {error ? 'Error Loading Patient' : 'Patient Not Found'}
          </h2>
          <p className="text-sm text-foreground/60 text-center">
            {error || 'Could not find patient data. Please check the URL.'}
          </p>
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
                {patientData.clinic?.name || 'Treatment Portal'}
              </p>
            </div>
          
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
              Here's where you are in your treatment process
            </p>
          </div>

          {/* Pipeline Visualization */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-8">
              {stages.map((stage, index) => {
                const status = getStageStatus(stage.id, patientData.pipelineStage);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';

                return (
                  <div key={stage.id} className="flex-1 flex items-center">
                    {/* Stage bubble */}
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : isCurrent
                            ? 'bg-accent/20 border-accent text-accent ring-4 ring-accent/20'
                            : 'bg-muted border-border/30 text-foreground/40'
                        }`}
                        onMouseEnter={() => setHoveredStage(stage.id)}
                        onMouseLeave={() => setHoveredStage(null)}
                      >
                        {isCompleted && <CheckCircle2 className="w-6 h-6" />}
                        {!isCompleted && !isCurrent && <AlertCircle className="w-6 h-6" />}
                        {isCurrent && <Clock className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-medium text-center text-foreground/70 max-w-[80px]">
                        {stage.label}
                      </p>

                      {/* Tooltip */}
                      {hoveredStage === stage.id && (
                        <div className="absolute top-full mt-2 z-50 pointer-events-none">
                          <div className="bg-white text-foreground px-3 py-2 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap">
                            {stage.detail}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Connector line */}
                    {index < stages.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-1 rounded ${
                          isCompleted ? 'bg-green-500/30' : 'bg-border/20'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Pipeline */}
          <div className="lg:hidden space-y-3">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.id, patientData.pipelineStage);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';

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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      isCompleted
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : isCurrent
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-border/30 border-border/30 text-foreground/40'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                    {!isCompleted && !isCurrent && <AlertCircle className="w-5 h-5" />}
                    {isCurrent && <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`font-semibold ${isCurrent ? 'text-accent' : 'text-foreground'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-foreground/60">{stage.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                <Clock className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-foreground/70">
              {stages[currentStageIndex].detail}
            </p>
          </Card>

          {/* Prescribed Treatment */}
          {patientData.prescribedTreatment && (
            <Card className="border-border/30 bg-primary/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Prescribed Treatment</p>
                  <h3 className="text-xl font-bold text-foreground">
                    {patientData.prescribedTreatment}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-foreground/70">
                Your prescribed treatment plan
              </p>
            </Card>
          )}

          {/* Urgency Level */}
          {patientData.urgencyLevel && (
            <Card className="border-border/30 bg-primary/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Urgency Level</p>
                  <h3
                    className={`text-xl font-bold ${
                      patientData.urgencyLevel === 'ROUTINE'
                        ? 'text-blue-400'
                        : patientData.urgencyLevel === 'URGENT'
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {patientData.urgencyLevel}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-foreground/70">
                Treatment priority level
              </p>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Intake Form */}
          {/* <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
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
          {/* <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
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
          </button> */}

          {/* View Documents */}
          {/*<button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all text-left">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
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
          </button> */}
        </div>

        {/* HIPAA Notice */}
        <div className="mt-12 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-blue-300/80">
            <span className='text-gray-600'>🔒</span> <strong>Privacy Notice:</strong> All your medical information is transmitted using
            256-bit encryption and stored in HIPAA-compliant servers. Your privacy and security
            are our top priority.
          </p>
        </div>
      </div>
    </div>
  );
}
