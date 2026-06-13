"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

export default function CampaignsPage() {
  const campaigns = useQuery(api.campaigns.list);

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-white">Campaigns</h2>
        <Link 
          href="/campaigns/new"
          className="group relative overflow-hidden inline-flex items-center gap-2 bg-[#6633cc] text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-[#5527ab] shadow-[0_0_20px_rgba(102,51,204,0.2)] hover:shadow-[0_0_25px_rgba(102,51,204,0.4)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out transform skew-x-12" />
          <span className="relative flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </span>
        </Link>
      </div>

      <div className="border border-white/10 rounded-lg bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[#888888] bg-black/50">
            <tr>
              <th className="px-5 py-4 font-normal">Name</th>
              <th className="px-5 py-4 font-normal">Channel</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal">Sent</th>
              <th className="px-5 py-4 font-normal">Date</th>
              <th className="px-5 py-4 font-normal text-right"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((c, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                key={c._id} 
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                <td className="px-5 py-4 text-[#888888] capitalize">{c.channel}</td>
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
            {!campaigns && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-[#888888]">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
