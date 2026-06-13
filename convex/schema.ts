import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    tier: v.union(
      v.literal("vip"),
      v.literal("loyal"),
      v.literal("at-risk"),
      v.literal("new")
    ),
    totalOrders: v.number(),
    totalSpend: v.number(),
    lastOrderDate: v.number(), // timestamp
    preferredChannel: v.union(
      v.literal("whatsapp"),
      v.literal("sms"),
      v.literal("email"),
      v.literal("rcs")
    ),
    tags: v.array(v.string()),
  }),

  orders: defineTable({
    customerId: v.id("customers"),
    amount: v.number(),
    items: v.array(
      v.object({
        name: v.string(),
        qty: v.number(),
        price: v.number(),
      })
    ),
    createdAt: v.number(),
    status: v.string(),
  }).index("by_customer", ["customerId"]),

  segments: defineTable({
    name: v.string(),
    description: v.string(),
    filterJson: v.any(), // Storing the structured filter object
    customerIds: v.array(v.id("customers")),
    createdAt: v.number(),
    createdBy: v.union(v.literal("ai"), v.literal("manual")),
  }),

  campaigns: defineTable({
    name: v.string(),
    segmentId: v.id("segments"),
    channel: v.string(),
    messageTemplate: v.string(), // fallback for old campaigns or non-variant ones
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
    }))),
    status: v.union(
      v.literal("draft"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("completed")
    ),
    scheduledAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    stats: v.object({
      total: v.number(),
      sent: v.number(),
      delivered: v.number(),
      failed: v.number(),
      opened: v.number(),
      read: v.number(),
      clicked: v.number(),
      converted: v.number(),
    }),
  }),

  communications: defineTable({
    campaignId: v.id("campaigns"),
    customerId: v.id("customers"),
    channel: v.string(),
    message: v.string(),
    variantId: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("opened"),
      v.literal("read"),
      v.literal("clicked"),
      v.literal("converted")
    ),
    sentAt: v.optional(v.number()),
    updatedAt: v.number(),
    externalId: v.optional(v.string()),
  })
    .index("by_externalId", ["externalId"])
    .index("by_campaign", ["campaignId"]),

  campaignDebriefs: defineTable({
    campaignId: v.id("campaigns"),
    summary: v.string(),
    generatedAt: v.number(),
  }).index("by_campaign", ["campaignId"]),
});
