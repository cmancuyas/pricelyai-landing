import Stripe from 'stripe';
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

async function cleanOrphanCustomers(email: string) {
  const customers = await stripe.customers.list({ email, limit: 100 });
  const orphans: string[] = [];

  for (const customer of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: customer.id, limit: 1 });
    if (subs.data.length === 0) {
      orphans.push(customer.id);
    }
  }

  for (const id of orphans) {
    await stripe.customers.del(id);
    console.log(`❌ Deleted customer: ${id}`);
  }

  console.log(`✅ Done. Removed ${orphans.length} orphan customers.`);
}

cleanOrphanCustomers('christopher.mancuyas@gmail.com');
