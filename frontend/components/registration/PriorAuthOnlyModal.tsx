'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';

interface InsuranceVerificationModalProps {
  patientName: string;
  onClose: () => void;
}

const INSURANCE_VERIFICATION_PROVIDERS = [
  {
    name: 'Change Healthcare',
    description: 'Leading healthcare IT company providing network connectivity and revenue cycle management',
    url: 'https://www.changehealthcare.com',
  },
  {
    name: 'Availity',
    description: 'Healthcare technology company specializing in eligibility and benefits verification',
    url: 'https://www.availity.com',
  },
  {
    name: 'Waystar',
    description: 'Cloud-based revenue cycle management and payment platform for healthcare',
    url: 'https://www.waystar.com',
  },
  {
    name: 'Experian Health',
    description: 'Revenue cycle and population health analytics for healthcare organizations',
    url: 'https://www.experianhealth.com',
  },
];

const PRIOR_AUTHORIZATION_PROVIDERS = [
  {
    name: 'SamaCare',
    description: 'Streamlined prior authorization and referral management platform',
    url: 'https://www.samacare.com',
  },
  {
    name: 'CoverMyMeds',
    description: 'Digital health platform for prior authorization and e-prescribing',
    url: 'https://www.covermymeds.com',
  },
  {
    name: 'eviCore Healthcare',
    description: 'Clinical utilization and prior authorization management solutions',
    url: 'https://www.evicore.com',
  },
  {
    name: 'AIM Specialty Health',
    description: 'Specialty care network and prior authorization platform',
    url: 'https://www.aimspecialtyhealth.com',
  },
];

export default function PriorAuthOnlyModal({
  patientName,
  onClose,
}: InsuranceVerificationModalProps) {
  const [activeTab, setActiveTab] = useState('authorization');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border/50">
        {/* Header */}
        <div className="border-b flex-end justify-end border-border/30 bg-gradient-to-r from-primary/10 to-accent/5 p-6 flex items-start justify-between">
          
          <button
            onClick={onClose}
            className="text-foreground/50 mr-4 hover:text-foreground/80 transition-colors right-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab List */}
            <TabsList className=" w-full flex mb-6 bg-muted/50">
             
              <TabsTrigger value="authorization" className="flex items-center gap-2">
                <span>Prior Authorization for <span className='font-semibold'>{patientName}</span></span>
              </TabsTrigger>
            </TabsList>

            {/* Insurance Verification Tab */}
            {/* <TabsContent value="insurance" className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
                  Choose a provider to verify patient insurance
                </h3>
              </div>
              <div className="grid gap-3">
                {INSURANCE_VERIFICATION_PROVIDERS.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 rounded-xl border border-border/30 bg-background/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                        {provider.name}
                      </h4>
                      <p className="text-xs text-foreground/60 mt-1">{provider.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-accent flex-shrink-0 mt-1 transition-colors" />
                  </a>
                ))}
              </div>
            </TabsContent> */}

            {/* Prior Authorization Tab */}
            <TabsContent value="authorization" className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
                  Choose a provider for prior authorization
                </h3>
              </div>
              <div className="grid gap-3">
                {PRIOR_AUTHORIZATION_PROVIDERS.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 rounded-xl border border-border/30 bg-background/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                        {provider.name}
                      </h4>
                      <p className="text-xs text-foreground/60 mt-1">{provider.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-accent flex-shrink-0 mt-1 transition-colors" />
                  </a>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 p-6 bg-background/50 flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold"
          >
            Completed
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
