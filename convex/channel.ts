import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const simulateCallback = internalAction({
  args: {
    externalId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Make HTTP POST to our own receipts endpoint
    const siteUrl = process.env.CONVEX_SITE_URL;
    if (!siteUrl) {
      console.warn("CONVEX_SITE_URL not set. Channel callback skipped.");
      return;
    }
    
    try {
      await fetch(`${siteUrl}/api/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: args.externalId,
          status: args.status
        })
      });
    } catch (e) {
      console.error("Failed to send callback", e);
    }
  }
});

export const scheduleDeliveryCycle = internalAction({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    // 8% chance of failure
    if (Math.random() < 0.08) {
      await ctx.scheduler.runAfter(1000 + Math.random() * 2000, internal.channel.simulateCallback, {
        externalId: args.externalId,
        status: "failed"
      });
      return; // Stop here
    }

    // Otherwise delivered
    await ctx.scheduler.runAfter(1000 + Math.random() * 2000, internal.channel.simulateCallback, {
      externalId: args.externalId,
      status: "delivered"
    });

    // 60% chance of opened
    if (Math.random() < 0.6) {
      await ctx.scheduler.runAfter(5000 + Math.random() * 10000, internal.channel.simulateCallback, {
        externalId: args.externalId,
        status: "opened"
      });

      // 30% chance of clicked (given opened)
      if (Math.random() < 0.3) {
        await ctx.scheduler.runAfter(10000 + Math.random() * 15000, internal.channel.simulateCallback, {
          externalId: args.externalId,
          status: "clicked"
        });

        // 15% chance of converted (given clicked)
        if (Math.random() < 0.15) {
          await ctx.scheduler.runAfter(20000 + Math.random() * 20000, internal.channel.simulateCallback, {
            externalId: args.externalId,
            status: "converted"
          });
        }
      }
    }
  }
});
