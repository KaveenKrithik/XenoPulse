"use client";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cpu, MessageSquare, Tag, Zap, Activity } from "lucide-react";
import { use } from "react";

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id as Id<"campaigns">;
  
  const campaign = useQuery(api.campaigns.get, { id: campaignId });
  const communications = useQuery(api.communications.getByCampaign, { campaignId });
  const debrief = useQuery(api.campaigns.getDebrief, { campaignId });
  
  const generateDebrief = useAction(api.campaigns.generateDebrief);
  const [isGenerating, setIsGenerating] = useState(false);

  if (campaign === undefined) return <div className="p-8 text-[#888888]">Loading...</div>;
  if (campaign === null) return <div className="p-8 text-[#888888]">Campaign not found.</div>;

  const stats = campaign.stats;
  const fillPercentage = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;

  const handleDebrief = async () => {
    setIsGenerating(true);
    try {
      await generateDebrief({ campaignId });
      toast.success("Debrief generated");
    } catch(e: any) {
      toast.error(e.message || "Failed to generate debrief");
    } finally {
      setIsGenerating(false);
    }
  }

  const hasVariants = campaign.variants && campaign.variants.length > 0;

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-3xl font-medium tracking-tight text-white">{campaign.name}</h2>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${campaign.status === 'sending' ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-[#888888] border border-white/10'}`}>
          {campaign.status}
        </span>
        <span className="text-[#888888] text-sm border-l border-white/10 pl-4 ml-2 flex items-center gap-2 capitalize">
          <MessageSquare className="w-4 h-4" /> {campaign.channel}
        </span>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden mb-12 relative backdrop-blur-md">
        <motion.div 
          className="absolute top-0 left-0 h-[2px] z-10 shadow-[0_0_15px_rgba(167,139,250,0.8)]"
          style={{ background: "linear-gradient(90deg, #6633cc, #a78bfa)" }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="grid grid-cols-6 divide-x divide-white/10 relative">
          <StatBox label="Total" value={stats.total} />
          <StatBox label="Sent" value={stats.sent} />
          <StatBox label="Delivered" value={stats.delivered} />
          <StatBox label="Failed" value={stats.failed} />
          <StatBox label="Opened" value={stats.opened} />
          <StatBox label="Converted" value={stats.converted} />
        </div>
      </div>

      {campaign.status === "completed" && (
        <div className="mb-12">
          <h3 className="text-sm font-medium text-white mb-4">AI Debrief</h3>
          {!debrief ? (
            <div className="bg-white/[0.02] border border-white/10 border-l-[3px] border-l-white/20 rounded-lg p-6 flex justify-between items-center backdrop-blur-md">
              <span className="text-sm text-[#888888]">Campaign has completed. Generate a performance debrief.</span>
              <button 
                onClick={handleDebrief}
                disabled={isGenerating}
                className="bg-[#6633cc]/10 border border-[#6633cc]/30 text-[#a78bfa] hover:bg-[#6633cc]/20 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? "Analyzing..." : <><Cpu className="w-4 h-4" strokeWidth={1.5} /> Generate Debrief</>}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 border-l-[3px] border-l-[#a78bfa] rounded-lg p-6 backdrop-blur-md"
            >
              <p className="text-sm text-[#EDEDED] leading-relaxed">{debrief.summary}</p>
              <div className="text-[10px] text-[#888888] mt-4 font-mono">
                Generated {new Date(debrief.generatedAt).toLocaleString()}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {hasVariants ? (
        <div className="mb-12">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-white" /> AI Variant Engine Racetrack</h3>
          <div className="grid grid-cols-3 gap-6">
            {campaign.variants!.map((v, i) => {
              const conversionRate = v.stats.delivered > 0 ? ((v.stats.converted / v.stats.delivered) * 100).toFixed(1) : "0.0";
              const openRate = v.stats.delivered > 0 ? ((v.stats.opened / v.stats.delivered) * 100).toFixed(1) : "0.0";
              const maxConverted = Math.max(...campaign.variants!.map(va => va.stats.converted));
              const isWinner = v.stats.converted > 0 && v.stats.converted === maxConverted;
              
              return (
                <div key={v.id} className={`bg-white/[0.02] border ${isWinner ? 'border-[#6633cc]/40 shadow-[0_0_25px_rgba(102,51,204,0.1)]' : 'border-white/10'} rounded-lg p-6 relative overflow-hidden backdrop-blur-md`}>
                  {isWinner && <div className="absolute top-0 right-0 w-24 h-24 bg-[#a78bfa]/15 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#888888] font-semibold">Variant {v.id}</span>
                      <div className="text-sm font-medium text-white mt-1">{v.name}</div>
                    </div>
                    {isWinner && <span className="bg-[#6633cc]/20 text-[#a78bfa] text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium border border-[#6633cc]/30">Winner</span>}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#888888]">Converted</span>
                        <span className="text-white font-mono">{v.stats.converted}</span>
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#6633cc] to-[#a78bfa]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(v.stats.converted / Math.max(stats.converted, 1)) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#888888]">Opened</span>
                        <span className="text-white font-mono">{openRate}%</span>
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#6633cc]/50"
                          initial={{ width: 0 }}
                          animate={{ width: `${openRate}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[11px] font-mono text-[#888888] line-clamp-3 leading-relaxed">
                      {v.messageTemplate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="col-span-2 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Live Webhooks</h3>
              <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg p-8 h-64 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="text-4xl text-white font-medium tracking-tight mb-2">{stats.delivered} / {stats.sent}</div>
                <div className="text-xs text-[#666666]">Connecting to pulse stream...</div>
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-white mb-4">Message Template</h3>
              <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg p-6">
                <p className="text-[11px] text-[#EDEDED] font-mono whitespace-pre-wrap leading-relaxed">
                  {campaign.messageTemplate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Pulse Stream</h3>
      <div className="border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[#888888] bg-black/50">
            <tr>
              <th className="px-5 py-4 font-normal w-1/4">Customer</th>
              <th className="px-5 py-4 font-normal w-1/2">Variant / Preview</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {communications?.map((c) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={c._id} 
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-white">{c.customerName}</td>
                  <td className="px-5 py-4">
                    {c.variantId && <span className="mr-2 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest bg-white/10 text-white">V-{c.variantId}</span>}
                    <span className="text-[#888888] truncate max-w-[200px] font-mono text-[11px] inline-block align-middle">{c.message}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${c.status === 'delivered' ? 'bg-white/10 text-white border border-white/20' : c.status === 'sent' ? 'bg-white/5 text-[#EDEDED] border border-white/10' : 'bg-transparent text-[#888888] border border-white/10'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#888888] font-mono text-[11px] text-right">{new Date(c.updatedAt).toLocaleTimeString()}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!communications && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#888888]">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="p-6 flex flex-col justify-between h-28 bg-white/[0.01]">
      <motion.div 
        key={displayValue}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-medium text-white tracking-tight"
      >
        {displayValue.toLocaleString()}
      </motion.div>
      <div className="text-sm font-medium text-[#888888]">{label}</div>
    </div>
  );
}
