"use client";
import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu, MessageSquare, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function NewCampaign() {
  const router = useRouter();
  const segments = useQuery(api.segments.list);
  const createCampaign = useMutation(api.campaigns.create);
  const sendCampaign = useAction(api.campaigns.sendCampaign);
  const generateVariants = useAction(api.campaigns.generateVariants);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  
  const [variants, setVariants] = useState<any[]>([]);
  const [message, setMessage] = useState(""); // used if not using variants
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedSegment = segments?.find(s => s._id === segmentId);

  const handleGenerate = async () => {
    if (!name || !segmentId) return;
    setIsGenerating(true);
    try {
      const generatedVariants = await generateVariants({
        campaignName: name,
        segmentId: segmentId as any,
        channel
      });
      // The API returns an array of variants { id, name, messageTemplate }
      const completeVariants = generatedVariants.map((v: any) => ({
        ...v,
        stats: { sent: 0, delivered: 0, failed: 0, opened: 0, read: 0, clicked: 0, converted: 0 }
      }));
      setVariants(completeVariants);
      setMessage(""); // Clear single message
      toast.success("AI generated 3 variants for A/B testing!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate variants");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!name || !segmentId || (!message && variants.length === 0)) return;
    setIsSending(true);
    try {
      const campaignId = await createCampaign({
        name,
        segmentId: segmentId as any,
        channel,
        messageTemplate: message,
        variants: variants.length > 0 ? variants : undefined
      });
      
      await sendCampaign({ campaignId });
      
      toast.success("Campaign launched!");
      router.push(`/campaigns/${campaignId}`);
    } catch(e: any) {
      toast.error(e.message || "Failed to launch campaign");
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-20">
      <h2 className="text-3xl font-medium tracking-tight text-white mb-10">New Campaign</h2>

      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-white" : "bg-white/10"}`} />
        ))}
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/[0.02] border border-white/10 p-8 rounded-lg backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {step === 1 && (
          <div className="space-y-6 relative z-10">
            <h3 className="text-lg font-medium text-white">1. Campaign Details</h3>
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-2">Campaign Name</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Linen Launch"
                className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-2">Target Segment</label>
              <select 
                className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                value={segmentId}
                onChange={e => setSegmentId(e.target.value)}
              >
                <option value="" disabled className="text-[#888888]">Select a segment</option>
                {segments?.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.customerIds.length} customers)</option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!name || !segmentId}
                className="bg-white hover:bg-[#EBEBEB] text-black px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Next: Channel
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 relative z-10">
            <h3 className="text-lg font-medium text-white">2. Select Channel</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                { id: "sms", label: "SMS", icon: Phone },
                { id: "email", label: "Email", icon: Mail },
                { id: "rcs", label: "RCS", icon: MessageSquare }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`p-6 rounded-md flex flex-col items-center justify-center gap-3 transition-all ${channel === c.id ? "bg-white/10 border border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "bg-black border border-white/10 text-[#888888] hover:text-white hover:border-white/20"}`}
                >
                  <c.icon className="w-6 h-6" strokeWidth={1.5} />
                  <span className="font-medium text-sm">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="pt-4 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-[#888888] hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-white hover:bg-[#EBEBEB] text-black px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Next: Message Studio
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">3. Message Studio</h3>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? "Generating Variants..." : <><Cpu className="w-4 h-4" strokeWidth={1.5} /> Generate A/B/C Variants</>}
              </button>
            </div>
            
            {variants.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {variants.map((v, i) => (
                  <div key={v.id} className="bg-black border border-white/10 rounded-md flex flex-col relative overflow-hidden">
                    <div className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#888888]">Variant {v.id}</span>
                      <span className="text-xs font-medium text-white px-2 py-1 bg-white/10 rounded-full">{v.name}</span>
                    </div>
                    <div className="p-4 flex-1">
                      <textarea
                        className="w-full h-full bg-transparent text-sm text-[#EDEDED] font-mono resize-none focus:outline-none"
                        value={v.messageTemplate}
                        onChange={e => {
                          const newVariants = [...variants];
                          newVariants[i].messageTemplate = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                <label className="block text-xs font-medium text-[#888888] mb-2">Message Template (Single Variant)</label>
                <textarea 
                  className={`w-full h-32 bg-black border border-white/10 rounded-md p-4 text-sm font-mono text-white focus:outline-none focus:border-white/30 resize-none transition-colors ${message && message.includes("{{") ? "border-l-[3px] border-l-white/50" : ""}`}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Hi {{name}}, ..."
                />
                <div className="text-[10px] text-[#888888] mt-2 flex gap-2 items-center">
                  <span>Variables:</span>
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">{"{{name}}"}</code>
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">{"{{last_product}}"}</code>
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">{"{{discount_code}}"}</code>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="text-[#888888] hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                disabled={!message && variants.length === 0}
                className="bg-white hover:bg-[#EBEBEB] text-black px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 relative z-10">
            <h3 className="text-lg font-medium text-white">4. Review & Send</h3>
            
            <div className="grid grid-cols-2 gap-6 bg-black p-6 rounded-md border border-white/10 shadow-inner">
              <div>
                <div className="text-xs font-medium text-[#888888] mb-1">Campaign</div>
                <div className="text-base font-medium text-white">{name}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-[#888888] mb-1">Audience</div>
                <div className="text-base font-medium text-white">{selectedSegment?.name} <span className="text-[#888888] text-sm">({selectedSegment?.customerIds.length} users)</span></div>
              </div>
              <div>
                <div className="text-xs font-medium text-[#888888] mb-1">Channel</div>
                <div className="text-base font-medium text-white capitalize">{channel}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-[#888888] mb-1">Strategy</div>
                <div className="text-base font-medium text-white">
                  {variants.length > 0 ? `A/B/C Test (${variants.length} Variants)` : 'Single Blast'}
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-between border-t border-white/10 mt-8">
              <button 
                onClick={() => setStep(3)}
                className="text-[#888888] hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="bg-white hover:bg-[#EBEBEB] text-black px-8 py-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
              >
                {isSending && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                {isSending ? "Launching..." : "Launch Campaign"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
