'use client';

import { Building2, ArrowRight, Syringe, LucideSyringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TenantTypeSelectionProps {
  onSelect: (type: 'clinic' | 'referring-hospital') => void;
}

export default function TenantTypeSelection({ onSelect }: TenantTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'clinic' | 'referring-hospital' | null>(null);

  const handleSelect = (type: 'clinic' | 'referring-hospital') => {
    setSelectedType(type);
    setTimeout(() => {
      onSelect(type);
    }, 300);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
          Get Started with Scriptish
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose your organization type to begin your registration. We'll tailor your setup to your specific workflow.
        </p>
      </div>

      {/* Two-Column Selection */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* Clinic Option */}
        <button
          onClick={() => handleSelect('clinic')}
          className={`group relative p-8 -mx-6 sm:-mx-0 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
            selectedType === 'clinic'
              ? 'border-accent bg-gray-900 shadow-lg shadow-accent/20'
              : 'border-border/30  hover:border-primary/90 hover:bg-primary/40 bg-primary/10 '
          }`}
        >
          {/* Glow effect on hover/select */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            selectedType === 'clinic' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`}
            style={{
              background: 'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all ${
              selectedType === 'clinic'
                ? 'bg-accent/20 border border-accent'
                : 'bg-primary/80 border border-accent/20 group-hover:border-accent'
            }`}>
              <LucideSyringe className={`w-8 h-8 transition-colors ${
                selectedType === 'clinic' ? 'text-white/80' : 'text-white'
              }`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-accent mb-3 text-left">
              Infusion Clinic
            </h2>

            {/* Description */}
            <p className="text-foreground/70 text-sm mb-6 text-left leading-relaxed">
              In-house infusion center with treatment rooms or infusion chairs. Manage patient appointments, insurance verification, and treatment delivery in one platform.
            </p>

            {/* Features */}
            <ul className="space-y-2 mb-8 text-left">
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Patient management dashboard</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Insurance verification & PA</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Appointment scheduling</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Treatment delivery & follow-up</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="flex items-center gap-2 text-primary font-bold group-hover:translate-x-1 transition-transform">
              <span>Register Clinic</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Referring Hospital Option */}
        <button
          onClick={() => handleSelect('referring-hospital')}
          className={`group relative p-8 -mx-6 sm:-mx-0 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
            selectedType === 'referring-hospital'
              ? 'border-accent bg-gray-900 shadow-lg shadow-accent/20'
              : 'border-border/30  hover:border-primary/90 hover:bg-primary/40 bg-primary/10 '
          }`}
        >
          {/* Glow effect on hover/select */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            selectedType === 'referring-hospital' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`}
            style={{
              background: 'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all ${
              selectedType === 'referring-hospital'
                ? 'bg-accent/20 border border-accent'
                : 'bg-primary/80 border border-accent/20 group-hover:border-accent'
            }`}>
              <Building2 className={`w-8 h-8 transition-colors ${
                selectedType === 'referring-hospital' ? 'text-white/80' : 'text-white'
              }`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-accent mb-3 text-left">
              Referring Hospital
            </h2>

            {/* Description */}
            <p className="text-foreground/70 text-sm mb-6 text-left leading-relaxed">
              Hospital or medical facility that refers infusion patients. Submit patient referrals with clinical & insurance data. Scriptish handles verification and PA processing.
            </p>

            {/* Features */}
            <ul className="space-y-2 mb-8 text-left">
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Submit patient referrals</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Insurance verification</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Prior authorization tracking</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Real-time patient status updates</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="flex items-center gap-2 text-primary font-bold group-hover:translate-x-1 transition-transform">
              <span>Register Hospital</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Trust Statement */}
      <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-accent/10">
        <p className="text-center text-sm text-primary/80">
          <span className="font-semibold text-primary">🔒 HIPAA Compliant</span> • All your information is encrypted and protected.<br />
          <span className="font-semibold text-primary">✓ USA Infusion Clinics Only</span> • We serve USA-based organizations exclusively.
        </p>
      </div>
    </div>
  );
}
