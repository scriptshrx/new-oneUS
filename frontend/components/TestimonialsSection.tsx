'use client';

import { useEffect, useRef, useState } from 'react';

interface TestimonialCardProps {
  name: string;
  role: string;
  clinic: string;
  testimonial: string;
  image: string;
  position: number;
  totalCards: number;
}

function TestimonialCard({ name, role, clinic, testimonial, image, position, totalCards }: TestimonialCardProps) {
  return (
    <div
      className="flex-shrink-0 w-80 sm:w-96 px-6 py-8 rounded-xl border border-border/20 bg-card/50 backdrop-blur-sm hover:border-brand/50 transition-all"
      style={{
        animation: `scroll 40s linear infinite`,
        animationDelay: `${position * -10}s`,
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-lg sm:text-xl font-bold text-brand">
          {image}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-xs sm:text-sm text-foreground/60">{role}</p>
          <p className="text-xs sm:text-sm text-brand font-medium">{clinic}</p>
        </div>
      </div>
      <p className="text-sm sm:text-base text-foreground/70 leading-relaxed italic">
        "{testimonial}"
      </p>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-base">
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [cardWidth, setCardWidth] = useState(384);
  const containerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Clinic Director',
      clinic: 'Premium IV Wellness',
      testimonial: 'Scriptish cut our insurance verification time from 2 hours to 5 minutes per patient. Our staff can focus on patient care instead of paperwork.',
      image: '👩‍⚕️',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Operations Manager',
      clinic: 'Elite Ketamine Centers',
      testimonial: 'The prior auth automation is a game-changer. We went from 60% approval rate to 94% in just three months of implementation.',
      image: '👨‍💼',
    },
    {
      name: 'Dr. James Liu',
      role: 'Medical Director',
      clinic: 'NAD+ Therapy Clinic',
      testimonial: 'HIPAA compliance was our biggest concern. Scriptish gave us enterprise-grade security and we sleep better at night.',
      image: '👨‍⚕️',
    },
    {
      name: 'Emily Thompson',
      role: 'Practice Manager',
      clinic: 'Biologic Infusion Labs',
      testimonial: 'Our patient satisfaction scores increased 40% since we implemented Scriptish. The patient portal is incredibly intuitive.',
      image: '👩‍💼',
    },
    {
      name: 'Dr. David Park',
      role: 'Founder & CEO',
      clinic: 'Rapid Wellness Network',
      testimonial: 'Scriptish is not just software, it is a partner in scaling our clinic. Their support team is exceptional.',
      image: '👨‍⚕️',
    },
  ];

  useEffect(() => {
    // Calculate responsive card width
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        setCardWidth(320);
      } else if (window.innerWidth < 1024) {
        setCardWidth(384);
      } else {
        setCardWidth(384);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  return (
    <section id="testimonials" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 sm:mb-16">
        <div className="text-center">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Trusted by <span className="text-brand">Leading Clinics</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/60 text-balance leading-relaxed">
            See how medical professionals are transforming their operations with Scriptish.
          </p>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div ref={containerRef} className="relative">
        <div className="overflow-hidden">
          <div className="flex gap-6 sm:gap-8">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                clinic={testimonial.clinic}
                testimonial={testimonial.testimonial}
                image={testimonial.image}
                position={index}
                totalCards={testimonials.length * 2}
              />
            ))}
          </div>
        </div>

        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-${testimonials.length} * (384px + 32px)));
          }
        }

        @media (max-width: 640px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-${testimonials.length} * (320px + 24px)));
            }
          }
        }
      `}</style>
    </section>
  );
}
