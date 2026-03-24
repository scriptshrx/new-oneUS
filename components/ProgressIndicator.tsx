'use client';

import { CheckIcon } from 'lucide-react';

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
  return (
    <div className="w-full mb-8 sm:mb-12">
      {/* Progress bar background */}
      <div className="h-1 bg-border/20 rounded-full overflow-hidden mb-6 sm:mb-8">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
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
