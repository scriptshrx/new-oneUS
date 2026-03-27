'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';
import TenantTypeSelection from '@/components/registration/TenantTypeSelection';
import ClinicRegistrationForm from '@/components/registration/ClinicRegistrationForm';
import ReferringHospitalRegistrationForm from '@/components/registration/ReferringHospitalRegistrationForm';

type TenantType = 'clinic' | 'referring-hospital' | null;
type RegistrationStep = 'type-selection' | 'form';

interface RegistrationState {
  tenantType: TenantType;
  step: RegistrationStep;
  formData: Record<string, any>;
}

function DevOngoingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* Glowing orb */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: '480px',
          padding: '0 24px',
        }}
      >
        {/* Animated icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 32px',
            border: '1.5px solid rgba(99,102,241,0.5)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99,102,241,0.08)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(129,140,248,0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Status pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#818cf8',
              display: 'inline-block',
              animation: 'blink 1.4s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#818cf8',
              fontFamily: "'Courier New', monospace",
            }}
          >
            In Progress
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: '400',
            color: '#f8fafc',
            lineHeight: '1.2',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          Development
          <br />
          <span
            style={{
              color: 'transparent',
              backgroundImage:
                'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            Ongoing
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            color: 'rgba(148,163,184,0.75)',
            fontSize: '15px',
            lineHeight: '1.7',
            marginBottom: '40px',
            fontFamily: "'Georgia', serif",
          }}
        >
          This page is currently being built. Check back soon {'\n'}~ Engr. Mark.
        </p>

        {/* Divider */}
        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'rgba(99,102,241,0.4)',
            margin: '0 auto',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.0); }
          50% { box-shadow: 0 0 24px 4px rgba(99,102,241,0.18); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default function RegisterPage() {
  const [state, setState] = useState<RegistrationState>({
    tenantType: null,
    step: 'type-selection',
    formData: {},
  });

  const handleTenantTypeSelect = (type: TenantType) => {
    setState(prev => ({
      ...prev,
      tenantType: type,
      step: 'form',
    }));
  };

  const handleFormSubmit = (formData: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData,
    }));
    // TODO: Handle form submission - call API
    // Then redirect to email verification or success
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

              <div className={`w-6 sm:w-8 h-0.5 ${state.step === 'form' ? 'bg-accent/30' : 'bg-muted'}`} />

              {/* Step 2: Form */}
              <div className={`flex flex-col items-center ${state.step !== 'form' ? 'opacity-50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  state.step === 'form' ? 'bg-accent text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-foreground/60">Details</span>
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