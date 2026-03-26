'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface ClinicInfoFormProps {
  onNext: (data: ClinicInfo) => void;
}

export interface ClinicInfo {
  clinicName: string;
  clinicType: string[];
  npiNumber: string;
  state: string;
}

const clinicTypes = [
  { id: 'iv-therapy', label: 'IV Therapy Clinic' },
  { id: 'ketamine', label: 'Ketamine Clinic' },
  { id: 'nad', label: 'NAD+ Clinic' },
  { id: 'home-infusion', label: 'Home Infusion Agency' },
  { id: 'biologic', label: 'Biologic Infusion Center' },
  { id: 'other', label: 'Other' },
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function ClinicInfoForm({ onNext }: ClinicInfoFormProps) {
  const [formData, setFormData] = useState<ClinicInfo>({
    clinicName: '',
    clinicType: [],
    npiNumber: '',
    state: '',
  });

  const [errors, setErrors] = useState<Partial<ClinicInfo>>({});

  const handleClinicTypeChange = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      clinicType: prev.clinicType.includes(id)
        ? prev.clinicType.filter((type) => type !== id)
        : [...prev.clinicType, id],
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<ClinicInfo> = {};
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required';
    if (formData.clinicType.length === 0) newErrors.clinicType = 'Select at least one clinic type';
    if (!formData.npiNumber.trim()) newErrors.npiNumber = 'NPI number is required';
    if (!/^\d{10}$/.test(formData.npiNumber)) newErrors.npiNumber = 'NPI must be 10 digits';
    if (!formData.state) newErrors.state = 'State is required';
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
      <div>
        <Label htmlFor="clinicName" className="text-base font-semibold mb-2 block">
          Clinic Name
        </Label>
        <Input
          id="clinicName"
          placeholder="Enter your clinic name"
          value={formData.clinicName}
          onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
          className="h-10 sm:h-11"
        />
        {errors.clinicName && (
          <p className="text-destructive text-sm mt-1">{errors.clinicName as string}</p>
        )}
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">
          Clinic Type(s)
        </Label>
        <div className="space-y-3">
          {clinicTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-3">
              <Checkbox
                id={type.id}
                checked={formData.clinicType.includes(type.id)}
                onCheckedChange={() => handleClinicTypeChange(type.id)}
              />
              <Label htmlFor={type.id} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.clinicType && (
          <p className="text-destructive text-sm mt-2">{errors.clinicType as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="npiNumber" className="text-base font-semibold mb-2 block">
          NPI Number
        </Label>
        <Input
          id="npiNumber"
          placeholder="Enter your 10-digit NPI number"
          value={formData.npiNumber}
          onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value })}
          maxLength={10}
          className="h-10 sm:h-11"
        />
        {errors.npiNumber && (
          <p className="text-destructive text-sm mt-1">{errors.npiNumber as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="state" className="text-base font-semibold mb-2 block">
          State
        </Label>
        <select
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          className="h-10 sm:h-11 w-full px-3 py-1 text-base rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="text-destructive text-sm mt-1">{errors.state as string}</p>
        )}
      </div>

      <Button type="submit" variant="default" size="lg" className="w-full">
        Continue to Eligibility Check
      </Button>
    </form>
  );
}
