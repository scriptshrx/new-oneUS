'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TicketCheck } from 'lucide-react';
import ReferralCreationForm from '@/components/registration/ReferralCreationForm';
import { useDashboardView } from '@/components/HospitalDashboardLayout';

interface ReferralsViewProps {
  onBack?: () => void;
}

export default function ReferralsView({ onBack }: ReferralsViewProps) {
  const [showForm, setShowForm] = useState(true);
  const { clinics } = useDashboardView();

  const handleBack = () => {
    setShowForm(false);
  };

  // Transform clinics to clinic partners format for the form
  const clinicPartners = clinics.map(clinic => ({
    id: clinic.id,
    name: clinic.name,
  }));

  return (
    <>
      {/* Header */}


      <div className="border-b border-border/30 bg-primary/5 rounded-b-[10px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-500 ease-in-out hover:bg-primary/6">
          <div className="flex items-center gap-3 mb-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-accent" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-accent">Refer Patients</h1>
          </div>
          <p className="text-foreground/75">
            Submit a patient referral to one of your partner clinics
          </p>
        </div>
      </div>

      {/* Content */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-500 ease-in-out hover:bg-primary/6">
        {showForm ? (
          <ReferralCreationForm
            hospitalId="hospital_123"
            clinicPartners={clinicPartners}
            onBack={() => {
              setShowForm(false);
            }}
          />
        ) : (
          <div className="bg-primary/10 border border-border/30 rounded-2xl p-12 text-center">




            <div className=" mx-auto w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mb-4 transition-all duration-500 ease-in-out hover:bg-accent/90">
              <div
                style={{
                  animation: 'border-color 5s infinite alternate',
                }}
                className="text-[40px] font-bold items-center justify-center flex text-center text-green-400"
              >
                ✓
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Referral Submitted</h2>
            <p className="text-foreground/75 mb-6">
              Your referral has been successfully submitted to the clinic.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-6 py-2 cursor-pointer bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors"
            >
              Create Another
            </button>
          </div>
        )}
      </div>
    </>
  );
}

@keyframes border-color {
  from {
    border-color: #4caf50;
  }
  
  to {
    border-color: #f44336;
  }
}
