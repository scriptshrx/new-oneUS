'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useClinicDashboardView } from '@/components/ClinicDashboardLayout';
import OverviewView from '@/components/clinic-dashboard/OverviewView';
import PatientsView from '@/components/clinic-dashboard/PatientsView';
import PatientListView from '@/components/clinic-dashboard/PatientListView';
import PatientIntakeForm from '@/components/clinic-dashboard/PatientIntakeForm';
import AnalyticsView from '@/components/clinic-dashboard/AnalyticsView';
import SettingsView from '@/components/clinic-dashboard/SettingsView';
import AIConciergeComingSoon from '@/components/clinic-dashboard/AIConciergeComingSoon';

export default function ClinicDashboardPage() {
  const router = useRouter();
  const { currentView, setCurrentView, patients, patientsError, patientsLoading} = useClinicDashboardView();

  // Handle logout
  useEffect(() => {
    if (currentView === 'logout') {
      localStorage.removeItem('clinic');
     
      router.push('/login');
    }
  }, [currentView, router]);

  // Render different views based on currentView state
  if (currentView === 'dashboard') {
    return <OverviewView onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'intakeForm') {
    return (
      <PatientIntakeForm
        onBack={() => setCurrentView('patients')}
      />
    );
  }

  if (currentView === 'analytics') {
    return (
      <AnalyticsView
        patients={patients}
        patientsError={patientsError}
        patientsLoading={patientsLoading}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'patientsList') {
    return (
      <PatientListView
        patients={patients}
        patientsError={patientsError}
        patientsLoading={patientsLoading}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'patients') {
    return (
      <PatientsView
        patients={patients}
        patientsError={patientsError}
        patientsLoading={patientsLoading}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'archives') {
    return (
      <PatientsView
        patients={patients}
        patientsError={patientsError}
        patientsLoading={patientsLoading}
        archivedOnly
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'settings') {
    return <SettingsView onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'subscriptions') {
    return <AIConciergeComingSoon featureName="Subscriptions" onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'voiceAgents') {
    return <AIConciergeComingSoon featureName="Voice Agents" onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'knowledgeBase') {
    return <AIConciergeComingSoon featureName="Knowledge Base" onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'automatedSMS') {
    return <AIConciergeComingSoon featureName="Automated SMS" onBack={() => setCurrentView('dashboard')} />;
  }

  return <OverviewView onBack={() => setCurrentView('dashboard')} />;
}
