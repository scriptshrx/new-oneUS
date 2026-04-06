'use client';

import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  urgencyLevel?: string;
  status?: string;
  pipelineStage?: string;
  createdAt?: string;
  [key: string]: any;
}

const PIPELINE_STAGES = [
  { id: 'new_referral', label: 'New Referral' },
  { id: 'insurance', label: 'Insurance Verification' },
  { id: 'authorization', label: 'Prior Authorization' },
  { id: 'scheduling', label: 'Scheduling Treatment' },
  { id: 'treatment', label: 'Treatment In Process' },
  { id: 'complete', label: 'Treatment Completed' },
  { id: 'follow_up', label: 'Follow-ups' },
];

const STAGE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

interface AnalyticsViewProps {
  patients: Patient[];
  patientsError: string | null;
  patientsLoading: boolean;
  onBack?: () => void;
}

const getUrgencyCount = (patients: Patient[], urgency: string) => {
  return patients.filter((p) => p.urgencyLevel === urgency).length;
};

const getStageCount = (patients: Patient[], stage: string) => {
  return patients.filter((p) => p.pipelineStage === stage).length;
};

const getStatusDistribution = (patients: Patient[]) => {
  const distribution: Record<string, number> = {};
  patients.forEach((p) => {
    const status = p.status || 'Unknown';
    distribution[status] = (distribution[status] || 0) + 1;
  });
  return distribution;
};

const getConversionRate = (patients: Patient[]) => {
  const completed = patients.filter(
    (p) => p.pipelineStage === 'COMPLETE' || p.status === 'COMPLETED'
  ).length;
  return patients.length > 0 ? ((completed / patients.length) * 100).toFixed(1) : '0';
};

const getAverageTimeInPipeline = (patients: Patient[]) => {
  if (patients.length === 0) return '0';
  const now = new Date().getTime();
  const totalDays = patients.reduce((sum, p) => {
    if (!p.createdAt) return sum;
    const createdTime = new Date(p.createdAt).getTime();
    const days = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  return (totalDays / patients.length).toFixed(1);
};

const StatCard = ({ icon: Icon, label, value, unit = '', color = 'primary' }: any) => {
  const colorClass =
    color === 'red'
      ? 'bg-red-50'
      : color === 'green'
      ? 'bg-green-50'
      : color === 'orange'
      ? 'bg-orange-50'
      : 'bg-primary/10';
  const iconColorClass =
    color === 'red'
      ? 'text-red-600'
      : color === 'green'
      ? 'text-green-600'
      : color === 'orange'
      ? 'text-orange-600'
      : 'text-primary';

  return (
    <div className={`p-6 rounded-xl border border-border/30 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/70 font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground">
            {value}
            <span className="text-lg text-foreground/60 ml-1">{unit}</span>
          </p>
        </div>
        <Icon className={`w-8 h-8 ${iconColorClass}`} />
      </div>
    </div>
  );
};

export default function AnalyticsView({
  patients,
  patientsError,
  patientsLoading,
  onBack,
}: AnalyticsViewProps) {
  const analytics = useMemo(() => {
    return {
      total: patients.length,
      urgent: getUrgencyCount(patients, 'URGENT'),
      high: getUrgencyCount(patients, 'HIGH'),
      routine: getUrgencyCount(patients, 'ROUTINE'),
      newReferrals: getStageCount(patients, 'NEW_REFERRAL'),
      inTreatment: getStageCount(patients, 'IN_TREATMENT'),
      completed: getStageCount(patients, 'COMPLETE'),
      conversionRate: getConversionRate(patients),
      avgTimeInPipeline: getAverageTimeInPipeline(patients),
      statusDistribution: getStatusDistribution(patients),
    };
  }, [patients]);

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-primary/5">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-3 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-sm text-foreground/70 mt-1">
            Real-time clinic performance metrics and patient pipeline analytics
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {patientsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error loading analytics</p>
              <p className="text-sm text-red-700">{patientsError}</p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Patients"
                value={analytics.total}
                color="primary"
              />
              <StatCard
                icon={TrendingUp}
                label="Conversion Rate"
                value={analytics.conversionRate}
                unit="%"
                color="green"
              />
              <StatCard
                icon={Clock}
                label="Avg. Time in Pipeline"
                value={analytics.avgTimeInPipeline}
                unit="days"
                color="primary"
              />
              <StatCard
                icon={CheckCircle}
                label="Completed Cases"
                value={analytics.completed}
                color="green"
              />
            </div>
          </div>

          {/* Urgency Distribution */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Patient Urgency Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-red-50 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Urgent</h3>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{analytics.urgent}</p>
                <p className="text-xs text-foreground/60 mt-2">
                  {analytics.total > 0
                    ? ((analytics.urgent / analytics.total) * 100).toFixed(1)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="p-6 rounded-xl bg-orange-50 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">High</h3>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600">{analytics.high}</p>
                <p className="text-xs text-foreground/60 mt-2">
                  {analytics.total > 0
                    ? ((analytics.high / analytics.total) * 100).toFixed(1)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="p-6 rounded-xl bg-green-50 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Routine</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{analytics.routine}</p>
                <p className="text-xs text-foreground/60 mt-2">
                  {analytics.total > 0
                    ? ((analytics.routine / analytics.total) * 100).toFixed(1)
                    : 0}
                  % of total
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Patient Pipeline Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-primary/10 border border-border/30">
                <h3 className="font-semibold text-foreground mb-2">New Referrals</h3>
                <p className="text-3xl font-bold text-primary">{analytics.newReferrals}</p>
                <div className="mt-4 w-full bg-primary/20 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        analytics.total > 0
                          ? (analytics.newReferrals / analytics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-blue-50 border border-border/30">
                <h3 className="font-semibold text-foreground mb-2">In Treatment</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.inTreatment}</p>
                <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        analytics.total > 0
                          ? (analytics.inTreatment / analytics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-green-50 border border-border/30">
                <h3 className="font-semibold text-foreground mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.completed}</p>
                <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        analytics.total > 0
                          ? (analytics.completed / analytics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown - Industry Grade Vertical Bar Chart */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Patient Distribution by Pipeline Stage</h2>
            <div className="p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-lg">
              {patients.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart
                      data={PIPELINE_STAGES.map((stage) => ({
                        stage: stage.label.split(' ')[0], // Shortened label
                        count: patients.filter(
                          (p) => (p.pipelineStage || '').toLowerCase() === stage.id
                        ).length,
                        fullLabel: stage.label,
                      }))}
                      margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
                    >
                      <defs>
                        {STAGE_COLORS.map((color, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(100,100,100,0.1)" vertical={false} />
                      <XAxis
                        dataKey="stage"
                        stroke="rgba(255,255,255,0.6)"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.6)"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft', offset: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(100,150,255,0.3)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                          padding: '12px',
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                        formatter={(value, name, props) => {
                          return [
                            <span key="value" className="font-bold text-lg">{value}</span>,
                            'Patients',
                          ];
                        }}
                        labelFormatter={(label) => `${label}`}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" name="Patients" radius={[12, 12, 0, 0]}>
                        {PIPELINE_STAGES.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Stage Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-border/20">
                    {PIPELINE_STAGES.map((stage, index) => {
                      const count = patients.filter(
                        (p) => (p.pipelineStage || '').toLowerCase() === stage.id
                      ).length;
                      const percentage = patients.length > 0 ? ((count / patients.length) * 100).toFixed(1) : '0';

                      return (
                        <div
                          key={stage.id}
                          className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-border/50 transition-all"
                          style={{ borderLeftWidth: '4px', borderLeftColor: STAGE_COLORS[index] }}
                        >
                          <p className="text-xs text-foreground/60 font-medium mb-1">{stage.label}</p>
                          <p className="text-2xl font-bold text-foreground">{count}</p>
                          <p className="text-xs text-foreground/50 mt-1">{percentage}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                    <p className="text-foreground/60">No patient data available for pipeline analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {patients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-foreground/70">No patient data available for analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
