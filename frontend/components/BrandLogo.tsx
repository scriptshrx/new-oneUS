import Link from 'next/link';

type BrandLogoProps = {
  href?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
};

const imageHeights: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

const taglineSizes: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-[9px] leading-3',
  md: 'text-[10px] leading-[14px]',
  lg: 'text-[11px] leading-4',
};

export default function BrandLogo({
  href = '/',
  className = '',
  size = 'md',
  onDark = false,
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex max-w-[220px] flex-col items-start ${className}`}>
      <span className={onDark ? 'rounded-md bg-white px-2 py-1' : ''}>
        <img
          src="/images/scriptishrx-logo.png"
          alt="ScriptishRx"
          className={`${imageHeights[size]} w-auto`}
        />
      </span>
      <span
        className={`mt-1 font-medium tracking-[0.01em] ${taglineSizes[size]} ${
          onDark ? 'text-background/70' : 'text-muted-foreground'
        }`}
      >
        Coordinating Care, Enhancing Longevity
      </span>
    </span>
  );

  if (href === null) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex shrink-0" aria-label="ScriptishRx home">
      {content}
    </Link>
  );
}
