const columns = [
  {
    label: 'THE AI',
    labelClass: 'text-background/50',
    title: 'Always on',
    items: [
      'Answers calls and messages 24/7',
      'Sends and chases intake forms',
      'Books, confirms, and reminds',
      'Runs coverage checks',
    ],
  },
  {
    label: 'YOUR COORDINATOR',
    labelClass: 'text-accent',
    title: 'Human in the loop',
    items: [
      'Handles exceptions and upset patients',
      'Manages renewals and retention',
      'Flags clinical questions to your team',
      'Reviews and tunes the workflow monthly',
    ],
  },
  {
    label: 'YOUR PROVIDERS',
    labelClass: 'text-background/50',
    title: 'Just treat',
    items: [
      'Every clinical decision stays with them',
      'Prepared charts before each visit',
      'Fewer portal messages and callbacks',
      'More time with patients',
    ],
  },
];

export default function DifferenceSection() {
  return (
    <section className="bg-foreground py-20 sm:py-24">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">WHY WE&apos;RE DIFFERENT</p>
        <h2 className="mt-4 max-w-[720px] text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-background sm:text-[48px]">
          AI handles the volume. A real person handles the nuance.
        </h2>
        <p className="mt-6 max-w-[640px] text-[16px] leading-8 text-background/70">
          Most tools hand you software and walk away. ScriptishRx is a service: the technology plus a dedicated coordinator who learns your protocols and catches what automation shouldn&apos;t decide.
        </p>
        <div className="mt-12 overflow-hidden rounded-xl border border-background/15">
          <div className="grid md:grid-cols-3">
            {columns.map((col, i) => (
              <div
                key={col.title}
                className={`p-7 ${i > 0 ? 'border-t border-background/15 md:border-t-0 md:border-l' : ''}`}
              >
                <p className={`text-[11px] font-semibold tracking-[0.12em] ${col.labelClass}`}>{col.label}</p>
                <h3 className="mt-3 text-[22px] font-semibold text-background">{col.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[14px] leading-6 text-background/70">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-background/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
