'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2Icon } from 'lucide-react';
import Link from 'next/link';

interface SuccessScreenProps {
  email: string;
}

export default function SuccessScreen({ email }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] text-center">
      <div className="mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center">
          <CheckCircle2Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
        Account Created Successfully!
      </h2>

      <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-6 sm:mb-8">
        Welcome to Scriptish. A confirmation email has been sent to{' '}
        <span className="text-foreground font-semibold">{email}</span>. Please verify your email to get started.
      </p>

      <div className="space-y-3 sm:space-y-4 w-full max-w-xs mb-8 sm:mb-12">
        <div className="flex items-center gap-3 text-left bg-card/50 border border-border/20 rounded-lg p-4">
          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2Icon className="w-4 h-4 text-brand" />
          </div>
          <p className="text-sm text-foreground">Check your email for verification link</p>
        </div>

        <div className="flex items-center gap-3 text-left bg-card/50 border border-border/20 rounded-lg p-4">
          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand">2</span>
          </div>
          <p className="text-sm text-foreground">Complete email verification</p>
        </div>

        <div className="flex items-center gap-3 text-left bg-card/50 border border-border/20 rounded-lg p-4">
          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand">3</span>
          </div>
          <p className="text-sm text-foreground">Access your Scriptish dashboard</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-xs">
        <Button variant="outline" size="lg" asChild className="flex-1">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="default" size="lg" asChild className="flex-1">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-12">
        Didn't receive an email?{' '}
        <button className="text-brand hover:underline font-semibold">
          Resend verification
        </button>
      </p>
    </div>
  );
}
