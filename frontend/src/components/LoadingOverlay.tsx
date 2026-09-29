import React, { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

const MESSAGES = [
  'Understanding your requirements...',
  'Optimizing your budget allocations...',
  'Finding the best category distribution...',
  'Formulating intelligent cost-saving recommendations...',
  'Preparing your personalized plan...'
];

export const LoadingOverlay: React.FC<{ isVisible: boolean; title?: string }> = ({
  isVisible,
  title = 'PocketSmart AI is Crafting Your Plan'
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B12]/80 backdrop-blur-md px-4">
      <div className="relative max-w-md w-full bg-[#0F172A]/90 border border-purple-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Animated Glow Gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Center Spinner Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-indigo-400/20 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/40">
            <BrainCircuit className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-purple-300 min-h-[24px] transition-all duration-300">
            {MESSAGES[currentStep]}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 pt-2">
          {MESSAGES.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-6 bg-gradient-to-r from-purple-500 to-indigo-500' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="text-[11px] text-gray-500 flex items-center justify-center space-x-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Calculations strictly guaranteed never to exceed your budget</span>
        </div>
      </div>
    </div>
  );
};
