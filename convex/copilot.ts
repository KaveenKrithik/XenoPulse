import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const ask = action({
  args: { 
    message: v.string(),
    history: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string()
    }))
  },
  handler: async (ctx, args): Promise<string> => {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set.");
      return "I am currently offline. Please configure the GROQ_API_KEY to enable live intelligence.";
    }

    const campaigns = await ctx.runQuery(api.campaigns.list);
    const segments = await ctx.runQuery(api.segments.list);
    
    const contextStr = `
CURRENT CRM STATE:
Campaigns: ${JSON.stringify(campaigns.map(c => ({ name: c.name, status: c.status, channel: c.channel, stats: c.stats, variants: c.variants?.map(v => ({name: v.name, stats: v.stats})) })))}
Segments: ${JSON.stringify(segments.map(s => ({ name: s.name, count: s.customerIds.length })))}
`;

    const systemPrompt = `You are a highly intelligent, minimalist AI agent named XenoPilot, integrated directly into the XenoPulse CRM.
Your tone is incredibly concise, highly analytical, and strictly professional. No pleasantries, no emojis, no fluff.
You have access to the current CRM database state. Use it to answer the user's questions accurately.
If the user asks about campaigns, refer to the data provided below.
If you don't know the answer based on the data, state it plainly.

${contextStr}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...args.history,
      { role: "user", content: args.message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages
      })
    });
    
    if (!response.ok) {
        console.error("Groq API call failed", await response.text());
        throw new Error("Groq API call failed");
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
});
