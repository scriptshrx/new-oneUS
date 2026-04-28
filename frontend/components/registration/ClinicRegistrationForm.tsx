'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, AlertCircle, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { authService } from '@/lib/authService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface ClinicRegistrationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onBack: () => void;
}

interface FormData {
  name: string;
  npiNumber: string;
  taxId: string;
  stateLicenseNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  primaryPhone: string;
  workEmail: string;
  infusionChairCount: string;
  treatmentTypesOffered: string[];
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const TREATMENT_TYPES = [
  { id: 'IV_THERAPY', label: 'IV Therapy / Hydration' },
  { id: 'KETAMINE', label: 'Ketamine' },
  { id: 'NAD_PLUS', label: 'NAD+' },
  { id: 'BIOLOGIC', label: 'Biologic (Remicade, Rituxan, etc.)' },
  { id: 'ANTIBIOTIC', label: 'Antibiotic Infusion' },
  { id: 'HORMONE_TRT', label: 'Hormone / TRT' },
];

export default function ClinicRegistrationForm({ onSubmit, onBack }: ClinicRegistrationFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    npiNumber: '',
    taxId: '',
    stateLicenseNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    primaryPhone: '',
    workEmail: '',
    infusionChairCount: '',
    treatmentTypesOffered: [],
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const validateField = (fieldName: string, value: any): string | null => {
    const fieldLower = fieldName.toLowerCase();

    switch (fieldName) {
      case 'name':
        return !value?.trim() ? 'Clinic name is required' : null;
      
      case 'npiNumber':
        return !value ? 'NPI number is required' :
               !/^\d{10}$/.test(value.replace(/\D/g, '')) ? 'NPI must be 10 digits' : null;
      
      case 'taxId':
        return !value?.trim() ? 'Tax ID / EIN is required' :
               !/^\d{2}-\d{7}$/.test(value) ? 'Tax ID format: XX-XXXXXXX' : null;
      
      case 'stateLicenseNumber':
        return !value?.trim() ? 'State license number is required' : null;
      
      case 'streetAddress':
        return !value?.trim() ? 'Street address is required' : null;
      
      case 'city':
        return !value?.trim() ? 'City is required' : null;
      
      case 'state':
        return !value ? 'State is required' : null;
      
      case 'zipCode':
        return !value ? 'ZIP code is required' :
               !/^\d{5}(-\d{4})?$/.test(value) ? 'Invalid ZIP code format' : null;
      
      case 'primaryPhone':
        return !value?'Phone number is required':'' 
              //  !/^\d{3}-\d{3}-\d{4}$/.test(value) ? 'Phone format: XXX-XXX-XXXX' : null;
      
      case 'workEmail':
        return !value ? 'Work email is required' :
               !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' :
               /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|mail)\..+$/.test(value) ? 'Please use your clinic email, not personal email' : null;
      
      case 'infusionChairCount':
        const count = parseInt(value);
        return !value ? 'Infusion chair count is required' :
               isNaN(count) || count < 1 ? 'Must be at least 1 chair' :
               count > 100 ? 'Value seems too high, please verify' : null;
      
      case 'treatmentTypesOffered':
        return Array.isArray(value) && value.length > 0 ? null : 'Select at least one treatment type';
      
      case 'password':
        if (!value) {
          return 'Password is required';
        } else if (value.length < 8) {
          return 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          return 'Password must contain an uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          return 'Password must contain a lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          return 'Password must contain a number';
        }
        return null;
      
      case 'confirmPassword':
        return !value ? 'Please confirm your password' : 
               value !== (formData as any).password ? 'Passwords do not match' : null;
      
      default:
        return null;
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    if (touched.has(fieldName)) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || undefined,
      }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => new Set([...prev, fieldName]));
    const error = validateField(fieldName, formData[fieldName as keyof FormData]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined,
    }));
  };

  const handleTreatmentTypeToggle = (typeId: string) => {
    setFormData(prev => {
      const current = prev.treatmentTypesOffered;
      const updated = current.includes(typeId)
        ? current.filter(t => t !== typeId)
        : [...current, typeId];
      
      if (touched.has('treatmentTypesOffered')) {
        const error = validateField('treatmentTypesOffered', updated);
        setErrors(prev => ({
          ...prev,
          treatmentTypesOffered: error || undefined,
        }));
      }
      
      return {
        ...prev,
        treatmentTypesOffered: updated,
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const newTouched = new Set<string>();

    Object.keys(formData).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName as keyof FormData]);
      if (error) {
        newErrors[fieldName] = error;
        newTouched.add(fieldName);
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
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
      // Parse admin name from first/last if available, otherwise use clinic name
      const adminName = `${(formData as any).adminFirstName || 'Admin'} ${(formData as any).adminLastName || 'User'}`;

      // Extract first name from clinic admin info
      const adminFirstName = (formData as any).adminFirstName || formData.name.split(' ')[0];
      const adminLastName = (formData as any).adminLastName || 'Administrator';

      const registrationData = {
        eligibilityGate: {
          isUSAClinic: true,
          clinicType: 'IV_THERAPY', // Default, can be changed based on user selection
        },
        clinic: {
          name: formData.name,
          npiNumber: formData.npiNumber,
          taxId: formData.taxId,
          stateLicenseNumber: formData.stateLicenseNumber,
          address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          primaryPhone: formData.primaryPhone,
          workEmail: formData.workEmail,
          infusionChairCount: parseInt(formData.infusionChairCount),
          treatmentTypesOffered: formData.treatmentTypesOffered,
        },
        admin: {
          firstName: adminFirstName,
          lastName: adminLastName,
          password: formData.password,
        },
      };

     /* if(formData.workEmail.includes('jen')||formData.workEmail.includes('eze')||formData.workEmail.includes('j')||
    formData.workEmail.includes('scrip')|| formData.workEmail.includes('ne')||formData.workEmail.includes('lead')){
      router.push('/under-construction')
  
      return;
    }*/

      const response = await authService.registerClinic(registrationData);
     console.log('Registration of clinic successul:',response)

      
    /* if(response.email!=='scriptishrxapp@app.com'){
      router.push('/under-construction')
  
      return;
    }*/


      
      console.log('Clinic created', response);
      localStorage.setItem('clinic', JSON.stringify(response));

      // Call the onSubmit with the response data
      onSubmit({
        ...formData,
        clinicId: response.clinicId,
        temporaryToken: response.temporaryToken,
      });
    } catch (error: any) {
      // Prefer structured backend error message when available
      const errorMessage = error?.message || (error instanceof Error ? error.message : 'Registration failed. Please try again.');
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): boolean => {
    return touched.has(fieldName) && !!errors[fieldName];
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Registration Error</p>
            <p className="text-sm text-red-300/80">{apiError}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Clinic Information
        </h2>
        <p className="text-foreground/70">
          Enter your clinic details. All marked fields are required.
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Basic Information</h3>
          
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-2">
              Clinic Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Bright Infusion Clinic"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`${getFieldError('name') ? 'border-destructive' : ''}`}
            />
            {getFieldError('name') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="npiNumber" className="block text-sm font-medium mb-2">
                NPI Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="npiNumber"
                placeholder="10-digit NPI"
                maxLength={10}
                value={formData.npiNumber}
                onChange={e => handleChange('npiNumber', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('npiNumber')}
                className={`${getFieldError('npiNumber') ? 'border-destructive' : ''}`}
              />
              {getFieldError('npiNumber') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.npiNumber}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="taxId" className="block text-sm font-medium mb-2">
                Tax ID / EIN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taxId"
                placeholder="XX-XXXXXXX"
                value={formData.taxId}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  const formatted = val.length >= 9 ? `${val.slice(0, 2)}-${val.slice(2, 9)}` : val;
                  handleChange('taxId', formatted);
                }}
                onBlur={() => handleBlur('taxId')}
                className={`${getFieldError('taxId') ? 'border-destructive' : ''}`}
              />
              {getFieldError('taxId') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.taxId}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="stateLicenseNumber" className="block text-sm font-medium mb-2">
                State License # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stateLicenseNumber"
                placeholder="e.g., IL-12345"
                value={formData.stateLicenseNumber}
                onChange={e => handleChange('stateLicenseNumber', e.target.value)}
                onBlur={() => handleBlur('stateLicenseNumber')}
                className={`${getFieldError('stateLicenseNumber') ? 'border-destructive' : ''}`}
              />
              {getFieldError('stateLicenseNumber') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.stateLicenseNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Location</h3>
          
          <div>
            <Label htmlFor="streetAddress" className="block text-sm font-medium mb-2">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="streetAddress"
              placeholder="123 Medical Blvd"
              value={formData.streetAddress}
              onChange={e => handleChange('streetAddress', e.target.value)}
              onBlur={() => handleBlur('streetAddress')}
              className={`${getFieldError('streetAddress') ? 'border-destructive' : ''}`}
            />
            {getFieldError('streetAddress') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.streetAddress}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="block text-sm font-medium mb-2">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Chicago"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                className={`${getFieldError('city') ? 'border-destructive' : ''}`}
              />
              {getFieldError('city') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.city}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="block text-sm font-medium mb-2">
                State <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.state} onValueChange={val => {
                handleChange('state', val);
                setTouched(prev => new Set([...prev, 'state']));
              }}>
                <SelectTrigger className={`${getFieldError('state') ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('state') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.state}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode" className="block text-sm font-medium mb-2">
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                placeholder="60601"
                value={formData.zipCode}
                onChange={e => handleChange('zipCode', e.target.value)}
                onBlur={() => handleBlur('zipCode')}
                className={`${getFieldError('zipCode') ? 'border-destructive' : ''}`}
              />
              {getFieldError('zipCode') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.zipCode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Contact Information</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryPhone" className="block text-sm font-medium mb-2">
                Primary Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="primaryPhone"
                type='text'
                placeholder="312-555-0000"
                value={formData.primaryPhone}
                onChange={e => {
                  const val = e.target.value;
                  
                  handleChange('primaryPhone', val);
                }}
                onBlur={() => handleBlur('primaryPhone')}
                className={`${getFieldError('primaryPhone') ? 'border-destructive' : ''}`}
              />
              {getFieldError('primaryPhone') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.primaryPhone}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="workEmail" className="block text-sm font-medium mb-2">
                Work Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workEmail"
                type="email"
                placeholder="admin@clinic.com"
                value={formData.workEmail}
                onChange={e => handleChange('workEmail', e.target.value)}
                onBlur={() => handleBlur('workEmail')}
                className={`${getFieldError('workEmail') ? 'border-destructive' : ''}`}
              />
              {getFieldError('workEmail') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.workEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Clinic Operations</h3>
          
          <div>
            <Label htmlFor="infusionChairCount" className="block text-sm font-medium mb-2">
              Number of Infusion Chairs <span className="text-destructive">*</span>
            </Label>
            <Input
              id="infusionChairCount"
              type="number"
              min="1"
              max="100"
              placeholder="8"
              value={formData.infusionChairCount}
              onChange={e => handleChange('infusionChairCount', e.target.value)}
              onBlur={() => handleBlur('infusionChairCount')}
              className={`${getFieldError('infusionChairCount') ? 'border-destructive' : ''}`}
            />
            {getFieldError('infusionChairCount') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.infusionChairCount}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium mb-3">
              Treatment Types Offered <span className="text-destructive">*</span>
            </Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {TREATMENT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTreatmentTypeToggle(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.treatmentTypesOffered.includes(type.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border/30 bg-card/30 hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      formData.treatmentTypesOffered.includes(type.id)
                        ? 'border-accent bg-accent'
                        : 'border-border/50'
                    }`}>
                      {formData.treatmentTypesOffered.includes(type.id) && (
                        <Check className="w-3 h-3 text-background" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {getFieldError('treatmentTypesOffered') && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.treatmentTypesOffered}
              </p>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Account Security</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-2">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`pr-10 ${getFieldError('password') ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
              <p className="text-xs text-foreground/50 mt-2">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`pr-10 ${getFieldError('confirmPassword') ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 flex-col md:flex-row mt-10">
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue to Email Verification'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
