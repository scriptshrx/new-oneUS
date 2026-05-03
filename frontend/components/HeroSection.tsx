'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, DollarSign, Zap } from 'lucide-react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  index?: number;
  image?: string;
}

const animationStyles = `
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-150px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-150px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(150px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

function AnimatedStat({ value, suffix, label, icon, index = 0, image }: StatItem) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getAnimationName = () => {
    if (index === 0) return 'slideInFromLeft';
    if (index === 1) return 'slideInFromTop';
    if (index === 2) return 'slideInFromRight';
    return 'slideInFromLeft';
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);


  useEffect(() => {
    if (isInView && !hasAnimated) {
      const delay = index * 4000; // 4 seconds between each counter
      const delayTimer = setTimeout(() => {
        setHasAnimated(true);

        let currentValue = 0;
        const duration = 6000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 2);
          currentValue = Math.floor(value * progress);
          setDisplayValue(currentValue);
          if (progress < 1) requestAnimationFrame(animate);
          else setDisplayValue(value);
        };

        animate();
      }, delay);

      return () => clearTimeout(delayTimer);
    }
  }, [isInView, hasAnimated, value, index]);

  return (
    <div 
      ref={ref}
      className="relative group -mt-4 shadow-lg rounded-2xl"
      style={{
        animation: isInView ? `${getAnimationName()} 1s ease-out` : 'none',
      }}
    >
      <div className="relative h-50 rounded-2xl overflow-hidden">
        {/* Background image */}
        {image && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <img
              src={image}
              alt=""
              className="w-full h-full group-hover:scale-[1.1] transition-all object-cover"
            />
          </div>
        )}

        {/* Main border */}
        <div className="absolute inset-0 rounded-2xl backdrop-blur-[0.02px] border-[6px] border-purple-800" />

        {/* ✨ Top-right shiny corner */}
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className="w-8 h-8 rounded-tr-2xl overflow-hidden">
            {/* shiny reflection */}
            <div className="absolute inset-0 bg-gradient-to-bl from-white/80 via-white/20 to-transparent opacity-70 blur-[2px]" />
          </div>
        </div>

        {/* Content layer */}
        <div className="absolute inset-0 flex items-center justify-center perspective overflow-hidden rounded-2xl">
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {

  const highlights = [
    { name: 'Patient Referral', color: 'purple-500' },
    { name: 'Insurance Verification', color: 'green-500' },
    { name: 'Prior Authorization', color: 'orange-500' },
    { name: 'Automated Scheduling', color: 'yellow-800' },
    { name: 'Agentic Follow-Up', color: 'accent' },
    { name: 'Seamless Infusion', color: 'blue-500' },
  ];

  const [highlight, setHighlight] = useState(highlights[0].name);
  const [color, setColor] = useState(highlights[0].color);

  useEffect(() => {
    let count = 1;
    const interval = setInterval(() => {
      setHighlight(highlights[count].name);
      setColor(highlights[count].color);
      count = (count + 1) % highlights.length;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{animationStyles}</style>
      <section className="relative w-full pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Clinician background image */}
      <div
        className="absolute inset-0 opacity-40 transition-all md:-mt-12 duration-700 dark:opacity-10 pointer-events-none"
      
      >
        <img
          src="/clinician5.jpg"
          alt="Clinician"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-transparent dark:bg-background moveBg" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 sm:mb-8 h-[100px] md:-mt-10 items-center justify-center relative flex overflow-hidden">
            {highlight && (
              <button
                className="flex items-center h-[40px] moveHighlight -top-[100px] rounded-full px-[2px] relative overflow-hidden justify-center"
                style={{ clipPath: 'inset(0)' }}
              >
                <div className="h-[500%] absolute rotateInner w-[200%] bg-gradient-to-tr from-transparent via-transparent to-purple-500" />
                <div
                  className={`text-center items-center justify-center flex h-[38px] bg-purple-500/20 dark:bg-accent/20 text-purple-600 dark:text-accent-foreground z-[400] rounded-full dark:border self-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold`}
                >
                  {highlight}
                </div>
              </button>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-accent via-accent to-primary mb-4 sm:mb-6  text-transparent bg-clip-text leading-tight">
            Operating System for {' '}
            <span className="text-primary enlargeBgText">
             Infusion Clinics
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-accent/80 sm:text-lg lg:text-xl mb-8 sm:mb-12 text-balance leading-relaxed">
            Scriptish provides insurance verification, prior authorizations, and patient intake for IV therapy, ketamine, NAD+, and infusion clinics.
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 grid-cols-1 sm:px-18 gap-20 mt-12 sm:-mt-10 pt-12 sm:pt-20 border-t border-border/20">
            <AnimatedStat value={105} suffix="+" label="Clinics Automated" icon={<Building2 size={80} strokeWidth={1.5} />} index={0} image="/heroImage1.2.png" />
            <AnimatedStat value={22} suffix="M+" label="Claims Processed" icon={<DollarSign size={80} strokeWidth={1.5} />} index={1} image="/heroImage2.png" />
            <AnimatedStat value={99.9} suffix="%" label="Uptime Support" icon={<Zap size={80} strokeWidth={1.5} />} index={2} image="/heroImage3.png" />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}