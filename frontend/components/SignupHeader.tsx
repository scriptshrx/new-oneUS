'use client';

import Link from 'next/link';

export default function SignupHeader() {
  return (
    <div className="w-full border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-base">S</span>
          </div>
          <span className="font-bold text-lg sm:text-xl text-foreground group-hover:text-brand transition-colors">
            Scriptish
          </span>
        </Link>
      </div>
    </div>
  );
}
