// pages/api/webhooks/stripe.ts
import { buffer } from "micro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("stripe_customer_id", customerId)
      .single();

    if (user) {
      console.log("✅ Found user for upgrade:", user);

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { role: "pro" },
      });

      const { error: updateError } = await supabase
        .from("users")
        .update({ is_pro: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ Failed to update is_pro to true:", updateError.message);
      } else {
        console.log(`✅ Upgraded ${user.email} to Pro`);
      }
    } else {
      console.error("⚠️ User not found with customer ID:", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("stripe_customer_id", customerId)
      .single();

    if (user) {
      console.log("✅ Found user for downgrade:", user);

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { role: "free" },
      });

      const { error: updateError } = await supabase
        .from("users")
        .update({ is_pro: false })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ Failed to update is_pro to false:", updateError.message);
      } else {
        console.log(`🛑 Downgraded ${user.email} to Free`);
      }
    } else {
      console.error("⚠️ User not found for subscription cancellation:", customerId);
    }
  }

  res.status(200).json({ received: true });
}
