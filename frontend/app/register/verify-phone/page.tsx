'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { authService } from '@/lib/authService';
import { routerServerGlobal } from 'next/dist/server/lib/router-utils/router-server-context';
import { useRouter, useSearchParams } from 'next/navigation';

interface PhoneVerificationStepProps {

  temporaryToken: string;

  onVerified: () => void;
 
  onBack: () => void;
}

function PhoneVerificationContent({temporaryToken, onVerified, onBack }: PhoneVerificationStepProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const router =  useRouter()
  const searchParams = useSearchParams();

const[isResending,setIsResending]=useState(false);
const[clinic,setClinic]=useState(null)

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
        setPhone(form.primaryPhone)
        setName(form.name)
    }
  const clinicData = localStorage.getItem('clinic');
  if(clinicData){
    const clinicObj = JSON.parse(clinicData);
setClinic(clinicObj);
console.log('clinic set for verification',clinicObj)
  }
},[])

useEffect(() => {
  const codeFromUrl = searchParams.get('code');
  if (codeFromUrl) {
    setVerificationCode(codeFromUrl);
  }
}, [searchParams]);

useEffect(() => {
  if (verificationCode && verificationCode.length === 6 && email && !isSubmitting) {
    const autoSubmit = async () => {
      setIsSubmitting(true);
      setError('');

      try {
        const response = await authService.verifyEmail({
          email,
          verificationCode,
        });

        console.log('Email verification response:', response);
        if (response.nextStep === 'SIGN_BAA') {
          router.push('/register/signBAA');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
        setError(errorMessage);
        setIsSubmitting(false);
      }
    };

    autoSubmit();
  }
}, [verificationCode, email, isSubmitting, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //mock-up successful verification
    
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
     const response =  await authService.verifyEmail({
        email,
        verificationCode,

      });

      console.log('Email verification response:',response);
      if(response.nextStep==='SIGN_BAA'){

        router.push('/register/signBAA')
        
      }

      // setIsVerified(true);
      // setTimeout(() => {
      //   onVerified();
      // }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
 
    
      await authService.resendVerificationCode({email,name,phone});
      setIsResending(false)
      setError(''); // Clear error on success
    } catch (err) {
      console.log('ERR:',err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsResending(false)
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Back Button */}
      {!isVerified && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      {isVerified ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-accent animation-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Email Verified!</h2>
          <p className="text-foreground/70 mb-8">
            Your email address has been successfully verified.
            Proceeding to next step...
          </p>
        </div>
      ) : (
        <>
          {/* Headers */}
          <div className='flex flex-col gap-2 md:flex-row'>
            <div className='w-full md:w-[60%] md:border-r-[1px] border-r-0 border-accent/20 pr-8 md:mr-8'>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Verify Primary Phone Number
            </h2>
            <p className="text-foreground/70">
              We've sent a verification code to <span className="font-semibold text-foreground">{phone}</span>.
              Enter it below to continue.
            </p>

            {/* Info Box */}
          <div className="mt-8 p-4 bg-accent/5 border border-accent/10 rounded-lg text-sm text-foreground/70">
            <p>Check your SMS for the verification code. It expires in 30 minutes.</p>
          </div>
          </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full md:w-1/2">
            <div>
              <Label htmlFor="code" className="block text-sm font-medium mb-2">
                Verification Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={e => {
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                className={`text-center text-2xl tracking-widest ${error ? 'border-destructive' : ''}`}
              />
              {error && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            {/* Resend Link */}
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSubmitting}
                className="text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Didn\'t receive it? Resend code'}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isResending || !verificationCode}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Phone'
              )}
            </Button>
          </form></div>

          
        </>
      )}
    </div>
  );
}

export default function PhoneVerification(props: PhoneVerificationStepProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhoneVerificationContent {...props} />
    </Suspense>
  );
}
