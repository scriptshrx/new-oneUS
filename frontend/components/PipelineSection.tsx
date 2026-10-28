const steps = [
  {
    n: '1',
    filled: false,
    title: 'Workflow review',
    body: 'A 20-minute call to find where patients and hours are slipping.',
  },
  {
    n: '2',
    filled: false,
    title: 'Map & customize',
    body: 'We build around your scheduling, intake, and protocols — and sign the BAA first.',
  },
  {
    n: '3',
    filled: false,
    title: 'Go live',
    body: 'Your team is trained, your coordinator is assigned, and the queue starts clearing.',
  },
  {
    n: '4',
    filled: true,
    title: 'Optimize monthly',
    body: 'Monthly consulting hours to tighten the workflow as your clinic grows.',
  },
];

export default function PipelineSection() {
  return (
    <section id="how-we-work" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">GETTING STARTED</p>
        <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.03em] text-foreground sm:text-[44px]">
          Live in weeks, not months.
        </h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-[14px] font-medium ${
                  step.filled
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                {step.n}
              </div>
              <h3 className="mt-5 text-[16px] font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
