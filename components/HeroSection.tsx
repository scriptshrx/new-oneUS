'use client';

import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(window.innerHeight, 600);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg');
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Keep in bounds
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Draw particle
        const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand');
        ctx.fillStyle = `hsla(301, 100%, 50%, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach((p2, j) => {
          if (i < j) {
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              ctx.strokeStyle = `hsla(301, 100%, 50%, ${0.1 * (1 - distance / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className="relative w-full pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold">
              ✨ Modern Healthcare Automation
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
            Medical Operations,{' '}
            <span className="bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-foreground/70 mb-8 sm:mb-12 text-balance leading-relaxed">
            Scriptish automates insurance verification, prior authorizations, and patient intake for IV therapy, ketamine, NAD+, and infusion clinics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-3 sm:py-4 rounded-lg bg-brand text-white font-semibold hover:opacity-90 transition-opacity text-base sm:text-lg">
              Book a Demo
            </button>
            <button className="w-full sm:w-auto px-8 py-3 sm:py-4 rounded-lg border border-brand text-brand font-semibold hover:bg-brand/5 transition-colors text-base sm:text-lg">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 pt-12 sm:pt-20 border-t border-border/20">
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-brand">500+</div>
              <div className="text-xs sm:text-sm text-foreground/60 mt-2">Clinics Automated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-brand">$50M+</div>
              <div className="text-xs sm:text-sm text-foreground/60 mt-2">Claims Processed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-brand">99.9%</div>
              <div className="text-xs sm:text-sm text-foreground/60 mt-2">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
