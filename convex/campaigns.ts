import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  }
});

export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    segmentId: v.id("segments"),
    channel: v.string(),
    messageTemplate: v.string(),
    variants: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      messageTemplate: v.string(),
      stats: v.object({
        sent: v.number(),
        delivered: v.number(),
        failed: v.number(),
        opened: v.number(),
        read: v.number(),
        clicked: v.number(),
        converted: v.number(),
      })
    })))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
      stats: { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0, read: 0, clicked: 0, converted: 0 }
    });
  }
});

export const generateVariants = action({
  args: {
    campaignName: v.string(),
    segmentId: v.id("segments"),
    channel: v.string(),
  },
  handler: async (ctx, args): Promise<any[]> => {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Using mock variants.");
      return [
        { id: "A", name: "FOMO", messageTemplate: "Hi {{name}}, only 2 hours left to grab your {{last_product}} with code {{discount_code}} before we sell out!" },
        { id: "B", name: "Value", messageTemplate: "Hey {{name}}, loving your {{last_product}}? Use {{discount_code}} for 20% off your next premium order." },
        { id: "C", name: "Curiosity", messageTemplate: "{{name}}, we made something special just for you. Use {{discount_code}} to unlock it." }
      ];
    }
    const segment = await ctx.runQuery(api.segments.get, { id: args.segmentId });
    if (!segment) throw new Error("Segment not found");

    const prompt = `You are an expert DTC copywriter. The user is running a campaign "${args.campaignName}" on channel "${args.channel}".
Target audience: ${segment.description}.
Generate exactly 3 variants for an A/B test. The variants should represent different psychological hooks:
Variant A (FOMO): Emphasizes urgency or scarcity.
Variant B (Value): Emphasizes the core value proposition, benefits, or discount.
Variant C (Curiosity): Teases something exciting to get the user to click.

Use EXACTLY these template variables where appropriate: {{name}}, {{last_product}}, {{discount_code}}. Do not use any other variables.

Output EXACTLY JSON in the following format:
{
  "variants": [
    { "id": "A", "name": "FOMO", "messageTemplate": "..." },
    { "id": "B", "name": "Value", "messageTemplate": "..." },
    { "id": "C", "name": "Curiosity", "messageTemplate": "..." }
  ]
}
Do not output any markdown code blocks, just raw JSON.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Return ONLY the raw JSON." },
          { role: "user", content: prompt }
        ]
      })
    });
    
    if (!response.ok) throw new Error("Groq API call failed");
    const data = await response.json();
    try {
      const parsed = JSON.parse(data.choices[0].message.content.trim());
      return parsed.variants;
    } catch(e) {
      throw new Error("Failed to parse AI output");
    }
  }
});

export const generateMessage = action({
  args: {
    campaignName: v.string(),
    segmentId: v.id("segments"),
    channel: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Using mock message.");
      return `Hey {{name}}, your favorite {{last_product}} is back in stock. Use {{discount_code}} for early access.`;
    }
    const segment = await ctx.runQuery(api.segments.get, { id: args.segmentId });
    if (!segment) throw new Error("Segment not found");

    const prompt = `You are an expert DTC copywriter. Write a short, highly converting message for the campaign "${args.campaignName}". 
Channel: ${args.channel}. 
Target audience description: ${segment.description}.
Use exactly these template variables where appropriate: {{name}}, {{last_product}}, {{discount_code}}.
Do not include any other variables. The message must be ready to send.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Return ONLY the raw message text. No pleasantries, no markdown blocks, no quotes." },
          { role: "user", content: prompt }
        ]
      })
    });
    
    if (!response.ok) throw new Error("Groq API call failed");
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
});

export const generateDebrief = action({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<string> => {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Using mock debrief.");
      const campaign = await ctx.runQuery(api.campaigns.get, { id: args.campaignId });
      const segment = await ctx.runQuery(api.segments.get, { id: campaign?.segmentId as any });
      const summary = `The campaign "${campaign?.name}" showed exceptional performance across the "${segment?.name}" audience. Variant C (Curiosity) outperformed the others with a 24% higher conversion rate, indicating that teasing value rather than explicitly stating the discount leads to higher engagement in this segment. Overall engagement was strong, with delivery rates holding steady at 98%.`;
      await ctx.runMutation(api.campaigns.saveDebrief, { campaignId: args.campaignId, summary });
      return summary;
    }
    const campaign = await ctx.runQuery(api.campaigns.get, { id: args.campaignId });
    if (!campaign) throw new Error("Campaign not found");
    const segment = await ctx.runQuery(api.segments.get, { id: campaign.segmentId });

    let statsText = `Total ${campaign.stats.total}, Delivered ${campaign.stats.delivered}, Opened ${campaign.stats.opened}, Clicked ${campaign.stats.clicked}, Converted ${campaign.stats.converted}.`;
    if (campaign.variants && campaign.variants.length > 0) {
      statsText += `\nVariants:\n`;
      for (const v of campaign.variants) {
        statsText += `- ${v.name}: Delivered ${v.stats.delivered}, Converted ${v.stats.converted}\n`;
      }
    }

    const prompt = `Write a one-paragraph plain-English performance summary for the campaign "${campaign.name}" sent via ${campaign.channel} to the segment "${segment?.name}".
Stats: ${statsText}
Make it sound like an insightful marketing analyst. Note which variant won if A/B testing was used.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Return ONLY the paragraph. No markdown formatting, no quotes." },
          { role: "user", content: prompt }
        ]
      })
    });
    
    if (!response.ok) throw new Error("Groq API call failed");
    const data = await response.json();
    const summary = data.choices[0].message.content.trim();
    
    await ctx.runMutation(api.campaigns.saveDebrief, { campaignId: args.campaignId, summary });
    return summary;
  }
});

export const saveDebrief = mutation({
  args: { campaignId: v.id("campaigns"), summary: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaignDebriefs", {
      campaignId: args.campaignId,
      summary: args.summary,
      generatedAt: Date.now()
    });
  }
});

export const getDebrief = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.query("campaignDebriefs")
      .withIndex("by_campaign", q => q.eq("campaignId", args.campaignId))
      .first();
  }
});

export const sendCampaign = action({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(api.campaigns.updateStatus, { id: args.campaignId, status: "sending" });
    
    const campaign = await ctx.runQuery(api.campaigns.get, { id: args.campaignId });
    const segment = await ctx.runQuery(api.segments.get, { id: campaign!.segmentId });
    if (!segment) throw new Error("Segment not found");

    const customers = await ctx.runQuery(api.campaigns.getCustomersByIds, { ids: segment.customerIds });

    const commIds = [];
    let i = 0;
    for (const customer of customers) {
      if (!customer) continue;
      
      let messageTemplate = campaign!.messageTemplate;
      let variantId = undefined;
      
      if (campaign!.variants && campaign!.variants.length > 0) {
        const variant = campaign!.variants[i % campaign!.variants.length];
        messageTemplate = variant.messageTemplate;
        variantId = variant.id;
      }
      
      let message = messageTemplate;
      message = message.replace("{{name}}", customer.name);
      message = message.replace("{{last_product}}", "Premium Product"); 
      message = message.replace("{{discount_code}}", "PULSE20"); 
      
      const commId = await ctx.runMutation(api.communications.create, {
        campaignId: args.campaignId,
        customerId: customer._id,
        channel: campaign!.channel,
        message,
        variantId,
      });
      commIds.push({ commId, phone: customer.phone });
      i++;
    }

    await ctx.runMutation(api.campaigns.updateTotal, { id: args.campaignId, total: commIds.length });

    const siteUrl = process.env.CONVEX_SITE_URL;
    if (!siteUrl) {
        console.error("CONVEX_SITE_URL not set! Cannot call HTTP endpoints.");
        // Fallback for local testing if env is missing
        return;
    }

    for (const comm of commIds) {
      try {
        const res = await fetch(`${siteUrl}/api/channel/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communicationId: comm.commId,
            recipientPhone: comm.phone,
            channel: campaign!.channel,
            message: "mock"
          })
        });
        if (res.ok) {
          const data = await res.json();
          await ctx.runMutation(api.communications.markSent, { 
            id: comm.commId, 
            externalId: data.externalId 
          });
        } else {
          await ctx.runMutation(api.communications.markFailed, { id: comm.commId });
        }
      } catch (e) {
        await ctx.runMutation(api.communications.markFailed, { id: comm.commId });
      }
    }
    
    await ctx.runMutation(api.campaigns.updateStatus, { id: args.campaignId, status: "completed" });
  }
});

export const updateStatus = mutation({
  args: { id: v.id("campaigns"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status as any, sentAt: args.status === "completed" ? Date.now() : undefined });
  }
});

export const updateTotal = mutation({
  args: { id: v.id("campaigns"), total: v.number() },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.id);
    if (c) {
      await ctx.db.patch(args.id, { stats: { ...c.stats, total: args.total } });
    }
  }
});

export const getCustomersByIds = query({
  args: { ids: v.array(v.id("customers")) },
  handler: async (ctx, args) => {
    return Promise.all(args.ids.map(id => ctx.db.get(id)));
  }
});
