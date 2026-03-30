'use client';

import { useEffect, useRef, useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
  bgColor: string;
  textColor: string;
  textColor2:string
  image:string
}

function FeatureCard({ icon, image, title, description, isVisible, bgColor, textColor2, textColor }: FeatureCardProps) {
  return (
    <div
      className={`feature-card relative p-6 sm:p-8 rounded-xl border backdrop-blur-md transition-all duration-500 transform overflow-hidden shadow-lg hover:shadow-none hover:bg-accent/50 cursor-pointer${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        
        borderColor: 'transparent',
        '--hover-border-color': textColor,
      } as React.CSSProperties}
    >
      {/* Background icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        {image ? <img className='w-[50%] h-[70%] object-cover' src={image} /> :
        <div className="text-8xl sm:text-9xl font-bold select-none">{icon}</div>}
      </div>

      {/* Content */}
      <div className="relative z-10 py-4">
        {/*<div className="text-3xl sm:text-4xl mb-4">{icon}</div>*/}
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm sm:text-base opacity-90 leading-relaxed" 
        style={{color:textColor2} as React.CSSProperties}>{description}</p>
      </div>
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
      bgColor: 'hsla(220, 100%, 55%, 0.05)',
      textColor: 'hsl(220, 100%, 40%)',
      textColor2:'hsla(220, 100%, 40%, 0.7)',
      image:'/insuranceVerify.png'
    },
    {
      icon: '⚡',
      title: 'Automated Prior Auth',
      description: 'Automate the entire prior authorization process with intelligent workflow management.',
      bgColor: 'hsla(100, 100%, 50%, 0.05)',
      textColor: 'hsl(100, 85%, 35%)',
      textColor2:'hsla(100, 85%, 35%, 0.7)',
      image:'/priorAuth.png'
    },
    {
      icon: '🏥',
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with full HIPAA compliance and data encryption.',
      bgColor: 'hsla(210, 90%, 55%, 0.05)',
      textColor: 'hsl(210, 90%, 35%)',
      textColor2:'hsla(210, 90%, 35%, 0.7)',
      image:'/medicalRecord.png'
    },
    {
      icon: '📱',
      title: 'Patient Portal',
      description: 'Seamless patient intake and appointment management with branded white-label solutions.',
      bgColor: 'hsla(210, 100%, 55%, 0.05)',
      textColor: 'hsl(210, 100%, 40%)',
      textColor2:'hsla(210, 100%, 40%, 0.7)',
      image:'/patientPortal.png'
    },
    {
      icon: '🤖',
      title: 'AI Voice Agent',
      description: 'Intelligent voice assistant for patient intake, appointments, and follow-ups.',
      bgColor: 'hsla(260, 90%, 55%, 0.05)',
      textColor: 'hsl(260, 90%, 40%)',
      textColor2:'hsla(260, 90%, 40%, 0.7)',
      image:'/aiVoiceAgent.png'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time insights into clinic operations, claims, and patient metrics.',
      bgColor: 'hsla(165, 100%, 50%, 0.05)',
      textColor: 'hsl(165, 100%, 30%)',
      textColor2:'hsla(165, 100%, 30%, 0.7)'
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
    <section id="features" ref={sectionRef} className="py-16 sm:py-24 md:-mt-8 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className='flex items-center h-[40px] w-[180px] mx-auto rounded-full px-[2px] relative overflow-hidden justify-center mb-4'
          >
            <div className='h-[500%] absolute rotateInner2 w-[200%] bg-gradient-to-tr  from-transparent via-transparent to-primary'/>
            <div className={`text-center items-center justify-center flex h-[38px] bg-background text-primary z-[400] rounded-full  self-center px-3 sm:px-4 py-1.5 sm:py-2 bg-brand/10 text-xs sm:text-sm w-full font-semibold`}>
            Powerful Features
            </div>

            </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-accent mb-4 sm:mb-6 text-balance">
            Everything You Need to <span className="text-primary">Automate</span>
          </h2>
          <p className="max-w-2xl mx-auto text-primary sm:text-lg text-foreground/60 text-balance leading-relaxed">
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
              bgColor={feature.bgColor}
              textColor={feature.textColor}
              textColor2={feature.textColor2}
              image={feature.image}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .feature-card:hover {
          border-color: var(--hover-border-color) !important;
        }
      `}</style>
    </section>
  );
}
