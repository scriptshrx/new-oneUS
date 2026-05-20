'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = 'https://scriptishrxnewmark.onrender.com/v1';
const NONE_VALUE = '__none__';

interface FormData {
  chairNumber: string;
  patientId: string;
  userId: string;
}

interface FormErrors {
  [key: string]: string;
}

interface StaffMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

function staffDisplayName(member: StaffMember): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
  return name || member.email;
}

export default function AddChairsView() {
  const { clinic, setCurrentView, patients, patientsLoading } = useClinicDashboardView();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    chairNumber: '',
    patientId: '',
    userId: '',
  });

  useEffect(() => {
    if (!clinic?.id) return;

    const fetchStaff = async () => {
      try {
        setStaffLoading(true);
        setStaffError(null);
        const response = await fetchWithAuth(`${API_URL}/clinics/${clinic.id}/staff`);
        if (!response.ok) {
          throw new Error(`Failed to fetch staff: ${response.statusText}`);
        }
        const staffData = await response.json();
        setStaff(Array.isArray(staffData) ? staffData : []);
      } catch (err) {
        setStaffError(err instanceof Error ? err.message : 'Failed to load clinic users');
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, [clinic?.id]);

  const assignablePatients = useMemo(
    () => patients.filter((p) => !p.infusionChairId),
    [patients]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === formData.patientId) ?? null,
    [patients, formData.patientId]
  );

  const selectedUser = useMemo(
    () => staff.find((u) => u.id === formData.userId) ?? null,
    [staff, formData.userId]
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.chairNumber.trim()) {
      newErrors.chairNumber = 'Chair number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const payload: Record<string, string> = {
        chairNumber: formData.chairNumber.trim(),
      };
      if (formData.patientId) payload.patientId = formData.patientId;
      if (formData.userId) payload.userId = formData.userId;

      const response = await fetchWithAuth(`${API_URL}/chairs/${clinic.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create infusion chair: ${response.statusText}`);
      }

      setSuccess(true);
      setFormData({
        chairNumber: '',
        patientId: '',
        userId: '',
      });

      setTimeout(() => {
        setCurrentView('allChairs');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create infusion chair';
      setError(errorMessage);
      console.error('Error creating chair:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <header className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCurrentView('allChairs')}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Infusion Chair</h1>
          <p className="text-foreground/60 text-sm mt-1">Register a new infusion chair and optional assignments</p>
        </div>
      </header>

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm">Infusion chair has been created successfully. Redirecting...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <label htmlFor="chairNumber" className="block text-sm font-medium text-foreground mb-2">
            Chair Number
          </label>
          <input
            id="chairNumber"
            type="text"
            name="chairNumber"
            value={formData.chairNumber}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, chairNumber: e.target.value }));
              if (errors.chairNumber) {
                setErrors((prev) => ({ ...prev, chairNumber: '' }));
              }
            }}
            placeholder="e.g. Chair 1"
            className={`w-full px-4 py-2 rounded-lg border transition-colors bg-background text-foreground placeholder-foreground/50 ${
              errors.chairNumber
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-border/30 focus:border-primary focus:ring-primary/20'
            } focus:outline-none focus:ring-2`}
          />
          {errors.chairNumber && <p className="text-red-600 text-sm mt-1">{errors.chairNumber}</p>}
        </section>

        <section>
          <label className="block text-sm font-medium text-foreground mb-2">Patient (optional)</label>
          <Select
            value={formData.patientId || NONE_VALUE}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                patientId: value === NONE_VALUE ? '' : value,
              }))
            }
            disabled={patientsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={patientsLoading ? 'Loading patients...' : 'Select a patient'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No patient</SelectItem>
              {assignablePatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPatient && (
            <div className="mt-3 rounded-lg border border-border/30 bg-background/50 p-4 space-y-1">
              <p className="text-sm text-foreground/60">Selected patient</p>
              <p className="font-medium text-foreground">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-foreground/80">
                <span className="text-foreground/60">Prescribed treatment: </span>
                {selectedPatient.prescribedTreatment || 'Not specified'}
              </p>
            </div>
          )}
          {!patientsLoading && assignablePatients.length === 0 && (
            <p className="text-sm text-foreground/50 mt-2">No unassigned patients available.</p>
          )}
        </section>

        <section>
          <label className="block text-sm font-medium text-foreground mb-2">Clinic user (optional)</label>
          <Select
            value={formData.userId || NONE_VALUE}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                userId: value === NONE_VALUE ? '' : value,
              }))
            }
            disabled={staffLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={staffLoading ? 'Loading users...' : 'Select a clinic user'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No user</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {staffDisplayName(member)} ({member.role.replace(/_/g, ' ')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {staffError && <p className="text-red-600 text-sm mt-1">{staffError}</p>}
          {selectedUser && (
            <div className="mt-3 rounded-lg border border-border/30 bg-background/50 p-4 space-y-1">
              <p className="text-sm text-foreground/60">Selected user</p>
              <p className="font-medium text-foreground">{staffDisplayName(selectedUser)}</p>
              <p className="text-sm text-foreground/80">{selectedUser.email}</p>
            </div>
          )}
        </section>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                Creating...
              </>
            ) : (
              'Create Infusion Chair'
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('allChairs')}
            className="px-4 py-3 border border-border/30 text-foreground rounded-lg font-medium hover:bg-background/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}