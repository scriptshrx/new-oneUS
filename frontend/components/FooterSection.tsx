'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FooterSection() {
  const [isIPRVisible, setIPRVisible] = useState(false);
  const [isPrivacyVisible, setPrivacyVisible] = useState(false);

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

   {/* Collapsible Sections */}
       
         <div className="mt-8">
          <button
            onClick={() => setIPRVisible(!isIPRVisible)}
            className="w-full flex justify-between items-center text-left text-sm sm:text-base font-semibold text-foreground hover:text-brand transition-colors"
          >
            Intellectual Property Rights
            <ChevronDown
              className={`w-5 h-5 transition-transform absolute left-75 ${isIPRVisible ? 'rotate-180' : ''}`}
            />
          </button>
          {isIPRVisible && (
            <div className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
              <p><strong>Trademarks.</strong> "Scriptish" and "Scriptish," the Scriptish logo, and all related product names, service names, and slogans are trademarks or registered trademarks of Scriptish LLC. Unauthorized use of any Scriptish trademark is strictly prohibited.</p>
              <p><strong>Patents.</strong> A patent application covering the Scriptish platform is currently pending in the United States. No license, express or implied, to any patent of Scriptish LLC is granted by accessing or using this platform.</p>
              <p><strong>Copyrights.</strong> All content, software, source code, algorithms, user interface designs, text, graphics, and other materials on this platform are © 2024–2026 Scriptish LLC and are protected under U.S. and international copyright laws. Reproduction, distribution, or modification without prior written consent is prohibited.</p>
              <p><strong>Proprietary Software.</strong> The Scriptish platform, including its infusion workflow engine, live chair orchestration system, prior authorization automation, and HIPAA-compliant data layer, constitutes proprietary trade secrets of Scriptish LLC. Access is granted solely under the terms of an executed agreement.</p>
              <p><strong>Restrictions.</strong> You may not reverse-engineer, decompile, disassemble, sublicense, sell, or create derivative works from any part of the Scriptish platform. Any unauthorized use may subject you to civil and criminal liability under applicable law.</p>
            </div>
          )}

          <button
            onClick={() => setPrivacyVisible(!isPrivacyVisible)}
            className="w-full flex justify-between items-center text-left text-sm sm:text-base font-semibold text-foreground hover:text-brand transition-colors mt-4"
          >
            Privacy, Security & Legal Disclosure
            <ChevronDown
              className={`w-5 h-5 transition-transform absolute left-90 ${isPrivacyVisible ? 'rotate-180' : ''}`}
            />
          </button>
          {isPrivacyVisible && (
            <div className="mt-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
              <p><strong>Privacy & Data Use.</strong> Scriptish LLC collects and processes only the personal and protected health information ("PHI") necessary to deliver our prior authorization coordination services. All PHI is handled in accordance with the Health Insurance Portability and Accountability Act of 1996 ("HIPAA") and its implementing regulations. We maintain a signed Business Associate Agreement ("BAA") with each covered entity client and do not sell, rent, or disclose PHI to third parties except as required to fulfill the contracted services or as mandated by applicable law. Users retain all rights to their patient data.</p>
              <p><strong>Security Practices.</strong> The Scriptish platform employs industry-standard safeguards, including AES-256 encryption at rest, TLS 1.2+ in transit, row-level database isolation per clinic, multi-factor authentication for all staff accounts, session-based access controls, and continuous audit logging. Security events are monitored in real time. Despite these measures, no system is completely immune to unauthorized access, and Scriptish LLC does not warrant that the platform will be free from security breaches.</p>
              <p><strong>Disclaimer of Warranties.</strong> THE Scriptish PLATFORM AND ALL RELATED SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, RELIABILITY, OR NON-INFRINGEMENT. Scriptish LLC MAKES NO WARRANTY THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS, OPERATE WITHOUT INTERRUPTION, OR BE ERROR-FREE.</p>
              <p><strong>Limitation of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, Scriptish LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, MEMBERS, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES — INCLUDING LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITY — ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE PLATFORM, EVEN IF Scriptish LLC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL Scriptish LLC'S AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE PLATFORM EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU TO Scriptish LLC IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100). THE FOREGOING LIMITATIONS APPLY TO THE FULLEST EXTENT PERMITTED BY LAW IN YOUR JURISDICTION.</p>
              <p><strong>Indemnification.</strong> You agree to defend, indemnify, and hold harmless Scriptish LLC and its officers, directors, employees, members, contractors, licensors, and service providers from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising out of or relating to: (i) your use of or access to the platform; (ii) your violation of these terms, any applicable law, or any rights of a third party; (iii) any PHI or other data you submit through the platform; (iv) your clinic's failure to maintain appropriate HIPAA compliance; or (v) any claim that content you submit caused damage to a third party. Scriptish LLC reserves the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you agree to cooperate with Scriptish LLC in asserting available defenses.</p>
              <p><strong>No Medical or Legal Advice.</strong> The Scriptish platform is an administrative workflow and coordination tool only. Nothing on this platform constitutes medical advice, clinical guidance, legal advice, or a substitute for the judgment of a licensed healthcare professional or legal counsel. Payer determinations, formulary decisions, and prior authorization outcomes are made solely by the relevant payer or plan. Scriptish LLC has no control over, and accepts no responsibility for, any payer decision or clinical outcome.</p>
              <p><strong>Third-Party Services.</strong> The platform may integrate with or link to third-party services, payer portals, or external websites. Scriptish LLC does not endorse, control, or assume responsibility for any third-party service or content. Your use of any third-party service is governed solely by that party's terms and privacy policy.</p>
              <p><strong>Governing Law & Dispute Resolution.</strong> These disclosures and any dispute arising from use of the platform are governed by the laws of the State of Illinois, without regard to its conflict-of-law provisions. Any dispute not resolved informally shall be submitted to binding arbitration under the rules of the American Arbitration Association (AAA) in Chicago, Illinois. YOU WAIVE ANY RIGHT TO A JURY TRIAL OR CLASS ACTION PROCEEDING. Nothing herein prevents Scriptish LLC from seeking injunctive or equitable relief in any court of competent jurisdiction to protect its intellectual property rights.</p>
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
