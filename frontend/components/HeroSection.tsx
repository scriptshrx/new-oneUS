'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Building2, DollarSign, Zap } from 'lucide-react';
// import Particles from '@tsparticles/react';
// import { initParticlesEngine } from '@tsparticles/react';
// import { loadSlim } from '@tsparticles/slim';
// import type { Engine, ISourceOptions } from '@tsparticles/engine';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  index?: number;
}

function AnimatedStat({ value, suffix, label, icon, index = 0 }: StatItem) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className="relative group -mt-4">
      <div className="absolute inset-0 rounded-2xl overflow-hidden bg-primary/20 backdrop-blur-md border px-auto border-primary/70" />
      <div className="absolute inset-0 flex items-center justify-center perspective overflow-hidden rounded-2xl">
       
      </div>
      <div className="relative z-10 p-6 sm:p-8">
        <div className="text-2xl sm:text-4xl font-bold text-accent">
          {displayValue==50?`$${displayValue}`:displayValue}
          <span className="text-primary/50">{suffix}</span>
        </div>
        <div className="text-xs sm:text-sm text-primary mt-2">{label}</div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [engineReady, setEngineReady] = useState(false);

  // Initialize tsParticles engine once
 

  // ─────────────────────────────────────────────────────────────
  // 🎛️  ALL PARTICLE BEHAVIOUR IS CONTROLLED HERE
  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // 🎛️  FIREFLY BEHAVIOUR (Original Color)
  // ─────────────────────────────────────────────────────────────
  const particlesOptions: ISourceOptions = useMemo(() => ({
    fullScreen: { enable: false },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'bubble', 
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
      modes: {
        bubble: {
          distance: 200,
          size: 8,
          duration: 2,
          opacity: 0.8,
        },
        push: {
          quantity: 4,
        },
      },
    },
    particles: {
      number: {
        value: 40,
        density: {
          enable: true,
          area: 800,
        },
      },
      color: {
        value: 'hsl(301, 100%, 50%)', // Reverted to your original purple/pink
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.1, max: 0.3 },
        animation: {
          enable: true,
          speed: 0.8,
          sync: false,
          startValue: "random",
        },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
      },
      // ── Movement: Bottom-Left to Top-Right ─────────────────
      move: {
        enable: true,
        speed: { min: 0.4, max: 1.2 },
        direction: 'top-right', 
        random: true,           // Makes flight paths non-linear
        straight: false,        // Essential for "smooth" drifting
        outModes: {
          default: 'out',       // Re-spawns at the opposite side (bottom-left)
        },
      },
      // ── Firefly Glow ──────────────────────────────────────
      shadow: {
        enable: true,
        color: 'hsl(301, 100%, 50%)',
        blur: 8,
      },
      // ── Disabled links for the firefly look ────────────────
      links: {
        enable: false,
      },
    },
    detectRetina: true,
  }), []);
  // ─────────────────────────────────────────────────────────────

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

   /*useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);*/

  return (
    <section className="relative w-full pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">

      {/* ── tsParticles canvas ── */}
      {engineReady && (
        <Particles
          id="hero-particles"
          options={particlesOptions}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-background dark:bg-background moveBg" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 sm:mb-8 h-[100px] md:-mt-10 items-center justify-center relative flex overflow-hidden">
            {highlight && (
              <div
                className="flex items-center h-[40px] moveHighlight -top-[100px] rounded-full px-[2px] relative overflow-hidden justify-center"
                style={{ clipPath: 'inset(0)' }}
              >
                <div className="h-[500%] absolute rotateInner w-[200%] bg-gradient-to-tr from-transparent via-transparent to-primary" />
                <div
                  className={`text-center items-center justify-center flex h-[38px] bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent-foreground z-[400] rounded-full dark:border self-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold`}
                >
                  {highlight}
                </div>
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-accent via-accent to-primary mb-4 sm:mb-6  text-transparent bg-clip-text leading-tight">
            Operating System For Infusion{' '}
            <span className="text-primary enlargeBgText">
             Clinics
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-accent/80 sm:text-lg lg:text-xl mb-8 sm:mb-12 text-balance leading-relaxed">
            Scriptish automates insurance verification, prior authorizations, and patient intake for IV therapy, ketamine, NAD+, and infusion clinics.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 pt-12 sm:pt-20 border-t border-border/20">
            <AnimatedStat value={500} suffix="+" label="Clinics Automated" icon={<Building2 size={80} strokeWidth={1.5} />} index={0} />
            <AnimatedStat value={50} suffix="M+" label="Claims Processed" icon={<DollarSign size={80} strokeWidth={1.5} />} index={1} />
            <AnimatedStat value={99.9} suffix="%" label="Uptime" icon={<Zap size={80} strokeWidth={1.5} />} index={2} />
          </div>
        </div>
      </div>
    </section>
  );
}