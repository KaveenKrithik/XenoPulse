import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    const campaigns = await ctx.db.query("campaigns").collect();

    const totalCustomers = customers.length;
    const activeCampaigns = campaigns.filter(c => c.status === "sending" || c.status === "sent").length;

    const totalAttributed = customers.reduce((sum, c) => sum + c.totalSpend, 0);

    const completedCampaigns = campaigns.filter(c => c.status === "completed" && c.stats.delivered > 0);
    const avgOpenRate = completedCampaigns.length > 0 
      ? completedCampaigns.reduce((sum, c) => sum + (c.stats.opened / c.stats.delivered), 0) / completedCampaigns.length 
      : 0;

    return {
      totalCustomers,
      activeCampaigns,
      avgOpenRate: (avgOpenRate * 100).toFixed(1),
      totalAttributed
    };
  }
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").take(200);
  }
});
