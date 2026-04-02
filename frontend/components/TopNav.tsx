'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const[selecetedNav,setSelectedNav]=useState('features')
  const path = usePathname()
  console.log(path)

  return (
    <nav className="fixed top-0 left-0 right-0 z-700 backdrop-blur-md bg-gradient-to-l from-background via-background/30 to-primary/10 border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl moveBg sm:text-2xl font-bold bg-gradient-to-r from-primary/10 via-primary/80 to-primary/10 text-transparent bg-clip-text ">
              Scriptish
            </Link>
          </div>

          {/* Desktop Menu */}
          {(!path.includes('register') || !path.includes('login'))&&<>
         <div className="hidden md:flex hidden space-x-8">
            <Link 
            onClick={()=>setSelectedNav('features')}

            href="#features" className={` hover:text-brand transition-colors text-sm lg:text-base
            ${selecetedNav=='features'?'text-chart-2':'text-forground/80'}`}>
              Features
            </Link>
            <Link 
            onClick={()=>setSelectedNav('testimonials')}
            href="#testimonials" className={`hover:text-brand transition-colors text-sm lg:text-base
            ${selecetedNav=='testimonials'?'text-chart-2':'text-forground/80'}`}>
              Testimonials
            </Link>
            <Link
            onClick={()=>setSelectedNav('how-it-works')}
             href="#pipeline" className={`
              ${selecetedNav=='how-it-works'?'text-chart-2':'text-forground/80'}
              hover:text-brand transition-colors text-sm lg:text-base`}>
              How It Works
            </Link>
            <Link 
            onClick={()=>setSelectedNav('pricing')}
            href="#pricing" className={`
              ${selecetedNav=='pricing'?'text-chart-2':'text-forground/80'}
               hover:text-brand transition-colors text-sm lg:text-base`}>
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="default">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="default">
                Sign Up
              </Button>
            </Link>
          </div>
          </>}

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
            <div className="flex gap-3 pt-4 flex-col">
              <Link href="/login" className="w-full">
                <Button variant="ghost" size="default" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="default" size="default" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
