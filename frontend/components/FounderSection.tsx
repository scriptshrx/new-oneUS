export default function FounderSection() {
  return (
    <section id="about" className="border-t border-border bg-background py-20 sm:py-24">
      
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative mx-auto h-[280px] border border-r-[10px] border-accent w-full max-w-[280px] rounded-xl bg-card lg:mx-0 lg:h-[340px] lg:max-w-none">
          <img src="/images/founder1.jpeg" alt="Founder" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-[620px]">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-accent">BUILT BY A NURSE</p>
          <h2 className="mt-4 text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[40px]">
            We know the admin load because we&apos;ve carried it.
          </h2>
          <p className="mt-6 text-[16px] leading-8 text-foreground/80">
            ScriptishRx was founded by Gil Marquez, RN, MSHI — a registered nurse with a master&apos;s in health informatics. 
            He is an experienced nurse who understands modern healthcare system. He has special skills in navigating the healthcare system nuances in patient care especially during the pandemic when staffing was scarce taking care of Transplant patients in the outpatient setting. He also understands the shortage of primary care in taking care of patients prioritizing preventative care versus chronic care. He would like independent primary care to have access with a coordination care team platform that would be efficient and effective especially for remote areas.
            He built it so providers can spend their time on patients, not paperwork.
          </p>
          <p className="mt-5 text-[16px] leading-8 text-foreground/80">
            Clinical sense and informatics in one team means we understand what a provider needs to see — and what should never be left to automation.
          </p>
          <p className="mt-8 text-[14px] font-semibold text-foreground">Gil Marquez, RN, MSHI</p>
          <p className="text-[14px] text-muted-foreground">Founder &amp; CEO · Chicago</p>
        </div>
      </div>
    </section>
  );
}
