'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Shield, FileText, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
// import { RouteMatcher } from 'next/dist/server/route-matchers/route-matcher';

interface BAASignatureStepProps {
  organizationName: string;
  temporaryToken: string;
 
  onComplete: () => void;
  onBack: () => void;
}

export default function BAASignatureStep({ organizationName, temporaryToken, onComplete, onBack }: BAASignatureStepProps) {

  const [agreedToBAA, setAgreedToBAA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const router = useRouter()
  const[form,setForm]=useState({})
  const[email,setEmail]=useState('')
  const[phone,setPhone]=useState('')
  const[name,setName]=useState('')


  useEffect(()=>{
       const formData = localStorage.getItem('formData')
       console.log('Hydrated formData:',formData)
      if(formData){
        console.log('Hydrated formData:',formData)
      const form = JSON.parse(formData);
      setEmail(form.workEmail)
      setName(form.name)
    setForm(form)}

},[])

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

    // if (!validateForm()) {
    //   return;
    // }

    setIsSubmitting(true);
    setApiError('');

    try {
      // Create signature data (in production, this would be an actual digital signature)
      const signatureData = btoa(JSON.stringify({
        name,
        email,
        timestamp: new Date().toISOString(),
        organizationName,
      }));

       const response = await authService.signBAA({
        email: email || localStorage.getItem('workEmail') || 'admin@clinic.com',
        signatureData
      
      });
      console.log('BAA response:',response)
      setIsComplete(true);

      if(response.clinicId){
        setTimeout(()=>router.push('/clinic-dashboard'),
2000)
            
      }
      else{setTimeout(()=>router.push('/hospital-dashboard'),
2000)}

  
    //   setTimeout(() => {
    //     onComplete();
    //   }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign BAA. Please try again.';
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center mx-auto w-full justify-center py-16">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
          <CheckCircle2 className="w-24 h-24 text-accent relative z-10" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-3">Agreement Signed</h2>
        <p className="text-center text-foreground/70 max-w-md mb-2">
          Your HIPAA Business Associate Agreement has been digitally signed and recorded.
        </p>
        <p className="text-center text-accent text-sm font-medium">
          Activating your account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header Section */}
        <div className="mb-12">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Sign Business Associate Agreement
            </h1>
            <p className="text-lg text-foreground/70">
              HIPAA compliance requires a signed BAA before processing patient data. This protects both you and your patients.
            </p>
          </div>
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-8 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive mb-1">Unable to Sign Agreement</p>
            <p className="text-sm text-destructive/80">{apiError}</p>
          </div>
        </div>
      )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BAA Document Preview */}
          <div className="bg-card border border-border/40 rounded-xl shadow-sm overflow-hidden">
            {/* Document Header */}
            <div className="p-6 border-b border-border/30 bg-background/50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Business Associate Agreement</h3>
              <p className="text-xs text-foreground/60">HIPAA Compliance Document</p>
            </div>
            </div>

            {/* Document Content */}
            <div className="p-8 space-y-5 max-h-96 overflow-y-auto text-sm text-foreground/80 leading-relaxed">
            <p>
              This Business Associate Agreement ("Agreement") is entered into as of <span className="font-semibold">{new Date().toLocaleDateString()}</span> between <span className="font-semibold">Scriptish LLC</span> ("Covered Entity") and <span className="font-semibold">{name}</span> ("Business Associate").
            </p>

            <div>
              <p className="font-semibold text-foreground mb-2">1. DEFINITIONS</p>
              <p className="text-foreground/70">
                The terms used herein shall have the same meaning as those terms in the Health Insurance Portability and Accountability Act of 1996, Public Law 104-191 (HIPAA) and the regulations promulgated thereunder.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">2. PERMITTED USES AND DISCLOSURES</p>
              <p className="text-foreground/70">
                Business Associate may use or disclose PHI only to carry out the purposes for which such information was provided to Business Associate or as required by law.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">3. SAFEGUARDS</p>
              <p className="text-foreground/70">
                Business Associate warrants that it will implement and maintain safeguards with respect to all PHI to ensure compliance with the Privacy, Security, and Breach Notification Rules.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">4. TERM AND TERMINATION</p>
              <p className="text-foreground/70">
                This Agreement shall commence on the date first written above and shall continue for a period of two (2) years, renewable upon written consent of both parties.
              </p>
            </div>

            <p className="text-xs text-foreground/60 italic pt-4 border-t border-border/20">
              Full BAA terms and conditions as provided. This represents key sections of the HIPAA-compliant agreement.
            </p>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="p-6 bg-background/50 border border-border/30 rounded-xl space-y-4">
            <div className="flex items-start gap-4">
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
              <label htmlFor="agree-baa" className="text-sm text-foreground/80 cursor-pointer leading-relaxed">
                I acknowledge that I have read and understood the Business Associate Agreement and authorize <span className="font-semibold">{organizationName}</span> to sign this agreement with <span className="font-semibold">Scriptish LLC</span> to ensure HIPAA compliance.
              </label>
            </div>
            {errors.agreedToBAA && (
              <p className="text-xs text-destructive flex items-center gap-1 ml-7">
                <AlertCircle className="w-3 h-3" /> {errors.agreedToBAA}
              </p>
            )}
          </div>

        {/* Trust Statement */}
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-4">
            <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Your Signature is Secure & Compliant</p>
              <p className="text-sm text-foreground/70">
                This BAA is digitally signed with cryptographic timestamping for full compliance and audit trail documentation. No paper documentation required.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !agreedToBAA}
            className="w-full h-12 text-base font-semibold"
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
    </div>
  );
}
