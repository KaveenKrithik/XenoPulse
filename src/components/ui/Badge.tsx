import { ReactNode } from "react";

export function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-[#1E1E2E] text-text-secondary",
    sending: "bg-warning/20 text-warning border border-warning/30",
    completed: "bg-success/20 text-success border border-success/30",
    sent: "bg-success/20 text-success border border-success/30",
    queued: "bg-[#1E1E2E] text-text-secondary",
    delivered: "bg-accent/20 text-accent border border-accent/30",
    opened: "bg-[#111118] text-[#9B8FF9] border border-[#7C6AF7]/30",
    clicked: "bg-[#111118] text-success border border-success/30",
    converted: "bg-warning/20 text-warning border border-warning/30",
    failed: "bg-danger/20 text-danger border border-danger/30",
    vip: "bg-[#7C6AF7]/20 text-[#9B8FF9] border border-[#7C6AF7]/30",
    loyal: "bg-success/20 text-success border border-success/30",
    "at-risk": "bg-danger/20 text-danger border border-danger/30",
    new: "bg-[#1E1E2E] text-text-secondary",
  };
  const color = colors[status.toLowerCase()] || colors.draft;
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest ${color}`}>
      {status}
    </span>
  );
}
