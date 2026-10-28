import Link from 'next/link';

export default function FoundingProgramSection() {
  return (
    <section className="border-t border-border bg-background py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1120px] gap-5 px-5 sm:px-8 lg:grid-cols-2">
        <div className="rounded-xl bg-accent/10 p-8 sm:p-10">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">FOUNDING CLINIC PROGRAM</p>
          <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[32px]">
            [N] seats for clinics who want to shape the platform.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-foreground/80">
            Founding clinics get priority onboarding, direct access to the founder, and [founding benefit — e.g. locked pricing].
          </p>
          <Link
            href="/join-waitlist"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply for a founding seat
          </Link>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-8 sm:p-10">
          <p className="text-[20px] font-semibold leading-8 tracking-[-0.02em] text-foreground">
            “[Pilot clinic quote — one sentence on the time or patients you got back.]”
          </p>
          <p className="mt-10 text-[14px] text-muted-foreground">[Name, title] · [Clinic name, city]</p>
        </div>
      </div>
    </section>
  );
}
