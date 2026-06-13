"use client";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, Cpu, Activity, ShieldAlert, ZapOff, Users } from "lucide-react";

export default function SegmentsPage() {
  const segments = useQuery(api.segments.list);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [autoSuppress, setAutoSuppress] = useState(true);
  
  // Fake burnout index for demo
  const burnoutIndex = 32;

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20 relative flex overflow-hidden min-h-screen">
      <div className={`flex-1 transition-all duration-300 ${isPanelOpen ? "mr-[420px]" : ""}`}>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-medium tracking-tight text-white">Segments</h2>
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="bg-white hover:bg-[#EBEBEB] text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            New Segment
          </button>
        </div>

        {/* Sleek Monochrome Insights */}
        <div className="mb-10 grid grid-cols-3 gap-6">
          <div className="col-span-2 border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md p-6 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex gap-6 items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4" 
                    strokeDasharray={`${(burnoutIndex / 100) * 283} 283`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${(burnoutIndex / 100) * 283} 283` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-mono text-white tracking-tight">{burnoutIndex}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#EDEDED] mb-1">Audience Fatigue</h3>
                <p className="text-xs text-[#888888] max-w-sm leading-relaxed">
                  32% of your audience has received &gt;2 messages this week.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#888888]">Auto-Suppress</span>
                <button 
                  onClick={() => setAutoSuppress(!autoSuppress)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${autoSuppress ? 'bg-white/80' : 'bg-white/10'}`}
                >
                  <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-black transition-transform ${autoSuppress ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <span className="text-[10px] text-[#888888] uppercase tracking-widest font-semibold flex items-center gap-1">
                {autoSuppress ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          
          <div className="col-span-1 border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-center">
            <h3 className="text-sm font-medium text-[#888888] mb-2 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Resting</h3>
            <div className="text-3xl font-medium tracking-tight text-white mb-2">1,482</div>
            <p className="text-[11px] text-[#666666]">Users currently shielded.</p>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[#888888] bg-black/50">
              <tr>
                <th className="px-5 py-4 font-normal w-2/5">Name</th>
                <th className="px-5 py-4 font-normal">Customers</th>
                <th className="px-5 py-4 font-normal">Fatigue Index</th>
                <th className="px-5 py-4 font-normal">Created By</th>
              </tr>
            </thead>
            <tbody>
              {segments?.map((s, i) => {
                const risk = Math.floor(Math.random() * 40) + 10;
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    key={s._id} 
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#EDEDED]">{s.name}</div>
                      <div className="text-[11px] text-[#666666] mt-1">{s.description}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[#888888]">{s.customerIds.length}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white/60" style={{ width: `${risk}%` }} />
                        </div>
                        <span className="text-[10px] text-[#888888] font-mono">{risk}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        {s.createdBy === "ai" && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />}
                        <span className="uppercase tracking-widest text-[10px] font-semibold text-[#888888]">{s.createdBy}</span>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {!segments && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[#888888]">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <SegmentPanel onClose={() => setIsPanelOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SegmentPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"ai" | "manual">("ai");
  const [name, setName] = useState("");
  const [intent, setIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const generate = useAction(api.segments.generateSegmentFromIntent);
  const createSegment = useMutation(api.segments.create);

  const handleGenerate = async () => {
    if (!intent) return;
    setIsGenerating(true);
    setPreviewData(null);
    try {
      const res = await generate({ intent });
      setPreviewData(res);
      toast.success("Segment logic generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate segment");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name || !previewData) {
      toast.error("Please enter a name and generate a segment first");
      return;
    }
    try {
      await createSegment({
        name,
        description: intent,
        filterJson: previewData.filterJson,
        customerIds: previewData.ids,
        createdBy: "ai"
      });
      toast.success("Segment saved");
      onClose();
    } catch(e) {
      toast.error("Failed to save segment");
    }
  }

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-[400px] h-full bg-black border-l border-white/10 flex flex-col shadow-2xl z-50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.01]">
        <h3 className="text-lg font-medium text-white">New Segment</h3>
        <button onClick={onClose} className="text-[#888888] hover:text-white transition-colors">
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex border-b border-white/10 bg-white/[0.01]">
        <button 
          onClick={() => setTab("ai")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === "ai" ? "text-white border-b-2 border-white" : "text-[#888888] hover:text-white"}`}
        >
          AI Builder
        </button>
        <button 
          onClick={() => setTab("manual")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === "manual" ? "text-white border-b-2 border-white" : "text-[#888888] hover:text-white"}`}
        >
          Manual Builder
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div>
          <label className="block text-xs font-medium text-[#888888] mb-2">Segment Name</label>
          <input 
            type="text" 
            placeholder="e.g. VIP Summer Shoppers"
            className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {tab === "ai" ? (
          <div>
            <label className="block text-xs font-medium text-[#888888] mb-2">Describe your audience</label>
            <textarea 
              placeholder="e.g. Find customers who bought twice but not in 60 days"
              rows={4}
              className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 resize-none transition-colors"
              value={intent}
              onChange={e => setIntent(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !intent}
              className="mt-3 w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? "Generating..." : <><Cpu className="w-4 h-4" strokeWidth={1.5} /> Compile Filter</>}
            </button>

            {previewData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border-l-2 border-white/30 pl-4"
              >
                <div className="text-sm font-medium text-white mb-1">
                  Found {previewData.count} customers
                </div>
                <div className="text-xs text-[#888888] mb-3">
                  Parsed intent: <span className="font-mono text-white/70">{JSON.stringify(previewData.filterJson)}</span>
                </div>
                <div className="space-y-2">
                  {previewData.preview.map((p: any) => (
                    <div key={p._id} className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded text-xs flex justify-between items-center">
                      <span className="text-white">{p.name}</span>
                      <span className="text-[#888888] font-mono bg-white/5 px-2 py-0.5 rounded-full text-[10px] uppercase">{p.tier}</span>
                    </div>
                  ))}
                  {previewData.count > 5 && (
                    <div className="text-xs text-[#888888] text-center py-1">
                      + {previewData.count - 5} more
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-sm text-[#888888] p-4 bg-white/[0.02] rounded-md border border-white/10">
            Manual builder not implemented for this demo. Please use the AI builder.
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 bg-white/[0.01]">
        <button 
          onClick={handleSave}
          disabled={!name || !previewData}
          className="w-full bg-white hover:bg-[#EBEBEB] text-black px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          Save Segment
        </button>
      </div>
    </motion.div>
  );
}
