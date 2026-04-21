'use client';

import { Users, LayoutDashboard, Workflow, LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, createContext, useContext, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import ChairPatientListView from './chair-dashboard/PatientListView';
import ChairPatientsPipelineView from './chair-dashboard/PatientsView';

interface ChairDashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'patientsList' | 'patients' | 'logout';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  referringPhysician?: string;
  primaryDiagnosis?: string;
  prescribedTreatment?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: string;
  pipelineStage?: string;
  createdAt?: string;
  [key: string]: any;
}

interface DashboardContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  patients: Patient[];
  patientsLoading: boolean;
  patientsError: string | null;
  chair: any | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useChairDashboardView = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useChairDashboardView must be used within ChairDashboardLayout');
  return context;
};

const navItems = [
  {
    group: 'INFUSION CHAIR',
    items: [
      { id: 'patientsList' as ViewType, label: 'Patient CRM', icon: Users },
      { id: 'patients' as ViewType, label: 'Patient Pipelines', icon: Workflow },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { id: 'logout' as ViewType, label: 'Logout', icon: LogOut },
    ],
  },
];

export default function ChairDashboardLayout({ children }: ChairDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('patientsList');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const router = useRouter();
  const [chair, setChair] = useState<any | null>(null);

  useEffect(() => {
    // hydrate chair from localStorage
    if (typeof window !== 'undefined') {
      const chairCache = localStorage.getItem('chair');
      if (chairCache) {
        try {
          const parsed = JSON.parse(chairCache);
          setChair(parsed);
        } catch (e) {
          console.error('Failed to parse chair from storage', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        setPatientsError(null);

        if (!chair?.id) {
          setPatientsError('Chair ID not found');
          setPatients([]);
          return;
        }

        const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
        const response = await fetchWithAuth(`${apiUrl}/patients/by-chair/${chair.id}`, { method: 'GET' });

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.statusText}`);
        }

        const data = await response.json();
        const patientsData = Array.isArray(data) ? data : data.patients || [];

        const flattenedPatients: Patient[] = patientsData.map((patient: any) => ({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          email: patient.emailAddress,
          phone: patient.phoneNumber,
          address: patient.address,
          city: patient.city,
          state: patient.state,
          zipCode: patient.zipCode,
          pipelineStage: patient.pipelineStage,
          status: patient.status,
          primaryDiagnosis: patient.primaryDiagnosis,
          prescribedTreatment: patient.prescribedTreatment,
          urgencyLevel: patient.urgencyLevel,
          clinicalNotes: patient.clinicalNotes,
          referringPhysician: patient.referringPhysician || 'N/A',
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
          _referral: patient._referral,
        }));

        setPatients(flattenedPatients);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients';
        setPatientsError(errorMessage);
        console.error('Error fetching chair patients:', error);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [chair?.id]);

  const renderView = () => {
    switch (currentView) {
      case 'patientsList':
        return (
          <ChairPatientListView
            patients={patients}
            patientsError={patientsError}
            patientsLoading={patientsLoading}
          />
        );
      case 'patients':
        return (
          <ChairPatientsPipelineView
            patients={patients}
            patientsError={patientsError}
            patientsLoading={patientsLoading}
          />
        );
      default:
        return children;
    }
  };

  return (
    <DashboardContext.Provider value={{ currentView, chair, setCurrentView, patients, patientsLoading, patientsError }}>
      <div className="flex h-screen bg-background">
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-background/90 backdrop-blur-[20px] border-r border-border/30 transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white p-1 rounded-lg bg-primary " />
              <div>
                <h2 className="font-bold text-primary">{chair?.name || 'Infusion Chair'}</h2>
                <p className="text-xs text-primary/70">{chair?.email}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-6">
            {navItems.map((group) => (
              <div key={group.group}>
                <p className="text-xs font-bold text-primary/50 uppercase tracking-wider px-4 mb-2">{group.group}</p>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon as any;
                    const isActive = currentView === item.id;
                    return (
                      <button  key={item.id} onClick={() => { setCurrentView(item.id); setIsSidebarOpen(false); if(item.id=='logout'){localStorage.removeItem('chair');router.push('login')}}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/50 text-white' : 'text-foreground/70 hover:bg-primary/30 hover:text-primary'}`}>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {isSidebarOpen && (<div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />)}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden border-b border-border/30 bg-primary/5 p-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-primary/20 rounded-lg transition-colors">{isSidebarOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}</button>
          </div>

          <div className="flex-1 overflow-auto">{renderView()}</div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
