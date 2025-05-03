// pages/login.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });

    // Prefill email from query param
    const emailFromQuery = router.query.email as string;
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white shadow p-8 rounded">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to PricelyAI</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Send Magic Link
          </button>
        </form>
        {status === "sending" && (
          <p className="text-sm text-blue-600 mt-4">Sending magic link...</p>
        )}
        {status === "sent" && (
          <p className="text-sm text-green-600 mt-4">
            Check your email for the sign-in link.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 mt-4">
            Failed to send link. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
