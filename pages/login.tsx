import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    console.log("🔍 Current hash:", hash);
  
    if (hash.includes("access_token") && hash.includes("refresh_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
  
      console.log("🔑 access_token:", access_token);
      console.log("🔑 refresh_token:", refresh_token);
  
      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ data, error }) => {
            if (error) {
              console.error("❌ setSession ERROR:", error.message);
            } else {
              console.log("✅ Session set successfully:", data);
              router.replace("/dashboard");
            }
          });
      }
    } else {
      console.log("⚠️ No tokens found in hash.");
      setLoading(false);
    }
  }, [router]);
  

  const handleLogin = async () => {
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSending(false);

    if (error) alert(error.message);
    else alert("Magic link sent! Check your email.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Logging you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign in to PricelyAI</h2>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 flex justify-center"
          disabled={sending}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send Magic Link"
          )}
        </button>
      </div>
    </div>
  );
}
