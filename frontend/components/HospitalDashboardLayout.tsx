'use client';

import Link from 'next/link';
import { Building2, BarChart3, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect, createContext, useContext, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface HospitalDashboardLayoutProps {
  children: React.ReactNode;
}

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


type ViewType = 'overview' | 'referrals' | 'analytics' | 'partners';

interface DashboardContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  hospital: object;
  setHospital: (hospital: any) => void;
  clinics: any[];
  setClinics: (clinics: any[]) => void;
  hospitalId: string;
  loadingClinics: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardView = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardView must be used within HospitalDashboardLayout');
  }
  return context;
};

const navItems = [
  {
    id: 'overview' as ViewType,
    label: 'Dashboard',
    icon: Building2,
  },
  {
    id: 'referrals' as ViewType,
    label: 'Referrals',
    icon: Users,
  },
  {
    id: 'partners' as ViewType,
    label: 'Partners',
    icon: Building2,
  },
  {
    id: 'analytics' as ViewType,
    label: 'Analytics',
    icon: BarChart3,
  },
];

export default function HospitalDashboardLayout({ children }: HospitalDashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [hospital, setHospital] = useState({});
  const [clinics, setClinics] = useState<any[]>([]);
  const[loadingClinics,setLoadingClinics]=useState(false);
  const [hospitalId, setHospitalId] = useState('');
  

  const [patients, setPatients] = useState<Patient[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [patientsError, setPatientsError] = useState<string | null>(null);




     // Fetch patients referred to this clinic
      useEffect(() => {
         if (window && typeof window !== 'undefined') {
      const hospitalString = localStorage.getItem('hospital');
      console.log('Hospital retrieving from local storage string is', hospitalString);
      if (hospitalString) {
        console.log('Hospital retrieved from local storage', hospitalString);
        const hospitalData = JSON.parse(hospitalString);
        setHospital(hospitalData);
        localStorage.setItem('hospitalId',hospitalData.id);
        setHospitalId(hospitalData.id);
        console.log('Hospital ID set to local storage successfully',hospitalData.id)
      }
    }
        const fetchReferredPatients = async () => {
          try {
            setPatientsLoading(true);
            setPatientsError(null);

           

           
            
            const apiUrl = 'https://scriptishrxnewmark.onrender.com/v1';
            console.log('Fetching referrals from:', `${apiUrl}/referrals`);
            
            // If we have a hospitalId, request referrals scoped to that hospital
            const query = hospitalId ? `?hospitalId=${encodeURIComponent(hospitalId)}` : '';
            const response = await fetchWithAuth(`${apiUrl}/referrals${query}`, {
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

        fetchReferredPatients()
    
    
  }, [currentView]);

  // Fetch all clinics
  useEffect(() => {
   
    const fetchClinics = async () => {
       setLoadingClinics(true);
      console.log('🔍 [fetchClinics] Starting clinics fetch...');
      let allClinics = await authService.fetchAllClinics();
      
      // Check if token is expired (authService returns { isTokenExpired: true })
      if (allClinics && typeof allClinics === 'object' && allClinics.isTokenExpired) {
        console.log('⚠️ [fetchClinics] Token expired detected, attempting to refresh...');
        
        // Try to refresh the token
        const refreshSuccess = await authService.refreshAccessToken();
        
        if (refreshSuccess) {
          console.log('✅ [fetchClinics] Token refreshed successfully, retrying fetch...');
          // Retry fetching clinics with new token
          allClinics = await authService.fetchAllClinics();
          console.log('Clinic one treatmentTypesOffered:',allClinics[0].treatmentTypesOffered)
        } else {
          setLoadingClinics(false)
          console.log('❌ [fetchClinics] Token refresh failed, redirecting to login');
          localStorage.removeItem('hospital');
          localStorage.removeItem('hospitalAdmin');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
          return;
        }
      }
      
      setClinics(allClinics || []);
      console.log('✅ [fetchClinics] All clinics fetched:', allClinics);
    };
    fetchClinics();
  }, [router]);
  return (
    <DashboardContext.Provider value={{ currentView, loadingClinics, setCurrentView, hospital, setHospital, hospitalId, clinics, setClinics }}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary/10 backdrop-blur-md border-r border-border/30 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border/30">
            <button onClick={() => setCurrentView('overview')} className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-accent" />
              <div>
                <h2 className="font-bold text-foreground">Nexu Leads Hospital</h2>
                <p className="text-xs text-foreground/50">NPI: {hospital.npiNumber}</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsSidebarOpen(false);
                  }}

                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/60 text-white border border-accent/50'
                      : 'text-foreground/70 hover:bg-primary/30 hover:text-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30">
            <button 
            onClick={()=>{
              router.push('/login');
              localStorage.removeItem('hospital');
              localStorage.removeItem('hospitalAdmin');
              
            }}className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground/70 hover:bg-primary/30 hover:text-red-400 transition-all">
              <LogOut className="w-5 h-5"
               />
              <span className="font-medium">Logout</span>
            </button>
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
              <X className="w-6 h-6 text-accent" />
            ) : (
              <Menu className="w-6 h-6 text-accent" />
            )}
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
    </DashboardContext.Provider>
  );
}
