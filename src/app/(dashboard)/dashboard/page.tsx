"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Users, TrendingUp, Activity, ArrowUpRight, Terminal } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const customerStats = useQuery(api.customers.getStats);
  const recentCampaigns = useQuery(api.campaigns.list);

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-white">Overview</h2>
        <Link 
          href="/campaigns/new"
          className="bg-white hover:bg-[#EBEBEB] text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 flex flex-col gap-6">
          <StatCard 
            title="Total Customers" 
            value={customerStats ? customerStats.total.toLocaleString() : "..."}
            icon={Users}
            trend="+12% this month"
            sparklineData={[30, 40, 35, 50, 49, 60, 70, 91, 100]}
          />
          <StatCard 
            title="Total Spend" 
            value={customerStats ? `₹${customerStats.totalSpend.toLocaleString()}` : "..."}
            icon={TrendingUp}
            trend="+8% this month"
            sparklineData={[40, 30, 45, 60, 55, 75, 70, 85, 100]}
          />
        </div>
        
        <div className="col-span-3 border border-white/10 rounded-lg bg-black relative overflow-hidden flex flex-col shadow-inner">
          <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10 bg-white/[0.02]">
            <h3 className="text-sm font-medium text-[#EDEDED] flex items-center gap-2"><Terminal className="w-4 h-4 text-[#888888]" /> Raw Webhook Terminal</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#888888]">Listening on /api/receipts</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <LiveTerminalFeed />
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium text-white mb-4">Recent Campaigns</h3>
      <div className="border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[#888888] bg-black/50">
            <tr>
              <th className="px-5 py-4 font-normal">Campaign</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal">Sent</th>
              <th className="px-5 py-4 font-normal">Date</th>
              <th className="px-5 py-4 font-normal text-right"></th>
            </tr>
          </thead>
          <tbody>
            {recentCampaigns?.slice(0, 5).map((c: any, i: number) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={c._id} 
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${c.status === 'sending' ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-[#888888] border border-white/10'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-[#888888]">{c.stats.sent}</td>
                <td className="px-5 py-4 text-[#888888]">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/campaigns/${c._id}`} className="text-[#888888] hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex justify-end items-center gap-1 text-xs">
                    View <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </motion.tr>
            ))}
            {!recentCampaigns && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#888888]">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, highlight = false, sparklineData = [] }: any) {
  return (
    <div className={`p-6 rounded-lg border flex flex-col relative overflow-hidden ${highlight ? 'border-white/20 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02] h-full justify-between'}`}>
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      )}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#888888]">{title}</span>
        <Icon className="w-4 h-4 text-[#888888]" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-3xl font-medium text-white tracking-tight">{value}</div>
        <div className="text-xs text-[#666666] mt-1">{trend}</div>
      </div>
      {sparklineData.length > 0 && (
        <div className="mt-4 h-8 w-full absolute bottom-0 left-0 opacity-40 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <motion.path 
              d={`M 0,${100 - sparklineData[0]} ${sparklineData.map((d: number, i: number) => `L ${i * (100/(sparklineData.length-1))},${100 - d}`).join(' ')}`}
              fill="none" 
              stroke={highlight ? "#FFFFFF" : "rgba(255,255,255,0.8)"} 
              strokeWidth="2"
              initial={{ pathLength: 0 }} 
              animate={{ pathLength: 1 }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function LiveTerminalFeed() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Generate random mock webhooks hitting the server
    const interval = setInterval(() => {
      const statuses = ["delivered", "opened", "clicked", "converted", "delivered", "opened"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const id = Math.random().toString(36).substring(7);
      const isConversion = status === "converted";
      
      const newLog = {
        id: Math.random(),
        time: new Date().toISOString(),
        payload: `POST /api/receipts 200 OK - {"evt_id":"evt_${id}","type":"message.${status}","ts":${Date.now()}}`,
        highlight: isConversion
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10)); // keep last 10
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] p-4 overflow-hidden font-mono text-[11px] leading-relaxed flex flex-col justify-end">
      <AnimatePresence>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`whitespace-nowrap flex gap-4 border-l pl-3 mb-1.5 transition-colors ${log.highlight ? 'border-white text-white' : 'border-white/10 text-[#666666]'}`}
          >
            <span className="text-[#444444] shrink-0">{log.time.split('T')[1].slice(0, -1)}</span>
            <span className="truncate">{log.payload}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none" />
    </div>
  );
}
