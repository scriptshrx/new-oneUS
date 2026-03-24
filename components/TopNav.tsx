'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent">
              Scriptish
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="#features" className="text-foreground/80 hover:text-brand transition-colors text-sm lg:text-base">
              Features
            </Link>
            <Link href="#testimonials" className="text-foreground/80 hover:text-brand transition-colors text-sm lg:text-base">
              Testimonials
            </Link>
            <Link href="#pipeline" className="text-foreground/80 hover:text-brand transition-colors text-sm lg:text-base">
              How It Works
            </Link>
            <Link href="#pricing" className="text-foreground/80 hover:text-brand transition-colors text-sm lg:text-base">
              Pricing
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="px-6 py-2 rounded-lg bg-brand text-white font-semibold hover:opacity-90 transition-opacity text-sm lg:text-base">
              Book Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="#features" className="block text-foreground/80 hover:text-brand py-2 transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="block text-foreground/80 hover:text-brand py-2 transition-colors">
              Testimonials
            </Link>
            <Link href="#pipeline" className="block text-foreground/80 hover:text-brand py-2 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="block text-foreground/80 hover:text-brand py-2 transition-colors">
              Pricing
            </Link>
            <button className="w-full px-6 py-2 rounded-lg bg-brand text-white font-semibold hover:opacity-90 transition-opacity mt-4">
              Book Demo
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
