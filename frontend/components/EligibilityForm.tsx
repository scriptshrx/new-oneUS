'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface EligibilityFormProps {
  onNext: (data: EligibilityData) => void;
  onBack: () => void;
}

export interface EligibilityData {
  acceptsInsurance: boolean;
  hasEHR: boolean;
  monthlyPatients: string;
  staffSize: string;
}

export default function EligibilityForm({ onNext, onBack }: EligibilityFormProps) {
  const [formData, setFormData] = useState<EligibilityData>({
    acceptsInsurance: false,
    hasEHR: false,
    monthlyPatients: '',
    staffSize: '',
  });

  const [errors, setErrors] = useState<Partial<EligibilityData>>({});

  const validateForm = () => {
    const newErrors: Partial<EligibilityData> = {};
    if (!formData.acceptsInsurance) {
      newErrors.acceptsInsurance = 'You must accept insurance to use Scriptish';
    }
    if (!formData.monthlyPatients) newErrors.monthlyPatients = 'Please select monthly patient volume';
    if (!formData.staffSize) newErrors.staffSize = 'Please select your team size';
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
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Requirements Check</h3>
        
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptsInsurance"
            checked={formData.acceptsInsurance}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, acceptsInsurance: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="acceptsInsurance" className="font-semibold cursor-pointer">
              Does your clinic accept insurance?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Scriptish requires insurance integration for EDI 270/271 verification
            </p>
          </div>
        </div>
        {errors.acceptsInsurance && (
          <p className="text-destructive text-sm ml-7">{errors.acceptsInsurance as string}</p>
        )}

        <div className="flex items-start gap-3">
          <Checkbox
            id="hasEHR"
            checked={formData.hasEHR}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, hasEHR: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="hasEHR" className="font-semibold cursor-pointer">
              Do you have an existing EHR/EMR system?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Optional - Scriptish can integrate with most major EHR systems
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">
          Approximate Monthly Patient Volume
        </Label>
        <div className="space-y-3">
          {[
            { value: '0-50', label: '0-50 patients/month' },
            { value: '51-200', label: '51-200 patients/month' },
            { value: '201-500', label: '201-500 patients/month' },
            { value: '500+', label: '500+ patients/month' },
          ].map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <input
                type="radio"
                id={`patients-${option.value}`}
                name="monthlyPatients"
                value={option.value}
                checked={formData.monthlyPatients === option.value}
                onChange={(e) => setFormData({ ...formData, monthlyPatients: e.target.value })}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
              <Label htmlFor={`patients-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.monthlyPatients && (
          <p className="text-destructive text-sm mt-2">{errors.monthlyPatients as string}</p>
        )}
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">
          Team Size
        </Label>
        <div className="space-y-3">
          {[
            { value: '1-5', label: '1-5 staff members' },
            { value: '6-15', label: '6-15 staff members' },
            { value: '16-50', label: '16-50 staff members' },
            { value: '50+', label: '50+ staff members' },
          ].map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <input
                type="radio"
                id={`staff-${option.value}`}
                name="staffSize"
                value={option.value}
                checked={formData.staffSize === option.value}
                onChange={(e) => setFormData({ ...formData, staffSize: e.target.value })}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
              <Label htmlFor={`staff-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.staffSize && (
          <p className="text-destructive text-sm mt-2">{errors.staffSize as string}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="default" size="lg" className="flex-1">
          Continue to Account
        </Button>
      </div>
    </form>
  );
}
