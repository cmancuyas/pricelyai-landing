import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function main() {
  const customers = await stripe.customers.list({ limit: 100 });
  let deletedCount = 0;

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
    });

    if (subscriptions.data.length === 0) {
      await stripe.customers.del(customer.id);
      console.log(`❌ Deleted customer: ${customer.id}`);
      deletedCount++;
    }
  }

  console.log(`✅ Done. Removed ${deletedCount} orphan customers.`);
}

main().catch(console.error);
