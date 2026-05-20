'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  EyeIcon,
  EyeOffIcon,
  Loader2,
} from 'lucide-react';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  email: string;
  clinicId: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function StaffRegistrationForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: '',
    email: '',
    password: '',
    confirmPassword: '',
    clinicId: '',
  });

  const [role, setRole] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const[clinicName,setClinicName]=useState('')

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedDataParam = params.get('data');
    const clinicIdParam = params.get('clinicId');
    const roleParam = params.get('role');
    const clinicNameParam = params.get('clinicName');

    if (encodedDataParam) {
      try {
        const decodedData = JSON.parse(atob(decodeURIComponent(encodedDataParam)));
        const decodedClinicId = decodedData?.clinicId || '';
        const decodedRole = decodedData?.role || '';
        const decodedClinicName = decodedData?.clinicName || '';

        if (decodedClinicName) {
          setClinicName(decodedClinicName);
          console.log('Clinic name set from encoded data:', decodedClinicName);
        }

        if (decodedClinicId) {
          setClinicId(decodedClinicId);
          setFormData(prev => ({
            ...prev,
            clinicId: decodedClinicId,
          }));
          console.log('ClinicId set from encoded data:', decodedClinicId);
        }

        if (decodedRole) {
          setRole(decodedRole);
          setFormData(prev => ({
            ...prev,
            role: decodedRole,
          }));
          console.log('Role set from encoded data:', decodedRole);
        }

        return;
      } catch (error) {
        console.error('Failed to decode registration data from URL:', error);
      }
    }

    // Backward compatibility with old query params
    if (clinicNameParam) {
      setClinicName(clinicNameParam);
      console.log('Clinic name set from query params:', clinicNameParam);
    }

    if (clinicIdParam) {
      setClinicId(clinicIdParam);
      setFormData(prev => ({
        ...prev,
        clinicId: clinicIdParam,
      }));
      console.log('ClinicId set from query params:', clinicIdParam);
    }

    if (roleParam) {
      setRole(roleParam);
      setFormData(prev => ({
        ...prev,
        role: roleParam,
      }));
      console.log('Role set from query params:', roleParam);
    }
  }, []);

  const handleChange = (
    fieldName: keyof FormData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    setTouched(prev => new Set(prev).add(fieldName));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Confirm password is required';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.clinicId) {
      newErrors.clinicId = 'Clinic ID is missing';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    localStorage.setItem(
      'formData',
      JSON.stringify(formData)
    );

    try {
      const response = await authService.registerStaff(
        formData
      );

      console.log(
        'Registration of Staff successful:',
        response
      );


      // Example redirect
      router.push('/login');
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.');

      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (
    fieldName: keyof FormData
  ): boolean => {
    return touched.has(fieldName) && !!errors[fieldName];
  };

  const onBack = () => {
    router.back();
  };

  return (
    <>
   
                <Link href="/" className="text-xl ml-3 mt-3 moveBg sm:text-2xl font-bold bg-gradient-to-r from-foreground/10 via-foreground/80 to-foreground/10 text-transparent bg-clip-text ">
                  Scriptish
                </Link>
              
   
    <form onSubmit={handleSubmit}
    className='p-2 md:p-10 md:px-14 '>
      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />

          <div>
            <p className="text-sm font-medium text-red-400 mb-1">
              Registration Error
            </p>

            <p className="text-sm text-red-300/80">
              {apiError}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          <span className='text-accent'>{clinicName?clinicName:''}{"\n"}</span>Staff Information
        </h2>

        <p className="text-foreground/70">
          Enter your details. All marked fields are
          required.
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">
            Basic Information
          </h3>

<div className="flex space-x-4">
          <div>
            <Label
              htmlFor="firstname"
              className="block text-sm font-medium mb-2"
            >
              First Name{' '}
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="firstname"
              placeholder="e.g., Mark"
              value={formData.firstName}
              onChange={e =>
                handleChange(
                  'firstName',
                  e.target.value
                )
              }
              className={`${
                getFieldError('firstName')
                  ? 'border-destructive'
                  : ''
              }`}
            />

            {getFieldError('firstName') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="lastname"
              className="block text-sm font-medium mb-2"
            >
              Last Name{' '}
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="lastname"
              placeholder="e.g., Jenny"
              value={formData.lastName}
              onChange={e =>
                handleChange(
                  'lastName',
                  e.target.value
                )
              }
              className={`${
                getFieldError('lastName')
                  ? 'border-destructive'
                  : ''
              }`}
            />

            {getFieldError('lastName') && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lastName}
              </p>
            )}
          </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">
            Contact Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="primaryPhone"
                className="block text-sm font-medium mb-2"
              >
                Phone Number{' '}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="primaryPhone"
                type="text"
                placeholder="+1312-555-0000"
                value={formData.phoneNumber}
                onChange={e =>
                  handleChange(
                    'phoneNumber',
                    e.target.value
                  )
                }
                className={`${
                  getFieldError('phoneNumber')
                    ? 'border-destructive'
                    : ''
                }`}
              />

              {getFieldError('phoneNumber') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                E-mail{' '}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="e.g., jenny@gmail.com"
                value={formData.email}
                onChange={e =>
                  handleChange('email', e.target.value)
                }
                className={`${
                  getFieldError('email')
                    ? 'border-destructive'
                    : ''
                }`}
              />

              {getFieldError('email') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">
            Account Security
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password{' '}
                <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={
                    showPassword ? 'text' : 'password'
                  }
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={e =>
                    handleChange(
                      'password',
                      e.target.value
                    )
                  }
                  className={`pr-10 ${
                    getFieldError('password')
                      ? 'border-destructive'
                      : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
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
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password{' '}
                <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={e =>
                    handleChange(
                      'confirmPassword',
                      e.target.value
                    )
                  }
                  className={`pr-10 ${
                    getFieldError(
                      'confirmPassword'
                    )
                      ? 'border-destructive'
                      : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {getFieldError(
                'confirmPassword'
              ) && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
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
              Registering Staff...
            </>
          ) : (
            'Register'
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
     </>
  );
}