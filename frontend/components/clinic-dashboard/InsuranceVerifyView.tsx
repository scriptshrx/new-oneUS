'use client';

import PatientListView from './PatientListView';
import { useClinicDashboardView } from '../ClinicDashboardLayout';

export default function InsuranceVerifyView() {
  const { patients, patientsLoading, patientsError, clinic } = useClinicDashboardView();

  const isNewReferral = (stage?: string) => {
    if (!stage) return false;
    const normalized = stage.replace(/[-\s]/g, '_').toUpperCase();
    return normalized === 'NEW_REFERRAL';
  };

  const filtered = (patients || []).filter((p) => isNewReferral(p.pipelineStage));

  return (
    <PatientListView
      patients={filtered}
      insuranceOnly={true}
      patientsError={patientsError}
      patientsLoading={patientsLoading}
      clinicId={clinic?.id}
    />
  );
}
