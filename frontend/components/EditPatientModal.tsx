'use client';

import { useEffect, useState } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  [key: string]: any;
}

interface EditPatientModalProps {
  patient: Patient;
  onClose: () => void;
  onSave?: (updatedPatient: Patient) => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function EditPatientModal({
  patient,
  onClose,
  onSave,
}: EditPatientModalProps) {
  const [formData, setFormData] = useState({
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
    phone: patient.phone || '',
    email: patient.email || '',
    address: patient.address || '',
    city: patient.city || '',
    state: patient.state || '',
    zipCode: patient.zipCode || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
useEffect(()=>{
    console.log('Patient to be edited:',patient)
},[])
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.state) {
      setError('State is required');
      return false;
    }
    if (!formData.zipCode.trim()) {
      setError('Zip code is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/patients/${patient.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update patient: ${response.statusText}`);
      }

      const updatedPatient = await response.json();
      setSuccess(true);
      
      if (onSave) {
        onSave(updatedPatient);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      setError(errorMessage);
      console.error('Error updating patient:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 border-b border-border/30 z-[200] bg-blue-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Edit Patient</h2>
            <p className="text-sm text-foreground/70 mt-1">
              Update patient information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700">Patient updated successfully</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="bg-background/50 border-border/30"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="bg-background/50 border-border/30"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="bg-background/50 border-border/30"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-background/50 border-border/30"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Personal Information
            </h3>
            <div>
              <Label className="block text-sm font-medium mb-2">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="bg-background/50 border-border/30"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Address
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="bg-background/50 border-border/30"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="bg-background/50 border-border/30"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(val) => handleChange('state', val)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-background/50 border-border/30">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Zip Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className="bg-background/50 border-border/30"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
