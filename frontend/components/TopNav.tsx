'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

const navLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/#how-we-work', label: 'How we work' },
  // { href: '/#pricing', label: 'Pricing' },
  { href: '/#about', label: 'About' },
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex min-h-[72px] max-w-[1120px] items-center justify-between gap-4 py-3 px-5 sm:px-8">
        <BrandLogo size="sm" />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <Link
              href="/join-waitlist"
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book a workflow review
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-border bg-background px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign up
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2 border-t border-border px-5 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-[14px] text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/join-waitlist"
            className="mt-2 inline-flex rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            Book a workflow review
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-md border border-border bg-background px-4 py-2 text-[13px] font-medium text-foreground"
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
