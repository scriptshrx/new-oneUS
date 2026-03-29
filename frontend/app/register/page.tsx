'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';
import TenantTypeSelection from '@/components/registration/TenantTypeSelection';
import ClinicRegistrationForm from '@/components/registration/ClinicRegistrationForm';
import ReferringHospitalRegistrationForm from '@/components/registration/ReferringHospitalRegistrationForm';
import EmailVerificationStep from '@/components/registration/EmailVerificationStep';
import { routerServerGlobal } from 'next/dist/server/lib/router-utils/router-server-context';
import { useRouter } from 'next/navigation';

type TenantType = 'clinic' | 'referring-hospital' | null;
type RegistrationStep = 'type-selection' | 'form' | 'email-verification';

interface RegistrationState {
  tenantType: TenantType;
  step: RegistrationStep;
  formData: Record<string, any>;
  hospitalId?: string;
}



export default function RegisterPage() {
  const [state, setState] = useState<RegistrationState>({
    tenantType: null,
    step: 'type-selection',
    formData: {},
  });
    const router = useRouter();

  const handleTenantTypeSelect = (type: TenantType) => {
    setState(prev => ({
      ...prev,
      tenantType: type,
      step: 'form',
    }));
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    const hospitalId = data.hospitalId;
   
    setState(prev => ({
      ...prev,
      ...data,
      hospitalId,
      step: 'form', // Change to email-verification later
    }));

    // Route immediately based on tenant type instead of waiting for state update
    if (state.tenantType === 'referring-hospital') {
      router.push('/hospital-dashboard');
    } else if (state.tenantType === 'clinic') {
      window.location.href = '/clinic-dashboard';
    }
  };



  const handleEmailVerified = () => {
    // After email verification, redirect to success or next step
    if (state.tenantType === 'referring-hospital') {
      router.push('/hospital-dashboard');
    } else if (state.tenantType === 'clinic') {
      window.location.href = '/clinic-dashboard';
    }
  };

  const handleBackClick = () => {
    setState(prev => {
      if (prev.step === 'form') {
        return {
          ...prev,
          step: 'type-selection',
          tenantType: null,
        };
      }
      return prev;
    });
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <TopNav />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {/* Step 1: Type Selection */}
              <div className={`flex flex-col items-center ${state.step !== 'type-selection' ? 'opacity-50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  state.step === 'type-selection' ? 'bg-accent text-background' : 
                  state.step === 'form' ? 'bg-accent/30 text-accent border border-accent' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-xs mt-2 text-foreground/60">Register Type</span>
              </div>

              <div className={`w-6 sm:w-8 h-0.5 ${state.step === 'form' || state.step === 'email-verification' ? 'bg-accent/30' : 'bg-muted'}`} />

              {/* Step 2: Form */}
              <div className={`flex flex-col items-center ${state.step !== 'form' && state.step !== 'email-verification' ? 'opacity-50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  state.step === 'form' || state.step === 'email-verification' ? 'bg-accent/30 text-accent border border-accent' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-foreground/60">Details</span>
              </div>

              <div className={`w-6 sm:w-8 h-0.5 ${state.step === 'email-verification' ? 'bg-accent/30' : 'bg-muted'}`} />

              {/* Step 3: Email Verification */}
              <div className={`flex flex-col items-center ${state.step !== 'email-verification' ? 'opacity-50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  state.step === 'email-verification' ? 'bg-accent text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <span className="text-xs mt-2 text-foreground/60">Verify Email</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl p-8 sm:p-12 shadow-lg">
            {state.step === 'type-selection' && (
              <TenantTypeSelection onSelect={handleTenantTypeSelect} />
            )}

            {state.step === 'form' && state.tenantType === 'clinic' && (
              <ClinicRegistrationForm onSubmit={handleFormSubmit} onBack={handleBackClick} />
            )}

            {state.step === 'form' && state.tenantType === 'referring-hospital' && (
              <ReferringHospitalRegistrationForm onSubmit={handleFormSubmit} onBack={handleBackClick} />
            )}

            {state.step === 'email-verification' && (
              <EmailVerificationStep
                email={state.formData?.workEmail || state.formData?.email || ''}
                temporaryToken={state.formData?.temporaryToken || ''}
                onVerified={handleEmailVerified}
                onBack={handleBackClick}
              />
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-foreground/60 text-sm">
            <p>Already have an account? <a href="/login" className="text-accent hover:text-accent/80 transition-colors font-medium">Sign in here</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}