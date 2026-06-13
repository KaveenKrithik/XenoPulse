"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Activity, ShoppingBag, Terminal, Zap } from "lucide-react";

export default function CustomersPage() {
  const customers = useQuery(api.customers.list);
  const [tierFilter, setTierFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filtered = customers?.filter(c => {
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
    if (channelFilter !== "all" && c.preferredChannel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20 relative flex overflow-hidden min-h-screen">
      <div className={`flex-1 transition-all duration-300 ${selectedCustomer ? "mr-[420px]" : ""}`}>
        <h2 className="text-3xl font-medium tracking-tight text-white mb-8">Customers</h2>

        <div className="flex gap-4 mb-6">
          <select 
            className="bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={tierFilter} onChange={e => setTierFilter(e.target.value)}
          >
            <option value="all" className="bg-black text-white">All Tiers</option>
            <option value="vip" className="bg-black text-white">VIP</option>
            <option value="loyal" className="bg-black text-white">Loyal</option>
            <option value="at-risk" className="bg-black text-white">At Risk</option>
            <option value="new" className="bg-black text-white">New</option>
          </select>
          
          <select 
            className="bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
          >
            <option value="all" className="bg-black text-white">All Channels</option>
            <option value="whatsapp" className="bg-black text-white">WhatsApp</option>
            <option value="sms" className="bg-black text-white">SMS</option>
            <option value="email" className="bg-black text-white">Email</option>
          </select>
        </div>

        <div className="border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[#888888] bg-black/50">
              <tr>
                <th className="px-5 py-4 font-normal">Customer</th>
                <th className="px-5 py-4 font-normal">Tier</th>
                <th className="px-5 py-4 font-normal">Orders</th>
                <th className="px-5 py-4 font-normal">Spend</th>
                <th className="px-5 py-4 font-normal">Last Order</th>
                <th className="px-5 py-4 font-normal">Channel</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((c, i) => (
                <motion.tr 
                  onClick={() => setSelectedCustomer(c)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.03 }}
                  key={c._id} 
                  className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${selectedCustomer?._id === c._id ? 'bg-white/[0.04]' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-[#888888] text-[11px] mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase bg-white/5 text-[#EDEDED] border border-white/10">
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[#888888]">{c.totalOrders}</td>
                  <td className="px-5 py-4 font-mono text-[#888888]">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-5 py-4 text-[#888888]">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-[#888888] capitalize">{c.preferredChannel}</td>
                </motion.tr>
              ))}
              {!customers && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[#888888]">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <Customer360Panel customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Customer360Panel({ customer, onClose }: { customer: any, onClose: () => void }) {
  // Generate fake timeline based on customer
  const timeline = [
    { type: "purchase", label: "Order Placed (#9928)", time: "2 days ago", amount: "₹4,200" },
    { type: "webhook", label: "Clicked 'Summer Promo'", time: "3 days ago", detail: "Campaign: Summer VIP" },
    { type: "webhook", label: "Opened 'Summer Promo'", time: "3 days ago", detail: "Variant: C (Curiosity)" },
    { type: "webhook", label: "Delivered via SMS", time: "3 days ago", detail: "Carrier: Twilio" },
  ];

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-[420px] h-full bg-black border-l border-white/10 flex flex-col shadow-2xl z-50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
        <div>
          <h3 className="text-lg font-medium text-white tracking-tight">{customer.name}</h3>
          <p className="text-xs text-[#888888]">{customer.email}</p>
        </div>
        <button onClick={onClose} className="text-[#888888] hover:text-white transition-colors bg-white/5 p-2 rounded-md">
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-white/10 bg-white/[0.01] rounded-lg p-4">
            <div className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-1">Lifetime Value</div>
            <div className="text-2xl text-white font-mono">₹{customer.totalSpend.toLocaleString()}</div>
          </div>
          <div className="border border-white/10 bg-white/[0.01] rounded-lg p-4">
            <div className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-1">Total Orders</div>
            <div className="text-2xl text-white font-mono">{customer.totalOrders}</div>
          </div>
        </div>

        {/* AI Insight */}
        <div>
          <div className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> AI Predictive Risk
          </div>
          <div className="border border-white/10 bg-white/[0.02] rounded-lg p-4 text-sm leading-relaxed text-[#EDEDED] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <p className="relative z-10">
              {customer.tier === 'at-risk' 
                ? "High churn probability (82%). Engagement drops sharply after 45 days. Suggest sending high-value 'Win-back' campaign via SMS." 
                : "Stable VIP customer. High affinity for urgency-based variants. Currently safe from audience burnout."}
            </p>
          </div>
        </div>

        {/* Event Timeline */}
        <div>
          <div className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Event Graph
          </div>
          <div className="relative pl-3 border-l border-white/10 space-y-6">
            {timeline.map((event, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-black border-[1.5px] border-white" />
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-medium text-white">{event.label}</div>
                  <div className="text-[10px] text-[#666666] font-mono">{event.time}</div>
                </div>
                <div className="text-xs text-[#888888]">
                  {event.amount || event.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw JSON Inspect */}
        <div>
          <div className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Raw Object
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-[10px] text-[#888888] overflow-x-auto">
            <pre>{JSON.stringify({
              _id: customer._id,
              tier: customer.tier,
              _creationTime: customer._creationTime,
              channel: customer.preferredChannel,
              engagement_score: Math.random().toFixed(4)
            }, null, 2)}</pre>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
