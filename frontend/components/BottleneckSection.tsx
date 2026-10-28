const items = [
  {
    n: '01',
    title: 'Leads go cold',
    body: 'Inquiries come in after hours and between appointments. By the time someone calls back, the patient has booked with the clinic that answered.',
  },
  {
    n: '02',
    title: 'Providers do admin',
    body: 'Chasing intake forms, lab results, and portal messages eats the hours your clinicians should spend with patients — and drives burnout.',
  },
  {
    n: '03',
    title: 'Programs leak',
    body: 'Follow-ups, re-dosing visits, and membership renewals slip through the cracks. Lifetime value walks out the door one missed touchpoint at a time.',
  },
];

export default function BottleneckSection() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">THE REAL BOTTLENECK</p>
        <h2 className="mt-4 max-w-[640px] text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[48px]">
          Patients want to start. Your front desk can&apos;t keep up.
        </h2>
        <p className="mt-6 max-w-[620px] text-[17px] leading-8 text-muted-foreground">
          Wellness and longevity care runs on relationships — consults, labs, protocols, renewals. Every slow callback and missed follow-up is a patient who quietly goes elsewhere.
        </p>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {items.map((item) => (
            <div key={item.n} className="border-t border-foreground pt-6">
              <p className="text-[28px] font-semibold tracking-tight text-accent">{item.n}</p>
              <h3 className="mt-4 text-[18px] font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
