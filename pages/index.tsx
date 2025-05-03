import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-12">
      <header className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">PricelyAI</h1>
        <p className="text-lg mb-6">
          Boost your margins with AI-powered pricing for your Shopify store.
        </p>
        <form
          action="https://formspree.io/f/YOUR_FORM_ID"
          method="POST"
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="border px-4 py-2 rounded w-full sm:w-64"
          />
          <input
            type="text"
            name="store"
            required
            placeholder="Your Shopify store URL"
            className="border px-4 py-2 rounded w-full sm:w-64"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Join Free Beta
          </button>
        </form>
      </header>

      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Smart Pricing</h2>
            <p>
              AI suggests prices daily based on demand, inventory & competitors.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              Competitor Monitoring
            </h2>
            <p>Track competitor prices in real-time with automated scraping.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              1-Click Price Updates
            </h2>
            <p>Sync prices directly to your Shopify store with one click.</p>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-3xl mx-auto text-center mb-16">
        <h3 className="text-2xl font-bold mb-4">Simple Pricing</h3>
        <p className="mb-6">Start free, scale as you grow.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-2">Free Plan</h4>
              <ul className="text-left list-disc list-inside">
                <li>Up to 10 SKUs</li>
                <li>1 Store</li>
                <li>Weekly pricing suggestions</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-2">Pro Plan - $49/mo</h4>
              <ul className="text-left list-disc list-inside">
                <li>Up to 100 SKUs</li>
                <li>Daily price optimization</li>
                <li>Competitor tracking</li>
                <li>Priority support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 mt-16">
        &copy; {new Date().getFullYear()} PricelyAI. All rights reserved.
      </footer>
    </div>
  );
}
