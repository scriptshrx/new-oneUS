'use client';

import { useEffect, useRef, useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
}

function FeatureCard({ icon, title, description, isVisible }: FeatureCardProps) {
  return (
    <div
      className={`p-6 sm:p-8 rounded-xl border border-border/20 bg-card/50 backdrop-blur-sm hover:border-brand/50 hover:bg-card/80 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-3xl sm:text-4xl mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">{description}</p>
    </div>
  );
}

export default function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false, false, false]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🔐',
      title: 'Insurance Verification',
      description: 'Real-time EDI 270/271 integration for instant patient coverage verification and eligibility checks.',
    },
    {
      icon: '⚡',
      title: 'Prior Auth Automation',
      description: 'Automate the entire prior authorization process with intelligent workflow management.',
    },
    {
      icon: '🏥',
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with full HIPAA compliance and data encryption.',
    },
    {
      icon: '📱',
      title: 'Patient Portal',
      description: 'Seamless patient intake and appointment management with branded white-label solutions.',
    },
    {
      icon: '🤖',
      title: 'AI Voice Agent',
      description: 'Intelligent voice assistant for patient intake, appointments, and follow-ups.',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time insights into clinic operations, claims, and patient metrics.',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the card animations
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Everything You Need to <span className="text-brand">Automate</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/60 text-balance leading-relaxed">
            Comprehensive suite of tools designed specifically for modern medical clinics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              isVisible={visibleCards[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
