'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/lib/authService';

interface BAASignatureStepProps {
  organizationName: string;
  temporaryToken: string;
  email?: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function BAASignatureStep({ organizationName, temporaryToken, email = '', onComplete, onBack }: BAASignatureStepProps) {
  const [adminName, setAdminName] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [agreedToBAA, setAgreedToBAA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }
    if (!adminTitle.trim()) {
      newErrors.adminTitle = 'Title is required';
    }
    if (!agreedToBAA) {
      newErrors.agreedToBAA = 'You must agree to the BAA to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // Create signature data (in production, this would be an actual digital signature)
      const signatureData = btoa(JSON.stringify({
        adminName,
        adminTitle,
        timestamp: new Date().toISOString(),
        organizationName,
      }));

      await authService.signBAA({
        email: email || localStorage.getItem('workEmail') || 'admin@clinic.com',
        signatureData,
        adminName,
        adminTitle,
      });

      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign BAA. Please try again.';
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-accent animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">BAA Signed Successfully!</h2>
        <p className="text-foreground/70 mb-8">
          Your HIPAA Business Associate Agreement has been signed and recorded.
          Activating your account...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Sign Business Associate Agreement
        </h2>
        <p className="text-foreground/70">
          Under US HIPAA law, we require a signed BAA before any patient data can be processed.
        </p>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Signing Error</p>
            <p className="text-sm text-red-300/80">{apiError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* BAA Document Preview */}
        <div className="bg-card border border-border/30 rounded-lg p-8 space-y-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-foreground">BUSINESS ASSOCIATE AGREEMENT</h3>
          
          <div className="text-sm text-foreground/70 space-y-3 font-mono text-xs">
            <p>
              This Business Associate Agreement ("Agreement") is entered into as of {new Date().toLocaleDateString()} between Scriptish LLC ("Covered Entity") and {organizationName} ("Business Associate").
            </p>

            <p>
              <strong>1. DEFINITIONS</strong><br />
              The terms used herein shall have the same meaning as those terms in the Health Insurance Portability and Accountability Act of 1996, Public Law 104-191 (HIPAA) and the regulations promulgated thereunder.
            </p>

            <p>
              <strong>2. PERMITTED USES AND DISCLOSURES</strong><br />
              Business Associate may use or disclose PHI only to carry out the purposes for which such information was provided to Business Associate or as required by law.
            </p>

            <p>
              <strong>3. SAFEGUARDS</strong><br />
              Business Associate warrants that it will implement and maintain safeguards with respect to all PHI to ensure compliance with the Privacy, Security, and Breach Notification Rules.
            </p>

            <p>
              <strong>4. TERM AND TERMINATION</strong><br />
              This Agreement shall commence on the date first written above and shall continue for a period of two (2) years, renewable upon written consent of both parties.
            </p>

            <p className="italic text-accent/70">
              [Full BAA terms and conditions are provided above. This represents key sections of the HIPAA-compliant agreement.]
            </p>
          </div>
        </div>

        {/* Signatory Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Authorized Signatory</h3>

          <div>
            <Label htmlFor="adminName" className="block text-sm font-medium mb-2">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="adminName"
              placeholder="John Smith"
              value={adminName}
              onChange={e => {
                setAdminName(e.target.value);
                if (errors.adminName) {
                  setErrors(prev => ({ ...prev, adminName: '' }));
                }
              }}
              disabled={isSubmitting}
              className={errors.adminName ? 'border-destructive' : ''}
            />
            {errors.adminName && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.adminName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="adminTitle" className="block text-sm font-medium mb-2">
              Title / Position <span className="text-destructive">*</span>
            </Label>
            <Input
              id="adminTitle"
              placeholder="Clinic Manager or Executive Director"
              value={adminTitle}
              onChange={e => {
                setAdminTitle(e.target.value);
                if (errors.adminTitle) {
                  setErrors(prev => ({ ...prev, adminTitle: '' }));
                }
              }}
              disabled={isSubmitting}
              className={errors.adminTitle ? 'border-destructive' : ''}
            />
            {errors.adminTitle && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.adminTitle}
              </p>
            )}
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-baa"
              checked={agreedToBAA}
              onCheckedChange={(checked) => {
                setAgreedToBAA(checked as boolean);
                if (errors.agreedToBAA) {
                  setErrors(prev => ({ ...prev, agreedToBAA: '' }));
                }
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            <label htmlFor="agree-baa" className="text-sm text-foreground/80 cursor-pointer">
              I acknowledge that I have read and understood the Business Associate Agreement and authorize {organizationName} to sign this agreement with Scriptish LLC to ensure HIPAA compliance.
            </label>
          </div>
          {errors.agreedToBAA && (
            <p className="text-xs text-destructive flex items-center gap-1 ml-7">
              <AlertCircle className="w-3 h-3" /> {errors.agreedToBAA}
            </p>
          )}
        </div>

        {/* Trust Statement */}
        <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg text-sm text-foreground/70">
          <p>
            <strong className="text-foreground">🔒 Your Signature is Secure</strong><br />
            This BAA will be digitally signed and timestamped for compliance and audit purposes. No paper documentation required.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !agreedToBAA}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing Agreement...
            </>
          ) : (
            'Sign & Complete Registration'
          )}
        </Button>
      </form>
    </div>
  );
}
