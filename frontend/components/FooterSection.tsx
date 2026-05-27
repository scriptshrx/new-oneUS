'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FooterSection() {
  const [isIPRVisible, setIPRVisible] = useState(false);
  const [isPrivacyVisible, setPrivacyVisible] = useState(false);
  const [isHIPAAVisible, setHIPAAVisible] = useState(false);
  const [isTermsVisible, setTermsVisible] = useState(false);
  const [isPrivacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [isSecurityVisible, setSecurityVisible] = useState(false);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20 bg-clip-text text-transparent mb-4 inline-block">
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
          {/* <div>
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
          </div> */}
        </div>

   {/* Collapsible Sections */}
       
         <div className="mt-8">
        
          <button
            onClick={() => setHIPAAVisible(!isHIPAAVisible)}
            className="w-full flex justify-between items-center text-left text-sm sm:text-base font-semibold text-foreground hover:text-brand transition-colors mt-4"
          >
            HIPAA Compliance
            <ChevronDown
              className={`w-5 h-5 transition-transform absolute left-60 ${isHIPAAVisible ? 'rotate-180' : ''}`}
            />
          </button>
          {isHIPAAVisible && (
            <div className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
              <p><strong>HIPAA Compliance Overview:</strong></p>
              <p>Scriptish LLC is committed to maintaining the confidentiality, integrity, and security of protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and its implementing regulations. We adhere to the following principles:</p>
              <ul className="list-disc pl-6">
                <li><strong>Data Encryption:</strong> All PHI is encrypted using AES-256 encryption at rest and TLS 1.2+ during transmission.</li>
                <li><strong>Access Controls:</strong> Role-based access controls ensure that only authorized personnel can access PHI.</li>
                <li><strong>Audit Logging:</strong> Continuous monitoring and logging of access to PHI to detect and respond to unauthorized activities.</li>
                <li><strong>Business Associate Agreements (BAAs):</strong> We maintain signed BAAs with all covered entities and subcontractors to ensure compliance.</li>
                <li><strong>Training:</strong> All employees undergo regular HIPAA compliance training to stay updated on best practices and legal requirements.</li>
                <li><strong>Incident Response:</strong> A robust incident response plan is in place to address potential breaches or security incidents promptly.</li>
              </ul>
              <p>By using Scriptish, you can trust that your clinic’s PHI is handled with the highest standards of security and compliance.</p>
            </div>
          )}

          <button
            onClick={() => setSecurityVisible(!isSecurityVisible)}
            className="w-full flex justify-between items-center text-left text-sm sm:text-base font-semibold text-foreground hover:text-brand transition-colors mt-4"
          >
            Security
            <ChevronDown
              className={`w-5 h-5 transition-transform absolute left-60 ${isSecurityVisible ? 'rotate-180' : ''}`}
            />
          </button>
          {isSecurityVisible && (
            <div className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
              <p>
                The Scriptish platform employs industry-standard safeguards, including AES-256 encryption at rest, TLS 1.2+ in transit, row-level database isolation per clinic, multi-factor authentication for all staff accounts, session-based access controls, and continuous audit logging. Security events are monitored in real time. Despite these measures, no system is completely immune to unauthorized access, and Scriptish LLC does not warrant that the platform will be free from security breaches.
              </p>
            </div>
          )}

          <button
            onClick={() => setIPRVisible(!isIPRVisible)}
            className="w-full flex justify-between items-center text-left text-sm sm:text-base font-semibold text-foreground hover:text-brand transition-colors mt-4"
          >
            Intellectual Property Rights
            <ChevronDown
              className={`w-5 h-5 transition-transform absolute left-75 ${isIPRVisible ? 'rotate-180' : ''}`}
            />
          </button>
          {isIPRVisible && (
            <div className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed space-y-4">
              <p>
                <strong>Trademarks.</strong> &quot;Scriptish&quot; and &quot;Scriptish,&quot; the Scriptish logo, and all related product names, service names, and slogans are trademarks or registered trademarks of Scriptish LLC. Unauthorized use of any Scriptish trademark is strictly prohibited.
              </p>
              <p>
                <strong>Patents.</strong> A patent application covering the Scriptish platform is currently pending in the United States. No license, express or implied, to any patent of Scriptish LLC is granted by accessing or using this platform.
              </p>
              <p>
                <strong>Copyrights.</strong> All content, software, source code, algorithms, user interface designs, text, graphics, and other materials on this platform are © 2024–2026 Scriptish LLC and are protected under U.S. and international copyright laws. Reproduction, distribution, or modification without prior written consent is prohibited.
              </p>
              <p>
                <strong>Proprietary Software.</strong> The Scriptish platform, including its infusion workflow engine, live chair orchestration system, prior authorization automation, and HIPAA-compliant data layer, constitutes proprietary trade secrets of Scriptish LLC. Access is granted solely under the terms of an executed agreement.
              </p>
              <p>
                <strong>Restrictions.</strong> You may not reverse-engineer, decompile, disassemble, sublicense, sell, or create derivative works from any part of the Scriptish platform. Any unauthorized use may subject you to civil and criminal liability under applicable law.
              </p>
            </div>
          )}

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
