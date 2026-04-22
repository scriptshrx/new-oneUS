'use client';

import { Building2, Users, MenuIcon, MenuSquare, Settings, LogOut, Menu, X, Archive, LayoutDashboard, Workflow, BarChart3, Zap, Mic, Database, MessageSquare, CreditCard, BrainCircuit, Bot, Users2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, createContext, useContext, useEffect } from 'react';
import { authService } from '@/lib/authService';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AllChairsView from './clinic-dashboard/AllChairsView';
import AddChairsView from './clinic-dashboard/AddChairsView';
import ChairsPipelineView from './clinic-dashboard/ChairsPipelineView';

interface ClinicDashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'dashboard' | 'patientsList' | 'patients' | 'archives' | 'settings' | 'intakeForm' | 'analytics' | 'voiceAgents' | 'knowledgeBase' | 'automatedSMS' | 'subscriptions' | 'allChairs' | 'chairsPipeline' | 'addChairs' | 'logout';

interface Patient {
  // Core Patient Info
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;

  // Address & Demographics
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Referral Details
  referringPhysician?: string;
  primaryDiagnosis?: string;
  prescribedTreatment?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  clinicalNotes?: string;

  // Pipeline & Status
  status: string;
  pipelineStage?: 'NEW_REFERRAL' | 'VERIFYING_INS' | 'PA_PENDING' | 'SCHEDULED' | 'IN_TREATMENT' | 'COMPLETE';

  // Insurance Information
  insurance?: {
    carrier?: string;
    memberId?: string;
    groupId?: string;
    coverageStatus?: string;
  };

  // Prior Authorization
  priorAuthorization?: {
    status?: string;
    approvalNumber?: string;
    sessionsRemaining?: number;
    expirationDate?: string;
  };

  // Appointments
  nextAppointment?: {
    date?: string;
    time?: string;
    type?: string;
  };

  // Intake & Consent
  intakeFormStatus?: 'PENDING' | 'SUBMITTED' | 'APPROVED';
  hipaaConsentSigned?: boolean;

  // Timeline
  createdAt?: string;
  updatedAt?: string;

  // Fallback for any additional fields
  [key: string]: any;
}

interface DashboardContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  patients: Patient[];
  patientsLoading: boolean;
  patientsError: string | null;
  clinic: any | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useClinicDashboardView = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useClinicDashboardView must be used within ClinicDashboardLayout');
  }
  return context;
};

const navItems = [
  {
    group: 'PATIENTS',
    items: [
      {
        id: 'dashboard' as ViewType,
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'patientsList' as ViewType,
        label: 'Patient CRM',
        icon: Users,
      },
      {
        id: 'patients' as ViewType,
        label: 'Patient Pipelines',
        icon: Workflow,
      },
      {
        id: 'archives' as ViewType,
        label: 'Archives',
        icon: Archive,
      },
    ],
  },
  {
    group: 'ANALYTICS & SETTINGS',
    items: [
      {
        id: 'analytics' as ViewType,
        label: 'Analytics',
        icon: BarChart3,
      },
      {
        id: 'settings' as ViewType,
        label: 'Settings',
        icon: Settings,
      },
    ],
  },
  {
    group: 'INFUSION CHAIRS',
    items: [
      {
        id: 'allChairs' as ViewType,
        label: 'Chairs View',
        icon: Users2,
      },
      {
        id: 'chairsPipeline' as ViewType,
        label: 'Chairs Pipeline',
        icon: Workflow,
      },
      {
        id: 'addChairs' as ViewType,
        label: 'Add Chairs',
        icon: UserPlus,
      },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      {
        id: 'subscriptions' as ViewType,
        label: 'Subscriptions',
        icon: CreditCard,
      },
      {
        id: 'logout' as ViewType,
        label: 'Logout',
        icon: LogOut,
      },
    ],
  },
];

export default function ClinicDashboardLayout({ children }: ClinicDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  // const[clinic,setClinic]
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const router = useRouter();
  const [clinic, setClinic] = useState<any | null>(null);
  
  // Restore dashboard view from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('dashboardView') as ViewType | null;
      if (savedView && ['overview', 'patients', 'archives', 'settings'].includes(savedView)) {
        setCurrentView(savedView);
        localStorage.removeItem('dashboardView'); // Clear after using
      }
    }
  }, []);
  
  // Fetch patients referred to this clinic
  useEffect(() => {
    const fetchReferredPatients = async () => {
      try {
        setPatientsLoading(true);
        setPatientsError(null);
        
        const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
        console.log('Fetching referrals from:', `${apiUrl}/referrals`);
        
        const response = await fetchWithAuth(`${apiUrl}/referrals`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch referrals: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Referrals response:', data);
        
        // Extract referrals from response
        const referrals = Array.isArray(data) ? data : data.referrals || [];
        
        if (!referrals || referrals.length === 0) {
          console.log('No referrals found');
          setPatients([]);
          return;
        }
        
        // Flatten referral data into Patient interface
        const flattenedPatients: Patient[] = referrals.map((referral: any) => {
          const patient = referral.patient || {};
          const physician = referral.referringPhysician || {};
          
          return {
            // Patient core info
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
            
            // Referral clinical details (flattened from referral)
            primaryDiagnosis: referral.primaryDiagnosis,
            prescribedTreatment: referral.prescribedTreatment,
            urgencyLevel: referral.urgencyLevel,
            clinicalNotes: referral.clinicalNotes,
            status: referral.status,
            
            // Referring physician (flattened from nested object)
            referringPhysician: `${physician.firstName || ''} ${physician.lastName || ''}`.trim(),
            
            // Pipeline stage from patient
            pipelineStage: patient.pipelineStage,
            
            // Insurance info (if available)
            insurance: {
              carrier: patient.insurance?.insuranceCarrier,
              memberId: patient.insurance?.memberID,
              groupId: patient.insurance?.groupNumber,
              coverageStatus: patient.insurance?.coverageStatus,
            },
            
            // Prior authorization info (if available)
            priorAuthorization: {
              status: referral.priorAuthStatus,
              approvalNumber: referral.priorAuthApprovalNumber,
            },
            
            // Timeline
            createdAt: referral.createdAt,
            updatedAt: referral.updatedAt,
            
            // Store full referral object for treatment history
            _referral: referral,
          };
        });
        
        console.log('Flattened patients:', flattenedPatients);
        setPatients(flattenedPatients);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients';
        setPatientsError(errorMessage);
        console.error('Error fetching referred patients:', error);
      } finally {
        setPatientsLoading(false);
      }
    };

    // Hydrate clinic from localStorage 
    if (typeof window !== 'undefined') {
      const clinicCache = localStorage.getItem('clinic');
      if (clinicCache) {
        try {
          const clinic = JSON.parse(clinicCache);
          setClinic(clinic);
          console.log('Clinic hydrated successfully:', clinic);
        } catch (e) {
          console.error('Failed to parse clinic data:', e);
        }
      }
    }

    fetchReferredPatients();
  }, []);

  // Render the appropriate view based on currentView
  const renderView = () => {
    switch (currentView) {
      case 'allChairs':
        return <AllChairsView />;
      case 'chairsPipeline':
        return <ChairsPipelineView />;
      case 'addChairs':
        return <AddChairsView />;
      default:
        return children;
    }
  };

  return (
    <DashboardContext.Provider value={{ currentView, clinic, setCurrentView, patients, patientsLoading, patientsError }}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 shadow-md overflow-hidden overflow-y-auto left-0 z-40 w-64 bg-background/90 backdrop-blur-[20px] border-r border-border/30 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border/30">
            <button 
            onClick={() => setCurrentView('dashboard')} className="flex items-center p-2 px-3 -mx-2 rounded-lg w-full bg-primary/20 gap-2">
              <Building2 className="w-8 h-8 text-white p-1 rounded-lg bg-primary " />
              <div>
                <h2 className="font-bold text-left text-primary">{clinic?.name}</h2>
                <p className="text-xs text-primary/70">NPI:{clinic?.npiNumber}</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-6">
            {navItems.map((group) => (
              <div key={group.group}>
                <p className="text-xs font-bold text-primary/50 uppercase tracking-wider px-4 mb-2">
                  {group.group}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          localStorage.setItem('dashboardView',item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 ${item.id=='logout'&&'bg-red-500/20 text-red-600'} px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary/50 text-white border border-primary/50'
                            : 'text-foreground/70 hover:bg-primary/30 hover:text-primary'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer - Empty for now, logout moved to SETTINGS group */}
          <div className="absolute bottom-0 left-0 right-0 p-4  border-border/30">
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="lg:hidden border-b border-border/30 bg-primary/5 p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {renderView()}
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
