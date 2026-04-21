'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useClinicDashboardView } from '../ClinicDashboardLayout';

interface Chair {
  id: string;
  name: string;
  email: string;
  specialty: string;
  operatingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  createdAt: string;
}

export default function AllChairsView() {
  const { clinic } = useClinicDashboardView();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchChairs();
  }, []);

  const fetchChairs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clinic?.id) {
        setError('Clinic information not found');
        return;
      }

      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chairs/${clinic.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chairs: ${response.statusText}`);
      }

      const data = await response.json();
      setChairs(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chairs';
      setError(errorMessage);
      console.error('Error fetching chairs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChair = async (chairId: string) => {
    if (!window.confirm('Are you sure you want to delete this infusion chair?')) {
      return;
    }

    try {
      setDeleting(chairId);
      const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
      const response = await fetchWithAuth(`${apiUrl}/chair/${chairId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chair');
      }

      // Remove from local state
      setChairs(chairs.filter(c => c.id !== chairId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chair';
      setError(errorMessage);
      console.error('Error deleting chair:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-foreground/70">Loading chairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Infusion Chairs</h1>
          <p className="text-foreground/60 mt-1">Manage your infusion chair officers</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {chairs.length === 0 && !error && (
        <div className="text-center py-12 bg-background/50 rounded-lg border border-border/30">
          <p className="text-foreground/60 mb-4">No infusion chairs added yet</p>
          <p className="text-sm text-foreground/50 mb-6">
            Go to "Add Infusion Chairs" to create your first chair
          </p>
        </div>
      )}

      {/* Chairs Grid */}
      {chairs.length > 0 && (
        <div className="grid gap-4">
          {chairs.map(chair => (
            <div
              key={chair.id}
              className="bg-background/50 border border-border/30 rounded-lg p-6 hover:border-border/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {chair.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-foreground/60">Email</p>
                      <p className="text-foreground">{chair.email}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Specialty</p>
                      <p className="text-foreground">{chair.specialty}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-foreground/60">Operating Address</p>
                      <p className="text-foreground">
                        {chair.operatingAddress}, {chair.city}, {chair.state} {chair.zipCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      chair.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-700'
                        : chair.status === 'INACTIVE'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : 'bg-gray-500/20 text-gray-700'
                    }`}>
                      {chair.status}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteChair(chair.id)}
                  disabled={deleting === chair.id}
                  className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete chair"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
