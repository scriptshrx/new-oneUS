'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface AccountSetupFormProps {
  onNext: (data: AccountData) => void;
  onBack: () => void;
}

export interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function AccountSetupForm({ onNext, onBack }: AccountSetupFormProps) {
  const [formData, setFormData] = useState<AccountData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<AccountData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<AccountData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9\s\-\(\)]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="firstName" className="text-base font-semibold mb-2 block">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="h-10 sm:h-11"
          />
          {errors.firstName && (
            <p className="text-destructive text-sm mt-1">{errors.firstName as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="text-base font-semibold mb-2 block">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="h-10 sm:h-11"
          />
          {errors.lastName && (
            <p className="text-destructive text-sm mt-1">{errors.lastName as string}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-base font-semibold mb-2 block">
          Work Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@clinic.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="h-10 sm:h-11"
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">{errors.email as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="text-base font-semibold mb-2 block">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="h-10 sm:h-11"
        />
        {errors.phone && (
          <p className="text-destructive text-sm mt-1">{errors.phone as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-base font-semibold mb-2 block">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-10 sm:h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm mt-1">{errors.password as string}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Must be 8+ characters with uppercase, lowercase, and numbers
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-base font-semibold mb-2 block">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="h-10 sm:h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-sm mt-1">{errors.confirmPassword as string}</p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, agreeToTerms: checked as boolean })
          }
        />
        <Label htmlFor="agreeToTerms" className="font-normal cursor-pointer text-sm">
          I agree to Scriptish{' '}
          <a href="/legal" className="text-brand hover:underline">
            Terms of Service
          </a>
          ,{' '}
          <a href="/legal" className="text-brand hover:underline">
            Privacy Policy
          </a>
          , and{' '}
          <a href="/legal" className="text-brand hover:underline">
            HIPAA Notice
          </a>
        </Label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-destructive text-sm ml-7">{errors.agreeToTerms as string}</p>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="default" size="lg" className="flex-1">
          Create Account
        </Button>
      </div>
    </form>
  );
}
