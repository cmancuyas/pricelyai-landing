import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


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

  // Fetch the Stripe customer ID from the user's Supabase profile
  const { data: profile, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.stripe_customer_id) {
    console.error("Missing stripe_customer_id for user:", user.id);
    return res.status(400).json({ error: "Stripe customer ID not found" });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return res.status(200).json({ url: session.url });
}
