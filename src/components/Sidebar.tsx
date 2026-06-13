"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, Send, Settings, Command, Search, ChevronsUpDown, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const OktaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="url(#xeno-gradient-sb)">
    <defs>
      <linearGradient id="xeno-gradient-sb" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#6633cc"/>
      </linearGradient>
    </defs>
    <circle cx="26" cy="26" r="16" />
    <circle cx="74" cy="74" r="16" />
    <line x1="26" y1="74" x2="74" y2="26" stroke="url(#xeno-gradient-sb)" strokeWidth="32" strokeLinecap="round" />
  </svg>
);

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Segments", href: "/segments", icon: PieChart },
    { name: "Campaigns", href: "/campaigns", icon: Send },
  ];

  const handleSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-menu"));
  };

  const handleSupport = (feature: string) => {
    toast(`${feature} Disabled`, { description: `Access to ${feature} is restricted in this demo environment.` });
  };

  return (
    <aside className="w-[260px] border-r border-white/[0.08] bg-[#050505] flex flex-col h-full font-sans">
      {/* Workspace Switcher */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.08]">
        <button onClick={() => handleSupport("Workspace Switcher")} className="flex items-center justify-between w-full p-1.5 rounded-md hover:bg-white/[0.04] transition-colors group">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center text-white">
              <OktaLogo className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium tracking-tight text-sm text-[#EDEDED]">XENO</span>
              <span className="text-[10px] text-[#888888] font-mono leading-none">XenoPulse</span>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-[#666] group-hover:text-[#AAA] transition-colors" />
        </button>
      </div>

      {/* Search / Cmd+K */}
      <div className="px-4 py-4">
        <button onClick={handleSearch} className="w-full flex items-center justify-between bg-[#0A0A0A] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-sm text-[#888] hover:border-white/[0.15] hover:text-[#CCC] transition-all shadow-inner group">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-[13px]">Search</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-[9px] font-mono text-[#AAA]">⌘</kbd>
            <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-[9px] font-mono text-[#AAA]">K</kbd>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-6">
        
        {/* Main Menu */}
        <div>
          <div className="px-3 text-sm font-medium tracking-tight text-[#EDEDED] mb-3">
            Overview
          </div>
          <div className="space-y-0.5">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => { if (onClose) onClose(); }}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-[13px] relative ${
                    isActive
                      ? "bg-[#6633cc]/10 text-[#a78bfa] font-medium shadow-sm border border-[#6633cc]/20"
                      : "text-[#888888] hover:text-[#E0E0E0] hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-[#a78bfa]' : 'text-[#666]'}`} strokeWidth={isActive ? 2 : 1.5} />
                  {link.name}
                  {link.name === "Campaigns" && (
                    <span className={`ml-auto text-[9px] py-0.5 px-1.5 rounded-full font-mono ${isActive ? 'bg-[#6633cc]/20 text-[#a78bfa]' : 'bg-white/10 text-white'}`}>12</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Support Menu */}
        <div>
          <div className="px-3 text-sm font-medium tracking-tight text-[#EDEDED] mb-3 mt-4">
            Support
          </div>
          <div className="space-y-0.5">
            <button onClick={() => handleSupport("Inbox")} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-[13px] text-[#888888] hover:text-[#E0E0E0] hover:bg-white/[0.03] border border-transparent">
              <Inbox className="w-4 h-4 text-[#666]" strokeWidth={1.5} /> Inbox
            </button>
            <button onClick={() => handleSupport("Settings")} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-[13px] text-[#888888] hover:text-[#E0E0E0] hover:bg-white/[0.03] border border-transparent">
              <Settings className="w-4 h-4 text-[#666]" strokeWidth={1.5} /> Settings
            </button>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/[0.08]">
        <button onClick={() => handleSupport("User Profile")} className="flex items-center justify-between w-full hover:bg-white/[0.04] p-1.5 rounded-md transition-colors group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#333] to-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="text-[11px] text-white font-medium">KD</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-[13px] text-[#EDEDED] leading-tight mb-0.5">Kaveen K.</span>
              <span className="text-[10px] text-[#666] leading-tight">kaveen@xeno.com</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
