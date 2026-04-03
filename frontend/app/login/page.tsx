'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/authService';
import { Loader2, AlertCircle } from 'lucide-react';
import { getMaxListeners } from 'events';
import { resolve } from 'path';

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
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '480px', padding: '0 24px' }}>
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
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
              textTransform: 'uppercase' as const,
              color: '#818cf8',
              fontFamily: "'Courier New', monospace",
            }}
          >
            In Progress
          </span>
        </div>
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
              backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            Ongoing
          </span>
        </h1>
        <p
          style={{
            color: 'rgba(148,163,184,0.75)',
            fontSize: '15px',
            lineHeight: '1.7',
            marginBottom: '40px',
          }}
        >
          This page is currently being built. Check back soon ~ Engr. Mark.
        </p>
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

export default function LoginPage() {
  const cardRef = useRef(null)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setAuthorized(user !== 'ezehmark');
  }, []);

  if (authorized === null) return null;
  if (!authorized) return <DevOngoingScreen />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      const response = await authService.login({
        email,
        password,
      });


      console.log('Response data for this login:',JSON.stringify(response));
      console.log('Admin eamil:',response.user.email);
     
      // Check if user is authorized
      if(response.user.email !== 'bytance@clinic.com' && response.user.email !== 'ezehmark5@bytpay.com'){
        router.push('/under-construction');
        return;
      }

      // Store tenant information and route accordingly
      if (response.hospitalId) {
        localStorage.setItem('hospital', JSON.stringify(response.org));
        localStorage.setItem('hospitalAdmin',JSON.stringify(response.user))
      
        localStorage.setItem('accessToken',response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('tenantType', 'hospital');
        router.push('/hospital-dashboard');
      } else if (response.clinicId) {
        localStorage.setItem('clinicId', response.clinicId);
        localStorage.setItem('clinic',JSON.stringify(response.org));
        localStorage.setItem('accessToken',response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('clinicAdmin',JSON.stringify(response.user))
        localStorage.setItem('tenantType', 'clinic');
        router.push('/clinic-dashboard');
      } else {
        // Fallback to dashboard if neither tenant type is present
        router.push('/dashboard');
      }
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  
  return (
    <>
   
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-primary/10 flex flex-col">
      <div className="flex items-center justify-center px-4 py-24 sm:py-16">
          <Link href="/" className="text-xl moveBg absolute top-4 left-4 sm:text-2xl font-bold bg-gradient-to-r from-primary/10 via-primary/80 to-primary/10 text-transparent bg-clip-text ">
              Scriptish
            </Link>

        <div className="w-full max-w-md">
          <div 
          class='cardClass'
          ref={cardRef}
          className="bg-gradient-to-tr from-card via-card to-primary/10 border border-border/20 rounded-[20px] p-8 sm:p-10  shadow-lg"
        >
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-accent mb-2">Welcome back</h1>
              <p className="text-primary/90 text-sm sm:text-base">Sign in to your Scriptish account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">Login Error</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinic@example.com"
                  value={email}
                  onChange={(e) => {setEmail(e.target.value);
                    // console.log('Typing event:',e.target)
                    if(cardRef.current)
                      {cardRef.current.classList.add('pushShadow');
                        setTimeout(()=>
                        cardRef.current.classList.remove('pushShadow'),400)
                    }
                    
                  }}
                  className="w-full h-10 sm:h-11 bg-background/50"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs sm:text-sm text-primary hover:text-brand/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value);
                    if(cardRef.current)
                      {cardRef.current.classList.add('pushShadow');
                        setTimeout(()=>
                          cardRef.current.classList.remove('pushShadow'),400)
                    }}}
                    className="w-full h-10 sm:h-11 bg-background/50 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-6.4 0-10-8-10-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c6.4 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full h-11 sm:h-12 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-foreground/80">{"Don't have an account?"}</span>
                </div>
              </div>

              <Link href="/register" className="w-full block">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-11 sm:h-12 bg-accent/50 text-white hover:bg-accent"
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </Link>
            </form>
          </div>

          <p className="text-center text-xs sm:text-sm text-foreground/50 mt-6">
            Need help? Contact{' '}
            <a href="mailto:support@scriptish.com" className="text-brand hover:text-brand/80 transition-colors">
              support@scriptish.com
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}