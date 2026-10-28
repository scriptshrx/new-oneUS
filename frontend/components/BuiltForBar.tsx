const specialties = [
  'Longevity & healthspan',
  'Hormone & peptide therapy',
  'Medical weight loss',
  'Medspa & aesthetics',
  'Functional medicine',
];

export default function BuiltForBar() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <p className="shrink-0 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">BUILT FOR</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[14px] text-foreground">
          {specialties.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
