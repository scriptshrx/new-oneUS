'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      // In a real app, this would authenticate with your backend
      setIsLoading(false);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-primary/10 flex flex-col">
      {/* Header */}
   

      {/* Main Content */}
      <div className=" flex items-center justify-center px-4 py-24 sm:py-16">
         
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text top-8 left-8 absolute text-transparent">
            Scriptish
          </Link>
        
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-gradient-to-tr from-card via-card to-primary/10 border border-border/20 rounded-[20px] p-8 sm:p-10 shadow-lg">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-accent mb-2">Welcome back</h1>
              <p className="text-primary/90 text-sm sm:text-base">Sign in to your Scriptish clinic account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinic@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 sm:h-11 bg-background/50"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 sm:h-11 bg-background/50 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" fill="var(--bg)" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full h-11 sm:h-12 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full  h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-foreground/80">Don't have an account?</span>
                </div>
              </div>

              {/* Sign Up Link */}
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

          {/* Help Text */}
          <p className="text-center text-xs sm:text-sm text-foreground/50 mt-6">
            Need help? Contact{' '}
            <a href="mailto:support@scriptish.com" className="text-brand hover:text-brand/80 transition-colors">
              support@scriptish.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
