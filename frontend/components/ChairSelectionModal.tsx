'use client';

import { useState, useEffect } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Chair {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city: string;
  state: string;
  status: string;
}

interface ChairSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  onChairSelected: (chairId: string) => Promise<void>;
}

export default function ChairSelectionModal({
  isOpen,
  onClose,
  clinicId,
  onChairSelected,
}: ChairSelectionModalProps) {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChairs();
    }
  }, [isOpen]);

  const fetchChairs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(
        `https://scriptishrxnewmark.onrender.com/v1/chairs/chairs/${clinicId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chairs');
      }

      const data = await response.json();
      setChairs(data.data || []);
    } catch (err) {
      console.error('Error fetching chairs:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch chairs'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChair = async () => {
    if (!selectedChairId) return;

    try {
      setIsSubmitting(true);
      await onChairSelected(selectedChairId);
      setSelectedChairId(null);
      onClose();
    } catch (err) {
      console.error('Error selecting chair:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to tag chair to patient'
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/30 rounded-2xl max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-2xl font-bold text-foreground">Select Infusion Chair</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground/70">Loading infusion chairs...</p>
              </div>
            </div>
          ) : chairs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <p className="text-foreground/70">No infusion chairs available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chairs.map((chair) => (
                <label
                  key={chair.id}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedChairId === chair.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/30 hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="chair"
                    value={chair.id}
                    checked={selectedChairId === chair.id}
                    onChange={(e) => setSelectedChairId(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{chair.name}</div>
                    <div className="text-sm text-foreground/70 mt-1">
                      <p>Email: {chair.email}</p>
                      <p>Specialty: {chair.specialty}</p>
                      <p>
                        Location: {chair.city}, {chair.state}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                      chair.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {chair.status}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border/30">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/30 text-foreground hover:bg-primary/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelectChair}
            disabled={!selectedChairId || isSubmitting || loading}
            className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Tagging Chair...' : 'Tag Chair'}
          </Button>
        </div>
      </div>
    </div>
  );
}
