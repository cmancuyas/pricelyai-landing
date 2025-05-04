// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("access_token") && hash.includes("refresh_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabaseClient.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (error) {
              console.error("Failed to set session:", error.message);
              setIsRouting(false);
            } else {
              router.replace("/dashboard");
            }
          });
        return;
      }
    }

    // Give the UI a brief time window before showing the app
    const timeout = setTimeout(() => setIsRouting(false), 200);
    return () => clearTimeout(timeout);
  }, [router, supabaseClient]);

  if (isRouting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
