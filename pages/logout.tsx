// pages/logout.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import Spinner from "../components/Spinner";

export default function Logout() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };

    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Spinner className="w-10 h-10 text-indigo-600" />
      <span className="ml-3 text-gray-600">Signing out...</span>
    </div>
  );
}
