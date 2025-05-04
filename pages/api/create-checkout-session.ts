import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = createPagesServerClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Look up user in Supabase
  const { data: profile, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("User lookup error:", error.message);
    return res.status(500).json({ error: "Failed to look up user" });
  }

  let customerId = profile?.stripe_customer_id;

  // If no Stripe customer ID, create one and store it
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id },
    });

    customerId = customer.id;

    const { error: updateError } = await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save Stripe customer ID:", updateError.message);
      return res.status(500).json({ error: "Failed to save customer ID" });
    }
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
  });

  console.log(`✅ Checkout session created: ${session.id} for user: ${user.email}`);

  return res.status(200).json({ url: session.url });
}
