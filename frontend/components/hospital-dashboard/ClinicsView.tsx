'use client';

import { useDashboardView } from '@/components/HospitalDashboardLayout';
import { MapPin, Users, Phone, Mail, Globe, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ClinicsView() {
  const { clinics, loadingClinics } = useDashboardView();

  if (loadingClinics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-foreground/60">Loading clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Partner Clinics</h1>
        <p className="text-foreground/60">
          Manage and view all partner clinics in the network
        </p>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics && clinics.length > 0 ? (
          clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-secondary/10 border border-border/30 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointeoor hover:shadow-lg"
            >
              {/* Clinic Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-accent mb-1">
                  {clinic.name}
                </h3>
                <p className="text-xs text-primary">
                  NPI: {clinic.npiNumber}
                </p>
              </div>

              {/* Clinic Details */}
              <div className="space-y-3">
                {/* Location */}
                {clinic.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-foreground/70">
                        {clinic.address}
                      </p>
                      <p className="text-foreground/50">
                        {clinic.city}, {clinic.state} {clinic.zipCode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {clinic.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary/60 flex-shrink-0" />
                    <a
                      href={`tel:${clinic.phoneNumber}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {clinic.phoneNumber}
                    </a>
                  </div>
                )}

                {/* Email */}
                {clinic.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary/60 flex-shrink-0" />
                    <a
                      href={`mailto:${clinic.email}`}
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {clinic.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {clinic.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary/60 flex-shrink-0" />
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {clinic.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-border/20" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {clinic.numberOfPatients || 0}
                  </p>
                  <p className="text-xs text-foreground/60">Active Patients</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {clinic.treatmentTypesOffered?.length || 0}
                  </p>
                  <p className="text-xs text-foreground/60">Treatment Types</p>
                </div>
              </div>

              {/* Treatment Types */}
              {clinic.treatmentTypesOffered && clinic.treatmentTypesOffered.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-foreground/60 mb-2">
                    Treatments:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {clinic.treatmentTypesOffered.slice(0, 3).map((treatment: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                      >
                        {treatment}
                      </span>
                    ))}
                    {clinic.treatmentTypesOffered.length > 3 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        +{clinic.treatmentTypesOffered.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full bg-secondary/50 border border-border/30 rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/60 mb-2">
              No clinics found
            </h3>
            <p className="text-sm text-foreground/40">
              Partner clinics will appear here once they join the network
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
