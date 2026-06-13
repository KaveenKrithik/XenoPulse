import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/channel/send",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { communicationId, recipientPhone, channel, message } = body;
    
    // Generate an external ID to track this communication
    const externalId = `ext_${Math.random().toString(36).substring(2, 15)}`;
    
    // Schedule the simulated delivery lifecycle
    await ctx.scheduler.runAfter(0, internal.channel.scheduleDeliveryCycle, {
      externalId
    });

    return new Response(JSON.stringify({ status: "accepted", externalId }), {
      status: 202,
      headers: { "Content-Type": "application/json" }
    });
  })
});

http.route({
  path: "/api/receipts",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { externalId, status } = body;
    
    // Roll up the status to the communication and campaign stats atomically
    await ctx.runMutation(api.communications.handleReceipt, {
      externalId,
      status
    });

    return new Response("OK", { status: 200 });
  })
});

export default http;
