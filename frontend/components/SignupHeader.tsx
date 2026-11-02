'use client';

import BrandLogo from '@/components/BrandLogo';

export default function SignupHeader() {
  return (
    <div className="w-full border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <BrandLogo size="md" />
      </div>
    </div>
  );
}
