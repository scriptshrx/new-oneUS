import { Badge } from '@/components/ui/badge';

interface PatientCardProps {
  name: string;
  treatmentType: string;
  referringPhysician: string;
  insuranceStatus: 'verified' | 'pending' | 'failed';
  paStatus: 'approved' | 'pending' | 'denied';
  intakeStatus: 'complete' | 'pending';
  consentStatus: 'signed' | 'pending';
  nextAction: string;
  assignedStaff: string;
  appointmentDate?: string;
}

const statusColors = {
  verified: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300',
  pending: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300',
  failed: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300',
  approved: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300',
  denied: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300',
  complete: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300',
  signed: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300',
};

export default function PatientCard({
  name,
  treatmentType,
  referringPhysician,
  insuranceStatus,
  paStatus,
  intakeStatus,
  consentStatus,
  nextAction,
  assignedStaff,
  appointmentDate,
}: PatientCardProps) {
  return (
    <div className="bg-card border border-border/20 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-foreground/60 mt-1">{treatmentType}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {intakeStatus === 'complete' ? '✓' : '⏳'} Intake
        </Badge>
      </div>

      {/* Physician and Staff */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border/20">
        <div>
          <p className="text-xs text-foreground/50 uppercase tracking-wide">Referring MD</p>
          <p className="text-sm font-medium text-foreground">{referringPhysician}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/50 uppercase tracking-wide">Assigned Staff</p>
          <p className="text-sm font-medium text-foreground">{assignedStaff}</p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">Insurance</span>
          <Badge
            variant="outline"
            className={`text-xs ${statusColors[insuranceStatus as keyof typeof statusColors]}`}
          >
            {insuranceStatus.charAt(0).toUpperCase() + insuranceStatus.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">Prior Auth</span>
          <Badge
            variant="outline"
            className={`text-xs ${statusColors[paStatus as keyof typeof statusColors]}`}
          >
            {paStatus.charAt(0).toUpperCase() + paStatus.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">Consent Form</span>
          <Badge
            variant="outline"
            className={`text-xs ${statusColors[consentStatus as keyof typeof statusColors]}`}
          >
            {consentStatus === 'signed' ? 'Signed' : 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Next Action & Appointment */}
      <div className="bg-brand/5 border border-brand/20 rounded-lg p-3 mt-4">
        <p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">Next Action</p>
        <p className="text-sm font-semibold text-foreground mb-2">{nextAction}</p>
        {appointmentDate && (
          <p className="text-xs text-brand font-medium">📅 {appointmentDate}</p>
        )}
      </div>
    </div>
  );
}
