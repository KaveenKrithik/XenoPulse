"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, Users, PieChart, Send, Settings, Command } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleCustomOpen = () => setIsOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-menu", handleCustomOpen);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", handleCustomOpen);
    };
  }, []);

  const routes = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Segments", href: "/segments", icon: PieChart },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Settings", href: "#", icon: Settings },
  ];

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearch("");
    if (href !== "#") router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-xl bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="flex items-center px-4 border-b border-white/10">
                <Search className="w-4 h-4 text-[#666]" />
                <input
                  autoFocus
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-white px-4 py-4 outline-none placeholder:text-[#666] text-sm"
                />
                <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-[#AAA]">ESC</kbd>
              </div>

              <div className="p-2 max-h-[300px] overflow-y-auto">
                {filteredRoutes.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#666]">No results found.</div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm font-medium tracking-tight text-[#EDEDED] mb-1">
                      Pages
                    </div>
                    {filteredRoutes.map((route, i) => (
                      <button
                        key={route.name}
                        onClick={() => handleSelect(route.href)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[#CCC] hover:text-white hover:bg-white/[0.06] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <route.icon className="w-4 h-4 text-[#666] group-hover:text-white transition-colors" />
                          {route.name}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
