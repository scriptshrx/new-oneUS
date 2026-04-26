'use client';

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import { Input } from '../ui/input';

const API_BASE_URL = 'https://scriptishrxnewmark.onrender.com/v1';

export default function AccountSettings() {
  const { clinic, clinicId } = useClinicDashboardView();

  const [form, setForm] = useState({
    name: '',
    primaryPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    infusionChairCount: 0,
    treatmentTypesOffered: '',
    serviceArea: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name || '',
        primaryPhone: clinic.primaryPhone || '',
        streetAddress: clinic.streetAddress || '',
        city: clinic.city || '',
        state: clinic.state || '',
        zipCode: clinic.zipCode || '',
        infusionChairCount: clinic.infusionChairCount || 0,
        treatmentTypesOffered: Array.isArray(clinic.treatmentTypesOffered)
          ? clinic.treatmentTypesOffered.join(', ')
          : (clinic.treatmentTypesOffered as string) || '',
        serviceArea: Array.isArray(clinic.serviceArea) ? clinic.serviceArea.join(', ') : (clinic.serviceArea as string) || '',
      });
      return;
    }

    // If clinic not in context, fetch it
    const fetchClinic = async () => {
      if (!clinicId) return;
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/clinics/${clinicId}`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to load clinic: ${res.statusText}`);
        const data = await res.json();
        setForm({
          name: data.name || '',
          primaryPhone: data.primaryPhone || '',
          streetAddress: data.streetAddress || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          infusionChairCount: data.infusionChairCount || 0,
          treatmentTypesOffered: Array.isArray(data.treatmentTypesOffered) ? data.treatmentTypesOffered.join(', ') : (data.treatmentTypesOffered as string) || '',
          serviceArea: Array.isArray(data.serviceArea) ? data.serviceArea.join(', ') : (data.serviceArea as string) || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clinic');
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [clinic, clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!clinicId) {
      setError('No clinic selected');
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        name: form.name,
        primaryPhone: form.primaryPhone,
        streetAddress: form.streetAddress,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        infusionChairCount: Number(form.infusionChairCount) || 0,
        treatmentTypesOffered: form.treatmentTypesOffered
          ? form.treatmentTypesOffered.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        serviceArea: form.serviceArea ? form.serviceArea.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await fetchWithAuth(`${API_BASE_URL}/clinics/${clinicId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Update failed: ${res.statusText}`);
      }

      const updated = await res.json();

      // Persist updated clinic to localStorage (used elsewhere in app)
      try {
        localStorage.setItem('clinic', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist clinic to localStorage', e);
      }

      setSuccess('Clinic updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update clinic');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading clinic...</div>;
  }

  return (
    <div className="p-6 max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Clinic Name</label>
          <Input name="name" value={form.name} onChange={handleChange} className="Input" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Primary Phone</label>
          <Input name="primaryPhone" value={form.primaryPhone} onChange={handleChange} className="Input" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street Address</label>
          <Input name="streetAddress" value={form.streetAddress} onChange={handleChange} className="Input" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <Input name="city" value={form.city} onChange={handleChange} className="Input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Input name="state" value={form.state} onChange={handleChange} maxLength={2} className="Input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP</label>
            <Input name="zipCode" value={form.zipCode} onChange={handleChange} className="Input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Infusion Chair Count</label>
          <Input name="infusionChairCount" value={String(form.infusionChairCount)} onChange={handleChange} type="number" min={0} className="Input" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Treatment Types (comma separated)</label>
          <Input name="treatmentTypesOffered" value={form.treatmentTypesOffered} onChange={handleChange} className="Input" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service Area (comma separated)</label>
          <Input name="serviceArea" value={form.serviceArea} onChange={handleChange} className="Input" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
