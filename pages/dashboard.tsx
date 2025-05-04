import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { usePro } from "../context/ProContext"; // ✅ Pro context

type Product = {
  id: string;
  title: string;
  price: string;
  url: string;
  scraped_at: string;
  store: string;
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [stores, setStores] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState<string>("");

  const router = useRouter();
  const { isPro, loading: proLoading } = usePro(); // ✅ use context

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("scraped_at", { ascending: false });

      if (error) console.error("Fetch error:", error);
      else {
        setProducts(data);
        setStores(new Set(data.map((p: Product) => p.store).filter(Boolean)));
      }

      setLoading(false);
    };

    fetchUserAndProducts();
  }, [router]);

  const filtered = storeFilter
    ? products.filter((p) => p.store === storeFilter)
    : products;

  if (loading || proLoading) {
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">
        Loading your dashboard...
      </p>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">
        🧾 Scraped Products Dashboard
      </h1>

      <div className="mb-6 text-center">
        <label className="mr-2 font-medium">Filter by store:</label>
        <select
          className="border px-2 py-1 rounded"
          value={storeFilter ?? ""}
          onChange={(e) => setStoreFilter(e.target.value || null)}
        >
          <option value="">All stores</option>
          {[...stores].map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold mb-2">{p.title}</h2>
            <p className="text-green-600 font-bold">{p.price}</p>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block my-2"
            >
              View Product
            </a>
            <p className="text-sm text-gray-500">
              Scraped: {new Date(p.scraped_at).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Store: {p.store}</p>
          </div>
        ))}

        <button
          onClick={async () => {
            const res = await fetch("/api/create-portal-session", {
              method: "POST",
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
          }}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Manage Subscription
        </button>
      </div>

      {!isPro && (
        <section className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
          <p className="mb-6 text-gray-600">
            Unlock daily price optimization, competitor tracking, and more.
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
            onClick={async () => {
              const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
          >
            Subscribe to Pro Plan
          </button>
        </section>
      )}

      {isPro && (
        <section className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            ✅ Pro Active
          </h2>
          <p className="text-gray-600">
            You're subscribed to the Pro plan. Premium features are unlocked.
          </p>
        </section>
      )}
    </div>
  );
}
