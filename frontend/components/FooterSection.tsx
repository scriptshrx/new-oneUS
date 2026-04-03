'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FooterSection() {
  return (
    <footer id="pricing" className="bg-card/50 border-t border-border/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* CTA Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20 p-8 sm:p-12 rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-background to-accent/10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Ready to <span className="text-brand">Transform</span> Your Clinic?
          </h2>
          <p className="text-base sm:text-lg text-foreground/70 mb-8 max-w-2xl text-balance leading-relaxed">
            Join hundreds of clinics already automating their operations with Scriptish. Get a personalized demo today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/join-waitlist">
              <Button variant="default" size="lg">
                Join Waitlist
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent mb-4 inline-block">
              Scriptish
            </Link>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed mb-6">
              Modern healthcare operations software for IV therapy, ketamine, NAD+, and infusion clinics.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center hover:border-brand/50 hover:text-brand transition-all text-foreground/60 text-lg">
                𝕏
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center hover:border-brand/50 hover:text-brand transition-all text-foreground/60 text-lg">
                f
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center hover:border-brand/50 hover:text-brand transition-all text-foreground/60 text-lg">
                in
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#pipeline" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  HIPAA Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-brand transition-colors text-sm sm:text-base">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-12 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-foreground/60">
            © 2026 Scriptish. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs sm:text-sm">
            <Link href="#" className="text-foreground/60 hover:text-brand transition-colors">
              Status
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-brand transition-colors">
              Support
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-brand transition-colors">
              Changelog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
