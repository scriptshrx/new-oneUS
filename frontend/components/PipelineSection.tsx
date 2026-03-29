'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';

interface PipelineNode {
  label: string;
  description: string;
}

// Generate shade variations of the brand color (purple: oklch(0.621 0.153 301.1))
const brandShades = [
  'oklch(0.621 0.153 301.1)', // Original brand
  'oklch(0.580 0.145 301.1)', // Darker shade 1
  'oklch(0.540 0.138 301.1)', // Darker shade 2
  'oklch(0.500 0.130 301.1)', // Darker shade 3
  'oklch(0.460 0.122 301.1)', // Darker shade 4
];

function PipelineCircle({ node, index, isActivated }: { node: PipelineNode; index: number; isActivated: boolean }) {
  return (
    <div className="flex flex-col items-center mt-0">
      <div
        className="w-12 sm:w-16 lg:w-20 xl:w-24 h-12 sm:h-16 lg:h-20 xl:h-24 rounded-full border-2 flex items-center justify-center font-semibold text-[30px] sm:text-[40px] lg:text-[60px] transition-all duration-700 border-brand"
        style={{
          backgroundColor: isActivated ? brandShades[index] : 'white',
          color: isActivated ? 'white' : 'oklch(0.30 0.005 106.7)',
          boxShadow: isActivated ? `0 0 24px rgba(157, 78, 221, 0.11)` : 'none',
        }}
      >
        {index + 1}
      </div>
      <p className="text-xs sm:text-sm font-semibold text-foreground mt-3 sm:mt-4 text-center max-w-16 sm:max-w-20 lg:max-w-24">{node.label}</p>
     
    </div>
  );
}

export default function PipelineSection() {
  const [activeCircles, setActiveCircles] = useState<boolean[]>([]);
  const [animatingLine, setAnimatingLine] = useState<{ from: number; to: number; progress: number } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Ensure hydration is complete before starting animations
  useLayoutEffect(() => {
    setIsHydrated(true);
  }, []);

  const pipelineNodes: PipelineNode[] = [
    { label: 'Patient Intake', description: 'Seamless form submission process, with support for document uploads' },
    { label: 'Insurance Check', description: 'Automated and real-time verification of patient insurance'},
    { label: 'Prior Auth', description: 'Zero-effort prior authorization process' },
    { label: 'Approval', description: 'Auomated approval with instant confirmation' },
    { label: 'Schedule', description: 'CRM based sheduling and automated appointment booking' },
  ];

  useEffect(() => {
    if (!isHydrated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start the pipeline animation sequence
          setActiveCircles([true, false, false, false, false]);
          animateSequence();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHydrated]);

  const animateSequence = () => {
    let currentIndex = 0;
    const startNextAnimation = () => {
      if (currentIndex < pipelineNodes.length - 1) {
        animateLineToNextCircle(currentIndex, currentIndex + 1, () => {
          currentIndex++;
          setActiveCircles((prev) => {
            const newActive = [...prev];
            newActive[currentIndex] = true;
            return newActive;
          });
          setTimeout(startNextAnimation, 300);
        });
      }
    };
    setTimeout(startNextAnimation, 800);
  };

  const animateLineToNextCircle = (fromIndex: number, toIndex: number, onComplete: () => void) => {
    const duration = 1000;
    const startTime = Date.now();

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimatingLine({ from: fromIndex, to: toIndex, progress });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setAnimatingLine(null);
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animateFrame);
  };

  return (
    <section id="pipeline" ref={sectionRef} className="py-16 sm:py-24 w-full lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold mb-4">
            Streamlined Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl bg-gradient-to-r from-accent via-primary to-accent dark:bg-gradient-to-r from-gray-300 via-primary to-gray-300 bg-clip-text lg:text-6xl font-bold text-transparent text-foreground mb-4 sm:mb-6 text-balance">
            How Scriptish Works
          </h2>
          <p className="max-w-2xl mx-auto text-primary text-base sm:text-lg text-foreground/60 dark:text-gray-400 leading-relaxed">
            Five simple steps to transform your clinic operations.
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="relative flex justify-between gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-4">
            {/* Baseline */}
            <div className="absolute top-6 sm:top-8 lg:top-12 left-0 right-0 h-0.5 bg-primary/20 pointer-events-none" />

            {/* SVG for animated line - only renders after hydration */}
            {isHydrated && (
              <svg
                className="absolute top-6 sm:top-8 lg:top-12 left-0 right-0 h-0.5 pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 1000 2"
                style={{ width: '100%', height: '2px' }}
              >
                {/* Glow effect */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Animated connecting line with glow */}
                {animatingLine && (
                  <>
                    {/* Animated line */}
                    <line
                      x1={`${(animatingLine.from / (pipelineNodes.length - 1)) * 1000}`}
                      y1="1"
                      x2={`${animatingLine.from / (pipelineNodes.length - 1) * 1000 + (animatingLine.to / (pipelineNodes.length - 1) - animatingLine.from / (pipelineNodes.length - 1)) * 1000 * animatingLine.progress}`}
                      y2="1"
                      stroke="oklch(0.621 0.153 301.1)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />

                    {/* Glowing particle head */}
                    <circle
                      cx={`${animatingLine.from / (pipelineNodes.length - 1) * 1000 + (animatingLine.to / (pipelineNodes.length - 1) - animatingLine.from / (pipelineNodes.length - 1)) * 1000 * animatingLine.progress}`}
                      cy="1"
                      r="4"
                      fill="oklch(0.621 0.153 301.1)"
                      filter="url(#glow)"
                    />
                  </>
                )}
              </svg>
            )}

            {/* Pipeline circles */}
            {pipelineNodes.map((node, index) => (
              <div key={index} className="flex-1 flex justify-center">
                <PipelineCircle
                  node={node}
                  index={index}
                  isActivated={activeCircles[index] || false}
                />
              </div>
            ))}
          </div>

          {/* Description Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mt-16 sm:mt-20 lg:mt-24">
            {pipelineNodes.map((node, index) => (
              <button
                key={index}
                className={`p-4 sm:p-6 rounded-lg border border-border/20 bg-gray-200 hover:bg-card/60 backdrop-blur-sm transition-all hover:scale-[1.3] duration-500 transform ${
                  activeCircles[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 hover:bg-primary/30 border border-primary flex items-center justify-center text-accent font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-primary text-sm sm:text-base">{node.label}</h3>
                </div>
                <p className="text-xs sm:text-sm text-accent/80 font-semi-bold leading-relaxed">
                  {node.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Benefits callout */}
        <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <button className="p-6 sm:p-8 rounded-xl border-t shadow-sm bg-accent/5 border-t-[6px] border-accent bg-brand/5 backdrop-blur-sm">
           
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">70% Faster</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Reduce patient processing time from hours to minutes.
            </p>
          </button>
          <button className="p-6 sm:p-8 rounded-xl border-t shadow-sm bg-accent/5 border-t-[6px] border-accent bg-brand/5 backdrop-blur-sm">
            
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">40% Cost Savings</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Eliminate manual administrative overhead and errors.
            </p>
          </button>
          <button className="p-6 sm:p-8 rounded-xl border-t border-t-[6px] bg-accent/5 border-t-[6px] border-accent backdrop-blur-sm">
          
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">3x Higher Revenue</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              More approved claims and faster patient throughput.
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}
