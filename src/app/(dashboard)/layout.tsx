"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CommandMenu from "@/components/CommandMenu";
import Copilot from "@/components/Copilot";
import OnboardingTour from "@/components/OnboardingTour";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-[#050505]">
      {/* Mobile Header */}
      <div className="md:hidden h-14 border-b border-white/10 flex items-center px-4 justify-between bg-[#0A0A0A] z-40 relative">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-tight">XenoPulse</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-8 h-8 flex items-center justify-center text-[#EDEDED] rounded-md hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Area */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 bg-[#050505] relative z-0">
        {children}
      </main>
      
      <CommandMenu />
      <Copilot />
      <OnboardingTour />
    </div>
  );
}
