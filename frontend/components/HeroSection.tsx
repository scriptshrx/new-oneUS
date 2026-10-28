import Link from 'next/link';
import { Check } from 'lucide-react';

const feedItems = [
  { time: '7:02 AM', text: 'Missed call returned, new consult booked', tag: 'AI' },
  { time: '8:15 AM', text: 'Intake packet completed, prior labs uploaded', tag: 'AI' },
  { time: '9:40 AM', text: 'Refill question flagged and routed to provider', tag: 'Coordinator' },
  { time: '11:20 AM', text: 'Hormone panel follow-up scheduled', tag: 'AI' },
  { time: '1:05 PM', text: 'Membership renewal questions answered, renewed', tag: 'Coordinator' },
  { time: '2:30 PM', text: 'GLP-1 coverage checked before the visit', tag: 'AI' },
];

export default function HeroSection() {
  return (
    <section className="bg-background pt-14 pb-10 sm:pt-20 sm:pb-14">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-5 text-[13px] font-semibold tracking-[0.04em] text-accent">
            CARE COORDINATION FOR WELLNESS &amp; LONGEVITY
            <br />
            CLINICS
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[56px] lg:text-[64px]">
            Your providers
            <br />
            treat. We handle
            <br />
            everything else.
          </h1>
          <p className="mt-6 max-w-[460px] text-[16px] leading-7 text-muted-foreground">
            Intake, scheduling, follow-ups, and every call your front desk misses — run by AI and managed by a dedicated care coordinator who knows your clinic.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/join-waitlist"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-[14px] font-medium text-accent-foreground hover:bg-accent/90"
            >
              Book a 20-min workflow review
            </Link>
            <Link
              href="#how-we-work"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-[14px] font-medium text-foreground hover:bg-muted"
            >
              See how it works
            </Link>
          </div>
          <ul className="mt-6 flex flex-col gap-2 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            {['Founded by a registered nurse', 'BAA signed with every clinic', 'Fits your current workflow'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="flex">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between px-5 pt-5 pb-3">
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">Today at Lumen Longevity</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">Handled while your team was with patients</p>
                  </div>
                  <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background">Live</span>
                </div>
                <ul>
                  {feedItems.map((item) => (
                    <li
                      key={item.time}
                      className="flex items-start gap-4 border-t border-border px-5 py-3"
                    >
                      <span className="w-[62px] shrink-0 pt-0.5 text-[12px] text-muted-foreground">{item.time}</span>
                      <p className="min-w-0 flex-1 text-[13px] leading-5 text-foreground">{item.text}</p>
                      {item.tag === 'AI' ? (
                        <span className="mt-0.5 shrink-0 rounded-md border border-border px-2 py-0.5 text-[11px] text-foreground">
                          AI
                        </span>
                      ) : (
                        <span className="mt-0.5 shrink-0 rounded-md bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                          Coordinator
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-[10px] bg-foreground" />
            </div>
            <div className="flex items-center justify-between bg-foreground px-5 py-3 text-[13px] text-background">
              <span>6 tasks handled</span>
              <span>0 provider minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
