import Link from 'next/link';

const plans = [
  {
    name: 'Launch',
    blurb: 'Get the system running with your team.',
    price: '$999',
    featured: false,
    items: ['Full platform access', '4 hrs/month consulting', 'Team training for the first 3 months'],
  },
  {
    name: 'Grow',
    blurb: 'Ongoing optimization as you scale.',
    price: '$1,599',
    featured: false,
    items: ['Full platform access', '4 hrs/month consulting, every month', 'Quarterly workflow tune-ups'],
  },
  {
    name: 'Full Service',
    blurb: 'We run coordination for you.',
    price: '$2,599',
    featured: true,
    items: ['Everything in Grow', 'Dedicated care coordinator', '15 hrs/month of coordinator support'],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border bg-muted py-20 sm:py-24">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="text-center">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">PACKAGES</p>
          <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[44px]">
            Pick how much you want off
            <br />
            your plate.
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-7 text-muted-foreground">
            Every package includes the platform, setup around your workflow, and a signed BAA.
          </p>
        </div>
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-xl bg-card p-7 ${
                plan.featured ? 'border-2 border-accent' : 'border border-border'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-accent-foreground">
                  MOST HANDS-OFF
                </span>
              )}
              <h3 className="text-[20px] font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-[14px] text-muted-foreground">{plan.blurb}</p>
              <p className="mt-8 text-[40px] font-semibold tracking-tight text-foreground">
                {plan.price}
                <span className="ml-1 text-[14px] font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[14px] text-foreground/80">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-foreground/80" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/join-waitlist"
                className={`mt-8 inline-flex h-11 items-center justify-center rounded-md text-[14px] font-medium ${
                  plan.featured
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                Book a review
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          3-year agreements · Price lock available on 5-year terms · Extra consulting at $250/hr
        </p>
      </div>
    </section>
  );
}
