// scripts/test-webhook.js
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

(async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/webhooks/stripe', {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_SFbUQElZqsIZjw' // Make sure this matches your Supabase DB
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature' // Signature bypassed for manual test
      }
    });

    console.log('✅ Webhook response:', response.data);
  } catch (err) {
    console.error('❌ Webhook test failed:', err.response?.data || err.message);
  }
})();
