'use client';

import Link from 'next/link';
import { Building2, BarChart3, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect, createContext, useContext, SetStateAction } from 'react';


interface HospitalDashboardLayoutProps {
  children: React.ReactNode;
}

type ViewType = 'overview' | 'referrals' | 'analytics' | 'partners';

interface DashboardContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  hospital:object,
  setHospital:()=>void
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
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const[hospital,setHospital]=useState({})
  useEffect(()=>{
    if(window&& typeof window !== 'undefined'){
      const hospitalString = localStorage.getItem('hospital');
      console.log('Hospital retrieving from local storage string is',hospitalString)
      if(hospitalString){
        console.log('Hospital retrieved from local storage',hospitalString)
      const hospital = JSON.parse(hospitalString)
      setHospital(hospital)
      }

    }
  },[currentView])

  return (
    <DashboardContext.Provider value={{ currentView, setHospital, hospital, setCurrentView }}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary/10 border-r border-border/30 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border/30">
            <button onClick={() => setCurrentView('overview')} className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-accent" />
              <div>
                <h2 className="font-bold text-foreground">{hospital.name}</h2>
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
                      ? 'bg-accent/20 text-accent border border-accent/50'
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
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground/70 hover:bg-primary/30 hover:text-red-400 transition-all">
              <LogOut className="w-5 h-5" />
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
