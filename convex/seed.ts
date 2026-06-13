import { mutation } from "./_generated/server";

const CITIES = ["Mumbai", "Bangalore", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];
const TIERS = ["vip", "loyal", "at-risk", "new"] as const;
const CHANNELS = ["whatsapp", "sms", "email", "rcs"] as const;

const FIRST_NAMES = ["Rahul", "Priya", "Amit", "Neha", "Rohan", "Sneha", "Karan", "Pooja", "Vikram", "Anjali", "Arjun", "Kavya", "Siddharth", "Ishita", "Aditya", "Riya"];
const LAST_NAMES = ["Sharma", "Verma", "Patil", "Desai", "Singh", "Reddy", "Iyer", "Nair", "Joshi", "Kapoor", "Mehta", "Bhat"];

const PRODUCTS = [
  { name: "Linen Kurta", price: 1299 },
  { name: "Cold Brew 500ml", price: 350 },
  { name: "Vitamin C Serum", price: 899 },
  { name: "Ceramic Coffee Mug", price: 450 },
  { name: "Scented Candle", price: 600 },
  { name: "Leather Wallet", price: 1500 },
  { name: "Bamboo Toothbrush set", price: 299 },
];

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // 1. Check if already seeded
    const existing = await ctx.db.query("customers").first();
    if (existing) {
      console.log("Already seeded.");
      return;
    }

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const customerIds = [];

    // 2. Create 200 Customers & Orders
    for (let i = 0; i < 200; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const phone = `+9198${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`;
      
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
      const preferredChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];

      const numOrders = Math.floor(Math.random() * 3) + 3; // 3 to 5 orders
      let totalSpend = 0;
      let lastOrderDate = now - Math.floor(Math.random() * 120 * day);

      if (tier === "new") lastOrderDate = now - Math.floor(Math.random() * 20 * day);
      if (tier === "at-risk") lastOrderDate = now - Math.floor(Math.random() * 100 * day) - 90 * day;

      const customerId = await ctx.db.insert("customers", {
        name,
        email,
        phone,
        city,
        tier,
        totalOrders: numOrders,
        totalSpend: 0, // Will update
        lastOrderDate,
        preferredChannel,
        tags: ["summer_sale", "organic"],
      });

      customerIds.push(customerId);

      for (let j = 0; j < numOrders; j++) {
        const item = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const amount = item.price * qty;
        totalSpend += amount;

        await ctx.db.insert("orders", {
          customerId,
          amount,
          items: [{ name: item.name, qty, price: item.price }],
          createdAt: lastOrderDate - Math.floor(Math.random() * j * 10 * day),
          status: "delivered",
        });
      }

      await ctx.db.patch(customerId, { totalSpend });
    }

    // 3. Create Segments
    const vipSegmentId = await ctx.db.insert("segments", {
      name: "VIP Customers (AOV > ₹5000)",
      description: "Customers who spend significantly.",
      filterJson: { spend_gt: 5000 },
      customerIds: customerIds.slice(0, 50),
      createdAt: now - 10 * day,
      createdBy: "manual",
    });

    const atRiskSegmentId = await ctx.db.insert("segments", {
      name: "At-Risk (no order in 90 days)",
      description: "Slipping away.",
      filterJson: { days_since_last_order_gt: 90 },
      customerIds: customerIds.slice(50, 100),
      createdAt: now - 5 * day,
      createdBy: "ai",
    });

    await ctx.db.insert("segments", {
      name: "New Customers (first order < 30 days)",
      description: "Recent acquisitions.",
      filterJson: { first_order_lt: 30 },
      customerIds: customerIds.slice(100, 150),
      createdAt: now - 2 * day,
      createdBy: "manual",
    });

    // 4. Create 2 Campaigns
    const c1 = await ctx.db.insert("campaigns", {
      name: "Summer Linen Launch",
      segmentId: vipSegmentId,
      channel: "whatsapp",
      messageTemplate: "Hi {{name}}, our new Linen Kurtas are here! Get early access before they sell out.",
      status: "completed",
      sentAt: now - 2 * day,
      createdAt: now - 3 * day,
      stats: {
        total: 50,
        sent: 50,
        delivered: 48,
        failed: 2,
        opened: 35,
        read: 30,
        clicked: 15,
        converted: 5,
      },
    });

    const c2 = await ctx.db.insert("campaigns", {
      name: "We miss you - 20% Off",
      segmentId: atRiskSegmentId,
      channel: "sms",
      messageTemplate: "Hi {{name}}, we haven't seen you in a while! Here's 20% off your next order. Use code MISSYOU20.",
      status: "completed",
      sentAt: now - 1 * day,
      createdAt: now - 1 * day,
      stats: {
        total: 50,
        sent: 50,
        delivered: 45,
        failed: 5,
        opened: 20,
        read: 20,
        clicked: 5,
        converted: 1,
      },
    });

    // 5. Communications for Campaign 1
    const statuses = ["delivered", "opened", "read", "clicked", "converted"];
    for (let i = 0; i < 50; i++) {
      const custId = customerIds[i];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      await ctx.db.insert("communications", {
        campaignId: c1,
        customerId: custId,
        channel: "whatsapp",
        message: "Hi there, our new Linen Kurtas are here! Get early access before they sell out.",
        status,
        sentAt: now - 2 * day,
        updatedAt: now - 2 * day + Math.floor(Math.random() * 3600000),
        externalId: `ext_${c1}_${i}`,
      });
    }

    // 6. Communications for Campaign 2
    for (let i = 50; i < 100; i++) {
      const custId = customerIds[i];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      await ctx.db.insert("communications", {
        campaignId: c2,
        customerId: custId,
        channel: "sms",
        message: "Hi there, we haven't seen you in a while! Here's 20% off your next order. Use code MISSYOU20.",
        status,
        sentAt: now - 1 * day,
        updatedAt: now - 1 * day + Math.floor(Math.random() * 3600000),
        externalId: `ext_${c2}_${i}`,
      });
    }

    // 7. Create debriefs
    await ctx.db.insert("campaignDebriefs", {
      campaignId: c1,
      summary: "The Summer Linen Launch performed exceptionally well with our VIPs. The 70% open rate led to a solid 10% conversion rate. WhatsApp proved to be the right channel for this high-value segment.",
      generatedAt: now - 1 * day,
    });

    await ctx.db.insert("campaignDebriefs", {
      campaignId: c2,
      summary: "The win-back campaign had modest results. While SMS delivery was high, click-throughs were lower than expected at 10%. Consider trying a different offer or channel for this At-Risk group.",
      generatedAt: now,
    });
  },
});
