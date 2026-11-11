'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function FooterSection() {
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-[720px] px-5 text-center sm:px-8">
          <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[48px]">
            See where your clinic is
            <br />
            losing time — and patients.
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-7 text-muted-foreground">
            20 minutes. We&apos;ll map your intake-to-renewal workflow and show you exactly what we&apos;d take over. No commitment.
          </p>
          <Link
            href="/join-waitlist"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-[14px] font-medium text-accent-foreground hover:bg-accent/90"
          >
            Book your workflow review
          </Link>
          <p className="mt-6 text-[14px] text-muted-foreground">
            Prefer to reach out directly?{' '}
            <a href="mailto:info@scriptishrx.com" className="font-medium text-foreground underline underline-offset-2">
              info@scriptishrx.com
            </a>
            {' · '}
            <a href="tel:8728732880" className="font-medium text-foreground underline underline-offset-2">
              872-873-2880
            </a>
          </p>
        </div>
      </section>

      <footer className="bg-foreground text-background">
        <div className="mx-auto max-w-[1120px] px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <BrandLogo size="md" onDark href="/" />
              <p className="mt-4 max-w-[280px] text-[14px] leading-6 text-background/60">
                Care coordination for wellness and longevity clinics. Providers treat — we handle everything else.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold">Company</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-background/60">
                <li>
                  <Link href="/#about" className="hover:text-background">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-background">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/join-waitlist" className="hover:text-background">
                    Book a review
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold">Trust</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-background/60">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSecurityOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-left hover:text-background"
                    aria-expanded={isSecurityOpen}
                  >
                    Security &amp; BAA
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${isSecurityOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </li>
                {isSecurityOpen && (
            <div className="mt-8 max-w-4xl text-[14px] whitespace-pre-wrap md:w-[500px] text-left leading-7 text-background/80">
              <span className='text-accent'>The Scriptish</span> platform employs industry-standard safeguards, including AES-256 encryption at rest, TLS 1.2+ in transit, row-level database isolation per clinic, multi-factor authentication for all staff accounts, session-based access controls, and continuous audit logging. Security events are monitored in real time. Despite these measures, no system is completely immune to unauthorized access, and Scriptish LLC does not warrant that the platform will be free from security breaches.
            </div>
          )}
               
                <button
                    type="button"
                    onClick={() => setIsPrivacyOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-left hover:text-background"
                    aria-expanded={isPrivacyOpen}
                  >
                    Privacy Policy & Terms of Service
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${isPrivacyOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isPrivacyOpen && (
            <div className="mt-8 max-w-4xl text-[14px] whitespace-pre-wrap md:w-[500px] text-left leading-7 text-background/80">
              <span className='font-bold'>ScriptishRx Privacy Policy & Terms of
Service</span><br></br>
<span className='italic text-xs'>Nov 7,2026 . @Gil Marquez</span><br></br>

<span className='font-semibold'>At a glance: Privacy & Terms summary</span><br></br>
ScriptishRx handles admin work for healthcare practices, protects patient data under
HIPAA, and leaves all care decisions to providers. The full policies below govern.<br></br>

<span className='font-semibold'>Privacy in brief</span><br></br>
<span className='font-bold'>·</span> We never sell your data or use patient information for marketing.<br></br>
<span className='font-bold'>·</span> Patient data is handled only for your provider, under a signed HIPAA agreement.<br></br>
<span className='font-bold'>·</span> Our Al does admin tasks only, says it's automated, and has human backup.<br></br>
<span className='font-bold'>·</span> Email [PRIVACY EMAIL] to access or delete your information; reply STOP to end texts.<br></br>

<span className='font-semibold'>Terms in brief</span><br></br>

<span className='font-bold'>·</span> We are not a medical provider and give no medical advice. In emergencies, call 911.<br></br>
<span className='font-bold'>·</span> Practices review Al and insurance results and obtain required patient consents.<br></br>
<span className='font-bold'>·</span> Our liability is capped at 12 months of fees paid.<br></br>
<span className='font-bold'>·</span> Illinois law and Cook County courts apply.<br></br><br></br>
Questions? Contact <a href='mailto:info@scriptishrx.com' className='text-blue-500 hover:text-blue-400'>info@scriptishrx.com</a> or 872-873-2880.
            </div>
          )}
            
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold">Contact</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-background/60">
                <li>
                  <a href="mailto:info@scriptishrx.com" className="hover:text-background">
                    info@scriptishrx.com
                  </a>
                </li>
                <li>
                  <a href="tel:8728732880" className="hover:text-background">
                    872-873-2880
                  </a>
                </li>
                <li>111 N Wabash Ave, Chicago, IL</li>
              </ul>
            </div>
          </div>
        
       
          <div className="mt-12 border-t border-background/10 pt-6">
            <p className="text-[12px] text-background/40">© 2026 ScriptishRx. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
