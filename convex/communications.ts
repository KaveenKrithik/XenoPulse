import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const comms = await ctx.db.query("communications")
      .withIndex("by_campaign", q => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();
      
    // Fetch customer details to include name
    const withCustomers = await Promise.all(comms.map(async c => {
      const cust = await ctx.db.get(c.customerId);
      return { ...c, customerName: cust?.name || "Unknown" };
    }));
    return withCustomers;
  }
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    customerId: v.id("customers"),
    channel: v.string(),
    message: v.string(),
    variantId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communications", {
      ...args,
      status: "queued",
      updatedAt: Date.now()
    });
  }
});

export const markSent = mutation({
  args: { id: v.id("communications"), externalId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, { status: "sent", externalId: args.externalId, sentAt: now, updatedAt: now });
    
    // Increment campaign sent count
    const comm = await ctx.db.get(args.id);
    if (comm) {
      const c = await ctx.db.get(comm.campaignId);
      if (c) {
        const variants = c.variants ? [...c.variants] : undefined;
        if (variants && comm.variantId) {
          const vIndex = variants.findIndex(v => v.id === comm.variantId);
          if (vIndex >= 0) {
            variants[vIndex] = { ...variants[vIndex], stats: { ...variants[vIndex].stats, sent: variants[vIndex].stats.sent + 1 } };
          }
        }
        await ctx.db.patch(c._id, { stats: { ...c.stats, sent: c.stats.sent + 1 }, variants });
      }
    }
  }
});

export const markFailed = mutation({
  args: { id: v.id("communications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "failed", updatedAt: Date.now() });
    
    // Increment campaign failed count
    const comm = await ctx.db.get(args.id);
    if (comm) {
      const c = await ctx.db.get(comm.campaignId);
      if (c) {
        const variants = c.variants ? [...c.variants] : undefined;
        if (variants && comm.variantId) {
          const vIndex = variants.findIndex(v => v.id === comm.variantId);
          if (vIndex >= 0) {
            variants[vIndex] = { ...variants[vIndex], stats: { ...variants[vIndex].stats, failed: variants[vIndex].stats.failed + 1 } };
          }
        }
        await ctx.db.patch(c._id, { stats: { ...c.stats, failed: c.stats.failed + 1 }, variants });
      }
    }
  }
});

// Used by the webhook/receipt handler
export const handleReceipt = mutation({
  args: { externalId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const comm = await ctx.db.query("communications")
      .withIndex("by_externalId", q => q.eq("externalId", args.externalId))
      .first();
      
    if (!comm) return; // Ignore if not found
    if (comm.status === args.status) return; // Idempotency check 1
    
    // Hierarchy of statuses: queued -> sent -> delivered -> opened -> clicked -> converted
    const statusValues = { "queued": 0, "sent": 1, "failed": 1, "delivered": 2, "opened": 3, "read": 3, "clicked": 4, "converted": 5 };
    const currVal = statusValues[comm.status as keyof typeof statusValues] || 0;
    const newVal = statusValues[args.status as keyof typeof statusValues] || 0;
    
    if (newVal <= currVal) return; // Only move forward in status

    await ctx.db.patch(comm._id, { status: args.status as any, updatedAt: Date.now() });

    // Update campaign stats atomically
    const campaign = await ctx.db.get(comm.campaignId);
    if (campaign) {
      const newStats = { ...campaign.stats };
      if (args.status in newStats) {
        (newStats as any)[args.status] += 1;
      }

      const newVariants = campaign.variants ? [...campaign.variants] : undefined;
      if (newVariants && comm.variantId) {
        const vIndex = newVariants.findIndex(v => v.id === comm.variantId);
        if (vIndex >= 0) {
           newVariants[vIndex] = { ...newVariants[vIndex], stats: { ...newVariants[vIndex].stats } };
           if (args.status in newVariants[vIndex].stats) {
              (newVariants[vIndex].stats as any)[args.status] += 1;
           }
        }
      }

      await ctx.db.patch(campaign._id, { stats: newStats, variants: newVariants });
    }
  }
});
