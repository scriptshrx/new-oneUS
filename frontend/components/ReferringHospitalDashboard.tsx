'use client';

import { useState } from 'react';
import {
  Activity,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
  AlertCircle,
  Clock,
  Hourglass,
  LoaderIcon,
  Building2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReferralsView from '@/components/hospital-dashboard/ReferralsView';
import AnalyticsView from '@/components/hospital-dashboard/AnalyticsView';
import PartnersView from '@/components/hospital-dashboard/PartnersView';
import { useDashboardView } from '@/components/HospitalDashboardLayout';

interface ReferralMetrics {
  totalReferrals: number;
  pendingVerification: number;
  pendingPA: number;
  scheduled: number;
  completed: number;
}

interface ClinicPartner {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  referralCount: number;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
}

interface Referral {
  id: string;
  patientName: string;
  patientDOB: string;
  clinicName: string;
  treatmentType: string;
  status: 'new' | 'verifying' | 'pa_pending' | 'scheduled' | 'in_treatment' | 'completed';
  referralDate: string;
  urgency: 'routine' | 'urgent' | 'stat';
  diagnosis: string;
}

const MOCK_METRICS: ReferralMetrics = {
  totalReferrals: 47,
  pendingVerification: 8,
  pendingPA: 5,
  scheduled: 12,
  completed: 22,
};

const MOCK_CLINIC_PARTNERS: ClinicPartner[] = [
  {
    id: '1',
    name: 'Bright Infusion Clinic',
    specialty: 'IV Therapy',
    address: '123 Medical Blvd, Chicago, IL',
    phone: '312-555-0000',
    referralCount: 18,
    status: 'active',
  },
  {
    id: '2',
    name: 'Ketamine Wellness Center',
    specialty: 'Ketamine Therapy',
    address: '456 Wellness Ave, NYC, NY',
    phone: '212-555-1111',
    referralCount: 12,
    status: 'active',
  },
  {
    id: '3',
    name: 'NAD+ Recovery Clinic',
    specialty: 'NAD+ Therapy',
    address: '789 Health St, LA, CA',
    phone: '323-555-2222',
    referralCount: 8,
    status: 'pending',
  },
];

const MOCK_REFERRALS: Referral[] = [
 /* {
    id: 'ref_001',
    patientName: 'Mark Johnson',
    patientDOB: '1985-03-15',
    clinicName: 'Bright Infusion Clinic',
    treatmentType: 'IV Therapy',
    status: 'scheduled',
    referralDate: '2026-03-20',
    urgency: 'routine',
    diagnosis: 'Chronic fatigue syndrome',
  },
  {
    id: 'ref_002',
    patientName: 'Sarah Williams',
    patientDOB: '1992-07-22',
    clinicName: 'Ketamine Wellness Center',
    treatmentType: 'Ketamine Therapy',
    status: 'pa_pending',
    referralDate: '2026-03-21',
    urgency: 'urgent',
    diagnosis: 'Treatment-resistant depression',
  },
  {
    id: 'ref_003',
    patientName: 'David Brown',
    patientDOB: '1978-11-08',
    clinicName: 'NAD+ Recovery Clinic',
    treatmentType: 'NAD+ Therapy',
    status: 'verifying',
    referralDate: '2026-03-22',
    urgency: 'routine',
    diagnosis: 'Mitochondrial dysfunction',
  },
  {
    id: 'ref_004',
    patientName: 'Jennifer Lee',
    patientDOB: '1988-05-30',
    clinicName: 'Bright Infusion Clinic',
    treatmentType: 'IV Therapy',
    status: 'completed',
    referralDate: '2026-03-01',
    urgency: 'routine',
    diagnosis: 'Chronic pain management',
  },*/
];

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    new: 'New',
    verifying: 'Verifying Insurance',
    pa_pending: 'PA Pending',
    scheduled: 'Scheduled',
    in_treatment: 'In Treatment',
    completed: 'Completed',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-400/10 border-blue-400/30 text-blue-600 font-semibold';
    case 'verifying':
      return 'bg-yellow-400/10 border-yellow-400/30 text-yellow-600 font-semibold';
    case 'pa_pending':
      return 'bg-orange-400/10 border-orange-400/30 text-orange-600 font-semibold';
    case 'scheduled':
      return 'bg-cyan-400/10 border-cyan-400/30 text-cyan-600 font-semibold';
    case 'in_treatment':
      return 'bg-purple-400/10 border-purple-400/30 text-purple-600 font-semibold';
    case 'completed':
      return 'bg-green-400/10 border-green-400/30 text-green-600 font-semibold';
    default:
      return 'bg-gray-400/10 border-gray-400/30 text-gray-600 font-semibold';
  }
};

const getUrgencyIcon = (urgency: string) => {
  if (urgency === 'urgent' || urgency === 'stat') {
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  }
  return <Clock className="w-4 h-4 text-gray-400" />;
};


type ViewType = 'overview' | 'referrals' | 'analytics' | 'partners';

export default function ReferringHospitalDashboard() {
  const { currentView, hospital, setHospital, loadingClinics, setCurrentView, clinics } = useDashboardView();
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.clinicName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
    const matchesClinic = selectedClinic === 'all' || ref.clinicName === selectedClinic;
    return matchesSearch && matchesStatus && matchesClinic;
  });
  

  // Render different views based on currentView state
  if (currentView === 'referrals') {
    return <ReferralsView onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'analytics') {
    return <AnalyticsView onBack={() => setCurrentView('overview')} />;
  }

  if (currentView === 'partners') {
    return <PartnersView onBack={() => setCurrentView('overview')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-accent mb-2">
                Referral Dashboard
              </h1>
              <p className="text-foreground/75">
                Manage and track your referrals across partner clinics
              </p>
            </div>
            <Button 
              onClick={() => setCurrentView('referrals')}
              className="bg-primary shadow-sm hover:bg-primary/90 text-white font-semibold gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Referral
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Referrals */}
          <button className="group relative p-6 rounded-2xl border border-border/30 bg-primary/10 hover:border-accent/50 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-accent" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-foreground/80 text-sm mb-1 font-medium">Total Referrals</p>
              <p className="text-2xl font-bold text-accent">
                {MOCK_METRICS.totalReferrals}
              </p>
            </div>
          </button>

          {/* Pending Verification */}
          <button className="group relative p-6 rounded-2xl border border-border/30 bg-primary/10 hover:border-yellow-400/50 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(234, 179, 8, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center mb-4">
                <LoaderIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-foreground/80 text-sm mb-1 font-medium">Verifying Insurance</p>
              <p className="text-2xl font-bold text-yellow-400">
                {MOCK_METRICS.pendingVerification}
              </p>
            </div>
          </button>

          {/* PA Pending */}
          <button className="group relative p-6 rounded-2xl border border-border/30 bg-primary/10 hover:border-orange-400/50 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(234, 88, 12, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-orange-400/20 border border-orange-400/30 flex items-center justify-center mb-4">
                <Hourglass className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-foreground/80 text-sm mb-1 font-medium">PA Pending</p>
              <p className="text-2xl font-bold text-orange-400">
                {MOCK_METRICS.pendingPA}
              </p>
            </div>
          </button>

          {/* Scheduled */}
          <button className="group relative p-6 rounded-2xl border border-border/30 bg-primary/10 hover:border-accent/50 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <p className="text-foreground/80 text-sm mb-1 font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-accent">
                {MOCK_METRICS.scheduled}
              </p>
            </div>
          </button>

          {/* Completed */}
          <button className="group relative p-6 rounded-2xl border border-border/30 bg-primary/10 hover:border-green-400/50 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent)',
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-400/20 border border-green-400/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-foreground/80 text-sm mb-1 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-400">
                {MOCK_METRICS.completed}
              </p>
            </div>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Clinic Partners */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div
                className="absolute overflow-hidden overflow-y-auto max-h-[200px] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                style={{
                  background:
                    'radial-gradient(circle at top right, rgba(51, 211, 191, 0.2), transparent)',
                }}
              />
              <Card className="relative z-10 border  border-border/30 bg-primary/10 backdrop-blur-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between items-center gap-2 mb-6">
                    <div className='flex gap-2 items-center'>
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-primary">
                      Partner Clinics
                    </h2>
                    </div>
                    <span className=" text-xs bg-accent/20 text-accent px-2 py-1 rounded-full border border-accent/30">
                      {clinics.length} total
                    </span>
                    
                  </div>

                  <div className="space-y-4 h-[400px] overflow-hidden overflow-y-auto">
                    {clinics.length>0?
                    clinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        className="group/clinic p-4 rounded-xl border border-border/20 bg-background/50 hover:border-accent/10 hover:bg-primary/05 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {clinic.name}
                            </h3>
                     
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              clinic.status === 'active'
                                ? 'bg-green-400/10 text-green-600 border border-green-400/30'
                                : clinic.status === 'pending'
                                  ? 'bg-yellow-400/10 text-yellow-600 border border-yellow-400/30'
                                  : 'bg-gray-400/10 text-gray-600 border border-gray-400/30'
                            }`}
                          >
                            {clinic.status}
                          </div>
                          
                        </div>
                        <div className='font-bold text-xs'>Treatments offered</div>

                               <div className='flex w-full p-2 overflow-hidden overflow-x-auto gap-2'>
                                
                              {clinic.treatmentTypesOffered?.length>0&&
                              clinic.treatmentTypesOffered.map((treatment)=>
                              <button key={treatment} 
                              className="text-xs text-accent whitespace-nowrap rounded-lg shadow-sm bg-accent/10 p-2 px-3 font-medium">
                              {treatment.replace('_',' ')}
                            </button>)}
                            </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground/75  font-medium">
                            Refs: {clinic.referralCount}
                          </span>
                          
                        </div>
                      </div>
                    )
                  ):
                  
                      loadingClinics?
                        <div className='flex gap-2 mx-auto justify-center items-center mx-auto'>
                        <div className='h-5 w-5 rounded-full border-[2px] border-gray-400 border-t-accent animate-spin'/>
                        <span className='text-sm font-semibold text-accent'>Loading Clinics</span>
                        </div>:
                        <div className="text-center py-12">
                        <AlertCircle className="w-8 h-8 text-foreground/70 mx-auto mb-2" />
                        <p className="text-foreground/75 font-medium">No referrals found</p>
                      </div>}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6 border-accent/30 hover:border-accent text-accent hover:bg-accent/10"
                  >
                    View All Partners
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                style={{
                  background:
                    'radial-gradient(circle at top right, rgba(51, 211, 191, 0.2), transparent)',
                }}
              />
              <Card className="relative z-10 border border-border/30 bg-primary/10 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-primary">
                        Recent Referrals
                      </h2>
                    </div>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full border border-accent/30">
                      {referrals.length} total
                    </span>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <Input
                      placeholder="Search patient or clinic..."
                      className="bg-background/50 border-border/30 text-foreground placeholder:text-foreground/60"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-primary/10 backdrop-blur-md border-border/30">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="verifying">Verifying Insurance</SelectItem>
                        <SelectItem value="pa_pending">PA Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_treatment">In Treatment</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                      <SelectTrigger className="bg-background/50 border-border/30 text-foreground">
                        <SelectValue placeholder="Filter by clinic" />
                      </SelectTrigger>
                      <SelectContent className="bg-primary/10 backdrop-blur-md border-border/30">
                        <SelectItem value="all">All Clinics</SelectItem>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.name}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Referrals List */}
                  <div className="space-y-3 h-[500px] overflow-hidden overflow-y-auto max-h-96 overflow-y-auto">
                    {MOCK_REFERRALS.length > 0 ? (
                      MOCK_REFERRALS.map((ref) => (
                        <div
                          key={ref.id}
                          className="group/referral p-4 rounded-xl border border-border/20 bg-background/30 hover:border-accent/10 hover:bg-primary/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground truncate">
                                  {ref.patientName}
                                </h3>
                                {getUrgencyIcon(ref.urgency)}
                              </div>
                              <div className="text-xs text-foreground/75 space-y-1 font-medium">
                                <p>📅 DOB: {ref.patientDOB}</p>
                                <p>🏥 {ref.clinicName}</p>
                                <p>💊 {ref.treatmentType}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  ref.status
                                )}`}
                              >
                                {getStatusLabel(ref.status)}
                              </span>
                              <span className="text-xs text-foreground/70 font-medium">
                                {ref.referralDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="w-8 h-8 text-foreground/70 mx-auto mb-2" />
                        <p className="text-foreground/75 font-medium">No referrals found</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Referral */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30 mx-auto mb-4">
                <Plus className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">New Referral</h3>
              <p className="text-xs text-foreground/75 font-medium">
                Submit a new patient referral to partner clinics
              </p>
            </div>
          </button>

          {/* View Analytics */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30 mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
              <p className="text-xs text-foreground/75 font-medium">
                View referral trends and clinic performance
              </p>
            </div>
          </button>

          {/* Manage Partners */}
          <button className="group relative p-6 rounded-2xl border-2 border-border/30 hover:border-accent/50 hover:bg-primary/20 bg-primary/10 transition-all">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(51, 211, 191, 0.1), transparent)',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30 mx-auto mb-4">
                <Building2 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Manage Partners
              </h3>
              <p className="text-xs text-foreground/75 font-medium">
                Add or manage your clinic partnerships
              </p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
