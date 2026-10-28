import { Phone, FileText, CalendarDays, Shield } from 'lucide-react';

const services = [
  {
    icon: Phone,
    title: 'Voice agent',
    body: 'Answers every call, day or night. Qualifies new patients, answers common questions, and books consults straight into your calendar.',
    note: 'Coordinator steps in for anything sensitive.',
  },
  {
    icon: FileText,
    title: 'Patient intake',
    body: 'Branded digital intake with consent forms, health history, and lab uploads — chased until complete, before the patient walks in.',
    note: 'Charts arrive ready for the provider.',
  },
  {
    icon: CalendarDays,
    title: 'Scheduling & follow-ups',
    body: 'Booking, reminders, lab review visits, re-dosing appointments, and membership renewals — on schedule, every time.',
    note: 'Fewer no-shows, longer patient journeys.',
  },
  {
    icon: Shield,
    title: 'Coverage checks',
    body: 'When insurance applies — GLP-1s, labs, select therapies — we verify eligibility before the visit so there are no surprises.',
    note: 'Cash-pay clinics can skip this one.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="services" className="bg-muted py-20 sm:py-24">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="mb-12 grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">WHAT WE TAKE OFF YOUR PLATE</p>
            <h2 className="mt-4 max-w-[520px] text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[44px]">
              Four services. One coordinated patient journey.
            </h2>
          </div>
          <p className="max-w-[360px] text-[15px] leading-7 text-muted-foreground lg:justify-self-end">
            Start with the one that hurts most. Each is set up around how your clinic already works — no rip-and-replace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="flex min-h-[320px] flex-col rounded-xl border border-border bg-card p-6"
            >
              <service.icon className="h-6 w-6 text-foreground" strokeWidth={1.6} />
              <h3 className="mt-8 text-[16px] font-semibold text-foreground">{service.title}</h3>
              <p className="mt-3 flex-1 text-[14px] leading-6 text-muted-foreground">{service.body}</p>
              <p className="mt-6 border-t border-border pt-4 text-[13px] leading-5 text-muted-foreground">
                {service.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
