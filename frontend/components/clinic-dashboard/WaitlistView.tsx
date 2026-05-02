'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Loader2 } from 'lucide-react';

interface WaitlistItem {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function ClinicWaitlistView() {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
        const response = await fetchWithAuth(`${apiUrl}/waitlist`, {
          method: 'GET',
        });

        if (!response.ok) {
             console.log('Failed to fetch waitlist:',response);
          throw new Error(`Failed to fetch waitlist: ${response.statusText}`);
        
        }

        const data = await response.json();
        setWaitlist(Array.isArray(data) ? data : data.waitlist || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch waitlist';
        setError(errorMessage);
        console.error('Error fetching waitlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-red-600 font-medium">Error loading waitlist</p>
          <p className="text-red-500/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Waitlist</h1>
        <p className="text-foreground/60 mt-2">Total entries: {waitlist.length}</p>
      </div>

      {waitlist.length === 0 ? (
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-8 text-center">
          <p className="text-foreground/60">No waitlist entries found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/30 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary/10 border-b border-border/30">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {waitlist.map((item) => (
                <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-3 text-sm text-foreground">{item.name || 'N/A'}</td>
                  <td className="px-6 py-3 text-sm text-foreground/70">{item.email}</td>
                  <td className="px-6 py-3 text-sm text-foreground/70">{item.phone || 'N/A'}</td>
                  <td className="px-6 py-3 text-sm text-foreground/60">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
