'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PatientCard from '@/components/PatientCard';
import AlertsSection from '@/components/AlertsSection';

const pipelineStages = [
  { id: 'new-referral', label: 'New Referral', color: 'bg-blue-100 dark:bg-blue-950' },
  { id: 'verifying-ins', label: 'Verifying Insurance', color: 'bg-purple-100 dark:bg-purple-950' },
  { id: 'pa-pending', label: 'PA Pending', color: 'bg-orange-100 dark:bg-orange-950' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-green-100 dark:bg-green-950' },
  { id: 'in-treatment', label: 'In Treatment', color: 'bg-red-100 dark:bg-red-950' },
  { id: 'complete', label: 'Complete', color: 'bg-emerald-100 dark:bg-emerald-950' },
];

const mockAlerts = [
  {
    id: '1',
    type: 'critical' as const,
    title: 'Consent form unsigned — appointment is tomorrow',
    description: 'Patient Sarah M. has not signed consent form for appointment scheduled tomorrow at 2:00 PM.',
    action: 'Send SMS reminder',
  },
  {
    id: '2',
    type: 'critical' as const,
    title: 'PA approval expiring in 14 days',
    description: 'James K. has active PA approval that expires in 14 days. Patient has not yet been treated.',
    action: 'Schedule appointment',
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Intake form incomplete',
    description: 'Michael R. appointment is today but intake form is still incomplete.',
    action: 'Complete intake',
  },
  {
    id: '4',
    type: 'warning' as const,
    title: 'Follow-up calls overdue',
    description: '3 patients require post-treatment follow-up check-in from yesterday.',
    action: 'View patients',
  },
  {
    id: '5',
    type: 'info' as const,
    title: 'Insurance verification failed',
    description: 'Patient Emily T. insurance verification failed. Manual review required.',
    action: 'Review case',
  },
];

const mockPatients = {
  'new-referral': [
    {
      name: 'Jennifer L.',
      treatmentType: 'IV Therapy',
      referringPhysician: 'Dr. Sarah Chen, MD',
      insuranceStatus: 'pending' as const,
      paStatus: 'pending' as const,
      intakeStatus: 'pending' as const,
      consentStatus: 'pending' as const,
      nextAction: 'Verify Insurance',
      assignedStaff: 'Unassigned',
    },
  ],
  'verifying-ins': [
    {
      name: 'Marcus T.',
      treatmentType: 'Ketamine Therapy',
      referringPhysician: 'Dr. David Martinez, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'pending' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'signed' as const,
      nextAction: 'Submit Prior Auth',
      assignedStaff: 'Lisa R.',
    },
  ],
  'pa-pending': [
    {
      name: 'Robert H.',
      treatmentType: 'Biologic Infusion',
      referringPhysician: 'Dr. Angela White, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'pending' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'signed' as const,
      nextAction: 'Awaiting PA Decision',
      assignedStaff: 'Michael J.',
      appointmentDate: 'Pending PA approval',
    },
  ],
  'scheduled': [
    {
      name: 'Sarah M.',
      treatmentType: 'NAD+ Therapy',
      referringPhysician: 'Dr. Elizabeth Brown, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'approved' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'pending' as const,
      nextAction: 'Send Consent Form',
      assignedStaff: 'Jessica P.',
      appointmentDate: 'Mar 25, 2026 at 2:00 PM',
    },
    {
      name: 'James K.',
      treatmentType: 'IV Hydration',
      referringPhysician: 'Dr. Thomas Green, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'approved' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'signed' as const,
      nextAction: 'Confirm Appointment',
      assignedStaff: 'Nicole L.',
      appointmentDate: 'Mar 27, 2026 at 10:30 AM',
    },
  ],
  'in-treatment': [
    {
      name: 'Daniel F.',
      treatmentType: 'IV Therapy',
      referringPhysician: 'Dr. Robert Clark, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'approved' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'signed' as const,
      nextAction: 'Check-in Patient',
      assignedStaff: 'Alex K.',
      appointmentDate: 'Today - In Progress',
    },
  ],
  'complete': [
    {
      name: 'Patricia V.',
      treatmentType: 'Ketamine Therapy',
      referringPhysician: 'Dr. Michelle Lee, MD',
      insuranceStatus: 'verified' as const,
      paStatus: 'approved' as const,
      intakeStatus: 'complete' as const,
      consentStatus: 'signed' as const,
      nextAction: 'Schedule Follow-up',
      assignedStaff: 'Chris D.',
      appointmentDate: 'Completed Mar 24, 2026',
    },
  ],
};

export default function DashboardPage() {
  const [activeStage, setActiveStage] = useState('new-referral');

  const currentPatients = mockPatients[activeStage as keyof typeof mockPatients] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 backdrop-blur-md bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5">
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent">
              Scriptish
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">Sunny Valley Infusion Clinic</p>
                <p className="text-xs text-foreground/60">NPI: 1234567890</p>
              </div>
              <button className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                Settings
              </button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Patient Pipeline</h1>
          <p className="text-foreground/60">Manage your clinic's patient referrals and appointments</p>
        </div>

        {/* Alerts Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Urgent Actions</h2>
          <AlertsSection alerts={mockAlerts} />
        </div>

        {/* Pipeline Stages */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Patient Pipeline Board</h2>

          {/* Stage Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2">
            {pipelineStages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-shrink-0 ${
                  activeStage === stage.id
                    ? 'bg-brand text-white shadow-lg shadow-brand/30'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {stage.label}
                <span className="ml-2 text-xs bg-foreground/20 px-2 py-1 rounded">
                  {mockPatients[stage.id as keyof typeof mockPatients]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Patient Cards Grid */}
          {currentPatients.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {currentPatients.map((patient, index) => (
                <PatientCard key={index} {...patient} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border/20">
              <p className="text-foreground/60 mb-4">No patients in this stage</p>
              <Button variant="outline" size="sm">
                Add New Referral
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border/20 rounded-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <button className="p-4 sm:p-6 rounded-lg border border-brand/30 bg-brand/5 hover:bg-brand/10 transition-colors text-center">
              <div className="text-3xl mb-3">➕</div>
              <p className="font-semibold text-sm sm:text-base text-foreground">Add New Referral</p>
            </button>
            <button className="p-4 sm:p-6 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors text-center">
              <div className="text-3xl mb-3">📋</div>
              <p className="font-semibold text-sm sm:text-base text-foreground">View Reports</p>
            </button>
            <button className="p-4 sm:p-6 rounded-lg border border-border/30 bg-muted/30 hover:bg-muted/50 transition-colors text-center">
              <div className="text-3xl mb-3">👥</div>
              <p className="font-semibold text-sm sm:text-base text-foreground">Manage Staff</p>
            </button>
            <button className="p-4 sm:p-6 rounded-lg border border-border/30 bg-muted/30 hover:bg-muted/50 transition-colors text-center">
              <div className="text-3xl mb-3">⚙️</div>
              <p className="font-semibold text-sm sm:text-base text-foreground">Settings</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
