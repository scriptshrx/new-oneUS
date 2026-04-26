'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';

interface FormData {
  chairNumber: string;

}

interface FormErrors {
  [key: string]: string;
}

export default function AddChairsView() {
  const { clinic, setCurrentView } = useClinicDashboardView();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    chairNumber: '',
   
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

   
    
    if (!formData.chairNumber.trim()) {
      newErrors.chairNumber = 'Cahir number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
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

      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chairs/${clinic.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create infusion chair: ${response.statusText}`);
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        specialty: '',
        chairPassword:'',
        operatingAddress: '',
        city: '',
        state: '',
        zipCode: '',
      });

      // Redirect after success
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setCurrentView('allChairs')}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Infusion Chair</h1>
          <p className="text-foreground/60 text-sm mt-1">Register a new infusion chair officer</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm">Infusion chair has been created successfully. Redirecting...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chair Officer Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Chair Number
          </label>
          <input
            type="text"
            name="chairNumber"
            value={formData.chairNumber}
            onChange={handleInputChange}
            placeholder="Enter chair officer name"
            className={`w-full px-4 py-2 rounded-lg border transition-colors bg-background text-foreground placeholder-foreground/50 ${
              errors.chairNumber
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-border/30 focus:border-primary focus:ring-primary/20'
            } focus:outline-none focus:ring-2`}
          />
          {errors.chairNumber && <p className="text-red-600 text-sm mt-1">{errors.chairNumber}</p>}
        </div>

        
        

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
