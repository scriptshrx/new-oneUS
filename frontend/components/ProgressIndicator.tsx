'use client';

import { CheckIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressIndicatorProps) {

   //disable progressive bar on mobile view

  const[isMobile,setIsMobile]=useState(false);

  const pathname = usePathname();

  useEffect(()=>{
    if(typeof window !== 'undefined'){
      if(window.innerWidth<768){
        setIsMobile(true)

      }
    }
  },[pathname])
  return (
    <div className="w-full mb-8 sm:mb-12 fixed md:px-20 bg-brand backdrop-blur-md top-8 md:top-0 mx-auto left-0 right-0 self-center mt-8 md:mt-0">
      {/* Progress bar background */}
      <div className="h-1 hidden md:block bg-border/20 rounded-full overflow-hidden mb-6 sm:mb-8">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent rounded-lg transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300 mb-2 sm:mb-3 ${
                  isCompleted
                    ? 'bg-brand text-white'
                    : isActive
                      ? 'bg-brand text-white ring-4 ring-brand/30'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNumber}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium text-center ${
                  isActive || isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
