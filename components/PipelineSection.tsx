'use client';

import { useEffect, useRef, useState } from 'react';

interface PipelineNode {
  label: string;
  description: string;
}

function PipelineCircle({ node, index, isVisible }: { node: PipelineNode; index: number; isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 rounded-full border-2 flex items-center justify-center font-semibold text-sm sm:text-base lg:text-lg transition-all duration-700 ${
          isVisible
            ? 'border-brand bg-brand/10 text-brand shadow-lg shadow-brand/20 scale-100 opacity-100 blur-0'
            : 'border-border/30 bg-background/50 text-foreground/40 scale-75 opacity-30 blur-sm'
        }`}
      >
        {index + 1}
      </div>
      <p className="text-xs sm:text-sm font-semibold text-foreground mt-3 sm:mt-4 text-center max-w-20 sm:max-w-24">{node.label}</p>
      <p className="text-xs text-foreground/50 mt-1 text-center max-w-24 sm:max-w-32 hidden sm:block">{node.description}</p>
    </div>
  );
}

export default function PipelineSection() {
  const [visibleNodes, setVisibleNodes] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const pipelineNodes: PipelineNode[] = [
    { label: 'Patient Intake', description: 'Automated form submission' },
    { label: 'Insurance Check', description: 'Real-time verification' },
    { label: 'Prior Auth', description: 'Intelligent automation' },
    { label: 'Approval', description: 'Instant confirmation' },
    { label: 'Schedule', description: 'Auto appointment booking' },
  ];

  useEffect(() => {
    // Initialize all nodes as hidden
    setVisibleNodes(new Array(pipelineNodes.length).fill(false));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the reveal animation
          pipelineNodes.forEach((_, index) => {
            setTimeout(() => {
              setVisibleNodes((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 150);
          });
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
    };
  }, []);

  return (
    <section id="pipeline" ref={sectionRef} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold mb-4">
            Streamlined Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            How <span className="text-brand">Scriptish</span> Works
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/60 text-balance leading-relaxed">
            Five simple steps to transform your clinic operations.
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="relative flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-4">
            {/* Connecting lines */}
            <div className="absolute top-8 sm:top-10 lg:top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent pointer-events-none" />

            {/* Pipeline circles */}
            {pipelineNodes.map((node, index) => (
              <div key={index} className="flex-1 flex justify-center">
                <PipelineCircle
                  node={node}
                  index={index}
                  isVisible={visibleNodes[index] || false}
                />
              </div>
            ))}
          </div>

          {/* Description Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mt-16 sm:mt-20 lg:mt-24">
            {pipelineNodes.map((node, index) => (
              <div
                key={index}
                className={`p-4 sm:p-6 rounded-lg border border-border/20 bg-card/30 backdrop-blur-sm transition-all duration-500 transform ${
                  visibleNodes[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{node.label}</h3>
                </div>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Automated {node.description.toLowerCase()} that saves your team hours of manual work.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits callout */}
        <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-xl border border-brand/30 bg-brand/5 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl mb-3">⚡</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">70% Faster</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Reduce patient processing time from hours to minutes.
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-xl border border-brand/30 bg-brand/5 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl mb-3">💰</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">40% Cost Savings</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              Eliminate manual administrative overhead and errors.
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-xl border border-brand/30 bg-brand/5 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl mb-3">📈</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">3x Higher Revenue</h3>
            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
              More approved claims and faster patient throughput.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
