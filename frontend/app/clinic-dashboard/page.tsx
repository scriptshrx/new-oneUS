'use client';

import { useClinicDashboardView } from '@/components/ClinicDashboardLayout';
import OverviewView from '@/components/clinic-dashboard/OverviewView';
import PatientsView from '@/components/clinic-dashboard/PatientsView';
import PatientListView from '@/components/clinic-dashboard/PatientListView';
import PatientIntakeForm from '@/components/clinic-dashboard/PatientIntakeForm';
import AnalyticsView from '@/components/clinic-dashboard/AnalyticsView';
import SettingsView from '@/components/clinic-dashboard/SettingsView';

export default function ClinicDashboardPage() {
  const { currentView, setCurrentView, patients, patientsError, patientsLoading} = useClinicDashboardView();

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
        onBack={() => setCurrentView('overview')}
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
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'settings') {
    return <SettingsView onBack={() => setCurrentView('overview')} />;
  }

  return <OverviewView onBack={() => setCurrentView('overview')} />;
}
