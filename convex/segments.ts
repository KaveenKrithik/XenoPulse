import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("segments").order("desc").collect();
  }
});

export const get = query({
  args: { id: v.id("segments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    filterJson: v.any(),
    customerIds: v.array(v.id("customers")),
    createdBy: v.union(v.literal("ai"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("segments", {
      ...args,
      createdAt: Date.now(),
    });
  }
});

export const evaluateFilter = query({
  args: { filterJson: v.any() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("customers").collect();
    const f = args.filterJson;
    return all.filter(c => {
      let match = true;
      if (f.tier && c.tier !== f.tier) match = false;
      if (f.preferredChannel && c.preferredChannel !== f.preferredChannel) match = false;
      if (f.minSpend && c.totalSpend < f.minSpend) match = false;
      if (f.minOrders && c.totalOrders < f.minOrders) match = false;
      if (f.daysSinceLastOrder) {
        const days = (Date.now() - c.lastOrderDate) / (24*60*60*1000);
        if (days < f.daysSinceLastOrder) match = false; // logic depends on intent, simplified here
      }
      return match;
    });
  }
});

export const generateSegmentFromIntent = action({
  args: { intent: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Using mock segment logic.");
      const mockFilter = { tier: "vip", daysSinceLastOrder: 30 };
      const customers = await ctx.runQuery(api.segments.evaluateFilter, { filterJson: mockFilter });
      return { 
        filterJson: mockFilter, 
        count: customers.length, 
        preview: customers.slice(0, 5),
        ids: customers.map((c: any) => c._id)
      };
    }
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are an AI that translates natural language marketer intents into a JSON object for filtering a customer database. The schema includes: tier ('vip'|'loyal'|'at-risk'|'new'), preferredChannel ('whatsapp'|'sms'|'email'|'rcs'), minSpend (number), minOrders (number), daysSinceLastOrder (number). Return ONLY valid JSON, no markdown formatting. Do not wrap in ```json or any other text." },
          { role: "user", content: args.intent }
        ]
      })
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error("Groq API call failed");
    }

    const data = await response.json();
    let filterJson;
    try {
      let text = data.choices[0].message.content.trim();
      if (text.startsWith("```")) {
        text = text.replace(/```json\n?/, "").replace(/```$/, "").trim();
      }
      filterJson = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Groq", data.choices[0].message.content);
      throw new Error("Invalid response from Groq");
    }

    const customers = await ctx.runQuery(api.segments.evaluateFilter, { filterJson });

    return { 
      filterJson, 
      count: customers.length, 
      preview: customers.slice(0, 5),
      ids: customers.map(c => c._id)
    };
  }
});
