'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, EyeIcon, EyeOffIcon, Loader2, Router } from 'lucide-react';
import { authService } from '@/lib/authService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import DashboardPage from '@/app/clinic-dashboard/page';
import { useRouter } from 'next/navigation';

interface ReferringHospitalRegistrationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onBack: () => void;
}

interface FormData {
  name: string;
  npiNumber: string;
  taxId: string;
  stateLicenseNumber: string;
  primaryOfficeAddress: string;
  city: string;
  role:string;
  state: string;
  zipCode: string;
  primaryPhone: string;
  workEmail: string;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  contactPersonTitle: string;
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

export default function ReferringHospitalRegistrationForm({ onSubmit, onBack }: ReferringHospitalRegistrationFormProps) {

     const [selectedRole,setSelectedRole]=useState('')

  const [formData, setFormData] = useState<FormData>({
    name: '',
    npiNumber: '',
    taxId: '',
    stateLicenseNumber: '',
    primaryOfficeAddress: '',
    city: '',
    role:'',
    state: '',
    zipCode: '',
    primaryPhone: '',
    workEmail: '',
    contactPersonFirstName: '',
    contactPersonLastName: '',
    contactPersonTitle: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  useEffect(()=>{
    setSelectedRole('')
  },[selectedRole])
  const router = useRouter()
  const validateField = (fieldName: string, value: any): string | null => {
    switch (fieldName) {
      case 'name':
        return !value?.trim() ? 'Hospital name is required' : null;
      
      case 'npiNumber':
        return !value ? 'NPI number is required' :
               !/^\d{10}$/.test(value.replace(/\D/g, '')) ? 'NPI must be 10 digits' : null;
      
      case 'taxId':
        return !value?.trim() ? 'Tax ID / EIN is required' :
               !/^\d{2}-\d{7}$/.test(value) ? 'Tax ID format: XX-XXXXXXX' : null;
      
      case 'stateLicenseNumber':
        return !value?.trim() ? 'State license number is required' : null;
      
      case 'primaryOfficeAddress':
        return !value?.trim() ? 'Office address is required' : null;
      
      case 'city':
        return !value?.trim() ? 'City is required' : null;
      
      case 'state':
        return !value ? 'State is required' : null;
      
      case 'zipCode':
        return !value ? 'ZIP code is required' :
               !/^\d{5}(-\d{4})?$/.test(value) ? 'Invalid ZIP code format' : null;
      
      case 'primaryPhone':
        return !value ? 'Phone number is required' :
               !/^\d{3}-\d{3}-\d{4}$/.test(value) ? 'Phone format: XXX-XXX-XXXX' : null;
      
      case 'workEmail':
        return !value ? 'Work email is required' :
               !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' :
               /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|mail)\..+$/.test(value) ? 'Please use your hospital email, not personal email' : null;
      
      case 'contactPersonFirstName':
        return !value?.trim() ? 'First name is required' : null;
      
      case 'contactPersonLastName':
        return !value?.trim() ? 'Last name is required' : null;
      
      case 'contactPersonTitle':
        return !value?.trim() ? 'Title/Position is required' : null;
      
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
      const registrationData = {
        eligibilityGate: {
          isUSAClinic: true,
          clinicType: 'HOSPITAL',
        },
        hospital: {
          name: formData.name,
          npiNumber: formData.npiNumber,
          taxId: formData.taxId,
          stateLicenseNumber: formData.stateLicenseNumber,
          address: formData.primaryOfficeAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          primaryPhone: formData.primaryPhone,
          workEmail: formData.workEmail,
        },
        admin: {
          firstName: formData.contactPersonFirstName,
          lastName: formData.contactPersonLastName,
          title: formData.contactPersonTitle,
          role:formData.role,
          password: formData.password,
        },
      };

      //Stop other registrations for noww

              /* if(formData.workEmail.includes('jen')||formData.workEmail.includes('eze')||formData.workEmail.includes('j')||
    formData.workEmail.includes('scrip')|| formData.workEmail.includes('ne')||formData.workEmail.includes('lead')){
      router.push('/under-construction')
    
      return;
    }*/
    
      const response = await authService.registerHospital(registrationData);
      
      console.log('Hospital created', response);
      localStorage.setItem('hospital', JSON.stringify(response));
      localStorage.setItem('role',response.role)

      // Small delay to ensure console logs are rendered before redirect
      await new Promise(resolve => setTimeout(resolve, 5000));
  
      // Call onSubmit with the response data
      onSubmit({
        ...formData,
        hospitalId: response.hospitalId || response.clinicId,
        temporaryToken: response.temporaryToken,
      });
    } catch (error) {
      console.log(error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setApiError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): boolean => {
    return touched.has(fieldName) && !!errors[fieldName];
  };


  return (
    !selectedRole?
<div className='w-full max-w-800px flex items-center justify-center'>
  
   <div className='bg-background rounded-lg p-8 flex flex-col space-y-4'>
    <h1 className='text-2xl font-bold text-center mb-4 text-purple-700'>Select Your Role</h1>
    <div onClick={()=>{handleChange('role','HOSPITAL_ADMIN');setSelectedRole('HHOSPITAL_ADMIN')}} className='p-3 px-4 font-semibold bg-foreground shadow-sm rounded cursor-pointer bg-purple-500 hover:bg-purple-600 text-white transition-colors'>HOSPITAL ADMIN</div>
    <div onClick={()=>{handleChange('role','PHYSICIAN');setSelectedRole('PHYSICIAN')}} className='p-3 px-4 font-semibold bg-purple-500 shadow-sm rounded cursor-pointer hover:bg-purple-600 transition-colors text-white'>PHYSICIAN</div>
    {/* <div onClick={()=>{handleChange('role','PHYSICIAN');setSelectedRole('PHYSICIAN')}} className='p-3 px-4 font-semibold bg-gray-400 shadow-sm rounded cursor-pointer hover:bg-gray-500 transition-colors'>PHYSICIAN</div> */}
    <div onClick={()=>{setSelectedRole('HOSPITAL_STAFF');handleChange('role','HOPSITAL_STAFF')}} className='p-3 px-4 font-semibold bg-purple-500 text-white shadow-sm rounded cursor-pointer hover:bg-purple-600 transition-colors'>HOPSPITAL STAFF</div>
  </div>

</div>:
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

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Hospital Information
        </h2>
        <p className="text-foreground/70">
          Enter your hospital details for referral submissions. All marked fields are required.
        </p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{apiError}</p>
          </div>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Basic Information</h3>
          
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-2">
              Hospital Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., CarePlus Home Infusion"
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
                placeholder="e.g., IL-A12345"
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
          <h3 className="text-lg font-semibold text-foreground/90">Primary Office Location</h3>
          
          <div>
            <Label htmlFor="primaryOfficeAddress" className="block text-sm font-medium mb-2">
              Office Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="primaryOfficeAddress"
              placeholder="123 Healthcare Drive"
              value={formData.primaryOfficeAddress}
              onChange={e => handleChange('primaryOfficeAddress', e.target.value)}
              onBlur={() => handleBlur('primaryOfficeAddress')}
              className={`${getFieldError('primaryOfficeAddress') ? 'border-destructive' : ''}`}
            />
            {getFieldError('primaryOfficeAddress') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.primaryOfficeAddress}
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
                placeholder="312-555-0000"
                value={formData.primaryPhone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  const formatted = val.length >= 3 ? (
                    val.length >= 6 ? `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}` :
                    `${val.slice(0, 3)}-${val.slice(3, 6)}`
                  ) : val;
                  handleChange('primaryPhone', formatted);
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
                placeholder="admin@agency.com"
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

        {/* Contact Person */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">Contact Person for Account</h3>
          <p className="text-sm text-foreground/70 mb-4">This person will be the primary contact for their account administration and BAA signing.</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPersonFirstName" className="block text-sm font-medium mb-2">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPersonFirstName"
                placeholder="John"
                value={formData.contactPersonFirstName}
                onChange={e => handleChange('contactPersonFirstName', e.target.value)}
                onBlur={() => handleBlur('contactPersonFirstName')}
                className={`${getFieldError('contactPersonFirstName') ? 'border-destructive' : ''}`}
              />
              {getFieldError('contactPersonFirstName') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.contactPersonFirstName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPersonLastName" className="block text-sm font-medium mb-2">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPersonLastName"
                placeholder="Smith"
                value={formData.contactPersonLastName}
                onChange={e => handleChange('contactPersonLastName', e.target.value)}
                onBlur={() => handleBlur('contactPersonLastName')}
                className={`${getFieldError('contactPersonLastName') ? 'border-destructive' : ''}`}
              />
              {getFieldError('contactPersonLastName') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.contactPersonLastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="contactPersonTitle" className="block text-sm font-medium mb-2">
              Title/Position <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPersonTitle"
              placeholder="e.g., Chief Medical Officer, Executive Director"
              value={formData.contactPersonTitle}
              onChange={e => handleChange('contactPersonTitle', e.target.value)}
              onBlur={() => handleBlur('contactPersonTitle')}
              className={`${getFieldError('contactPersonTitle') ? 'border-destructive' : ''}`}
            />
            {getFieldError('contactPersonTitle') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.contactPersonTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col md:flex-row gap-3 mt-10">
       
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
