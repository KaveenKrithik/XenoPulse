"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const OktaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="url(#xeno-gradient)">
    <defs>
      <linearGradient id="xeno-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#6633cc"/>
      </linearGradient>
    </defs>
    <circle cx="26" cy="26" r="16" />
    <circle cx="74" cy="74" r="16" />
    <line x1="26" y1="74" x2="74" y2="26" stroke="url(#xeno-gradient)" strokeWidth="32" strokeLinecap="round" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Fake auth delay for the vibe
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[360px] flex flex-col items-center"
      >
        <div className="mb-8">
          <OktaLogo className="w-12 h-12 drop-shadow-[0_0_25px_rgba(102,51,204,0.5)]" />
        </div>
        
        <h1 className="text-2xl font-medium tracking-tight text-white mb-2">XENO</h1>
        <p className="text-[#888] text-sm text-center mb-10">
          Enter your employee email to access the intelligence dashboard.
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-[#666] uppercase tracking-wider pl-1">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kaveen@xeno.com"
              className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-[#6633cc] text-white hover:bg-[#5527ab] shadow-[0_0_15px_rgba(102,51,204,0.3)] disabled:bg-[#6633cc]/50 disabled:cursor-not-allowed font-medium text-sm rounded-lg px-4 py-3 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-[2px] border-white/20 border-t-white rounded-full"
                />
                Authenticating...
              </span>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-[#555] font-mono">
          <p>By continuing, you agree to our Terms of Service</p>
          <p className="mt-1">and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
}
