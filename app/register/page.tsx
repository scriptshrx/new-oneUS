'use client';

import { useState } from 'react';
import SignupHeader from '@/components/SignupHeader';
import ProgressIndicator from '@/components/ProgressIndicator';
import ClinicInfoForm, { ClinicInfo } from '@/components/ClinicInfoForm';
import EligibilityForm, { EligibilityData } from '@/components/EligibilityForm';
import AccountSetupForm, { AccountData } from '@/components/AccountSetupForm';
import SuccessScreen from '@/components/SuccessScreen';

type Step = 1 | 2 | 3 | 4;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const stepLabels = ['Clinic Info', 'Eligibility', 'Account Setup', 'Confirmation'];

  const handleClinicInfoNext = (data: ClinicInfo) => {
    setClinicInfo(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEligibilityNext = (data: EligibilityData) => {
    setEligibilityData(data);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountSetupNext = (data: AccountData) => {
    setAccountData(data);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEligibility = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAccount = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SignupHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={4}
          stepLabels={stepLabels}
        />

        {/* Step Content */}
        <div className="bg-card border border-border/20 rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-10">
          {currentStep === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                Tell us about your clinic
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-10">
                Help us understand your clinic's needs and verify your eligibility for Scriptish.
              </p>
              <ClinicInfoForm onNext={handleClinicInfoNext} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                Eligibility Check
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-10">
                We need to confirm your clinic meets our platform requirements.
              </p>
              <EligibilityForm onNext={handleEligibilityNext} onBack={() => setCurrentStep(1)} />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                Create Your Account
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-10">
                Set up your admin account to access the Scriptish platform.
              </p>
              <AccountSetupForm onNext={handleAccountSetupNext} onBack={handleBackToEligibility} />
            </div>
          )}

          {currentStep === 4 && accountData && (
            <SuccessScreen email={accountData.email} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 sm:mt-12 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <a href="/login" className="text-brand hover:underline font-semibold">
              Log in here
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
