"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check } from "lucide-react";

type TourStep = {
  id: string;
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "step-1",
    targetId: "tour-campaigns",
    title: "AI Campaigns Studio",
    content: "Start here to dynamically generate variants and launch A/B tested campaigns.",
    position: "right",
  },
  {
    id: "step-2",
    targetId: "tour-webhooks",
    title: "Live Webhook Feed",
    content: "Watch real-time engagement data flow in asynchronously from our simulated Channel Service.",
    position: "top",
  },
  {
    id: "step-3",
    targetId: "tour-copilot",
    title: "Meet XenoPilot",
    content: "Your RAG-powered AI assistant. Ask it anything about your live sales data or customers.",
    position: "left",
  },
];

export default function OnboardingTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Check if the user has already completed or skipped the tour
    const hasSeenTour = localStorage.getItem("xeno_tour_completed");
    if (!hasSeenTour) {
      // Small delay to let the UI settle before starting the tour
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateTargetRect(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update target rect on window resize
  useEffect(() => {
    if (!isVisible) return;
    const handleResize = () => updateTargetRect(currentStepIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, currentStepIndex]);

  const updateTargetRect = (index: number) => {
    const step = TOUR_STEPS[index];
    if (!step) return;
    
    // Attempt to find element, retry a few times if it hasn't mounted yet
    let retries = 0;
    const findEl = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Optional: scroll into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (retries < 5) {
        retries++;
        setTimeout(findEl, 200);
      }
    };
    findEl();
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      updateTargetRect(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("xeno_tour_completed", "true");
  };

  if (!isVisible || !targetRect) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Calculate Popover Position
  let top = 0;
  let left = 0;
  const gap = 16; // Space between target and tooltip

  switch (currentStep.position) {
    case "right":
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.right + gap;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.left - gap - 320; // Tooltip width is ~320px
      break;
    case "top":
      top = targetRect.top - gap - 120; // Tooltip height is roughly 120px
      left = targetRect.left + targetRect.width / 2 - 160;
      break;
    case "bottom":
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - 160;
      break;
  }

  // Prevent going off screen simply
  if (left < 16) left = 16;
  if (top < 16) top = 16;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Background Dim (Optional, usually omitted for a non-intrusive feel, but helps focus) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto"
        onClick={handleComplete}
      />

      {/* Target Highlight Ring */}
      <motion.div
        layout
        className="absolute border-2 border-[#a78bfa] rounded-lg shadow-[0_0_15px_rgba(167,139,250,0.5)] pointer-events-none z-[101]"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* The Tooltip Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute bg-[#EDEDED] text-[#0A0A0A] w-[320px] p-4 rounded-xl shadow-2xl pointer-events-auto z-[102] flex flex-col"
          style={{ top, left }}
        >
          <button 
            onClick={handleComplete}
            className="absolute top-3 right-3 text-[#666] hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Step {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
            <h4 className="font-semibold text-sm tracking-tight">{currentStep.title}</h4>
          </div>
          
          <p className="text-[13px] text-[#444] leading-relaxed mb-4">
            {currentStep.content}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <button 
              onClick={handleComplete}
              className="text-xs font-medium text-[#666] hover:text-black transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="bg-black hover:bg-[#333] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>Finish <Check className="w-3.5 h-3.5" /></>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
