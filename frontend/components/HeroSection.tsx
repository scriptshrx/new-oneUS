'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

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

  const highlights =[{name:'Patient Referral',color:'purple-500'}, 
    {name:'Insurance Verification',color:'green-500'},
    {name:'Prio Authorization',color:'orange-500'},
    {name:'Automated Scheduling',color:'yellow-800'}, 
    {name:'Agentic Follow-Up',color:'accent'},
    {name:'Seamless Infusion',color:'blue-500'}]

  const[highlight,setHighlight]=useState('');
  const[color,setColor]=useState('')

  useEffect(()=>{
    let count = 1;
    let interval;
    setHighlight(highlights[0].name);
    setColor(highlights[0].color);
    const cycleHighlights =()=>{
      interval = setInterval(()=>{
        setHighlight(highlights[count].name);
        setColor(highlights[count].color)
        count = (count +1) %highlights.length;
        

      },5000)

    }
   cycleHighlights();
    //return ()=>clearInterval(interval)
  },[])

  return (
    <section className="relative w-full pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden ">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-background/30 to-primary/15  dark:bg-gray-800 moveBg" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center">
        <div className="mb-6 sm:mb-8 h-[100px] md:-mt-10 items-center justify-center relative flex overflow-hidden">
          
          
          {highlight&&<div className='flex items-center h-[40px] moveHighlight -top-[100px] rounded-full px-[2px] relative overflow-hidden justify-center'>
            <div className='h-[500%] absolute rotateInner w-[200%] bg-gradient-to-tr  from-transparent via-transparent to-primary'/>
            <div className={`text-center items-center justify-center flex h-[38px] bg-accent/20 text-accent z-[400] rounded-full  self-center px-3 sm:px-4 py-1.5 sm:py-2 bg-brand/10 text-brand text-xs sm:text-sm font-semibold`}>
              {highlight}
            </div>

            </div>}


          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
            Infusion Operations,{' '}
            <span className="bg-gradient-to-r from-brand via-accent to-brand bg-clip-text enlargeBgText text-transparent">
              Simplified
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-foreground/70 mb-8 sm:mb-12 text-balance leading-relaxed">
            Scriptish automates insurance verification, prior authorizations, and patient intake for IV therapy, ketamine, NAD+, and infusion clinics.
          </p>

         

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
