'use client';

interface MetricCardProps {
  title: string;
  before: string;
  beforeLabel: string;
  after: string;
  afterLabel: string;
  description: string;
  source: string;
}

function MetricCard({ title, before, beforeLabel, after, afterLabel, description, source }: MetricCardProps) {
  return (
    <div className="flex flex-col p-6 sm:p-8 rounded-xl border border-border/20 bg-card/50 backdrop-blur-md hover:border-brand/50 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-6">{title}</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
            <p className="text-xs  text-foreground/50">{beforeLabel}</p>
          <p className="text-2xl sm:text-2xl font-bold text-foreground/60 mb-1">{before}</p>
        
        </div>
        
        <div className="px-3 sm:px-4 text-brand animate-ping font-semibold text-sm">→</div>
        
        <div className="text-center flex-1">
          <p className="text-xs sm:text-sm text-foreground/50">{afterLabel}</p>
          <p className="text-2xl sm:text-2xl font-bold text-brand mb-1">{after}</p>
          
        </div>
      </div>
      
      <p className="text-sm sm:text-base text-foreground/70 leading-relaxed mb-4">
        {description}
      </p>
      
      <p className="text-xs text-foreground/50 italic">{source}</p>
    </div>
  );
}

export default function TestimonialsSection() {
  const metrics = [
    {
      title: 'Insurance Verification',
      before: '45 minutes',
      beforeLabel: 'Average manual time',
      after: '60 seconds',
      afterLabel: 'Reduced to',
      description: 'Average manual time required to complete insurance verification per patient, fully eliminated through automated EDI 270/271 processing within Scriptish.',
      source: 'Source: MGMA Healthcare Operations Benchmark Report',
    },
    {
      title: 'Missed Call Volume',
      before: '30% inbound calls',
      beforeLabel: 'Unanswered outside hours',
      after: 'Now captured 24/7',
      afterLabel: 'With automation',
      description: 'Approximately 30% of infusion clinic call volume occurs outside business hours and remains unanswered, resulting in preventable patient leakage to competing providers.',
      source: 'Source: Advisory Board Healthcare Access Study',
    },
    {
      title: 'Prior Authorization Revenue Leakage',
      before: '$50,000+ annual exposure',
      beforeLabel: 'Revenue at risk',
      after: 'Mitigated through automation',
      afterLabel: 'Loss prevention',
      description: 'Estimated annual revenue loss per infusion clinic attributed to prior authorization delays, documentation errors, and missed submission windows.',
      source: 'Source: AMA Prior Authorization Impact Report (2024)',
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-accent/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold mb-4">
            Early Access Program
          </span>
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Built in partnership with <span className="text-brand">infusion clinics.</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-foreground/70 mb-6 text-balance">
            Validated by leading medical directors.
          </p>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/60 mb-2 text-balance leading-relaxed">
            We are currently onboarding a limited number of pilot clinics across the United States.
          </p>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-brand font-medium text-balance">
            Gain early access to Scriptish before general release.
          </p>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              before={metric.before}
              beforeLabel={metric.beforeLabel}
              after={metric.after}
              afterLabel={metric.afterLabel}
              description={metric.description}
              source={metric.source}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
