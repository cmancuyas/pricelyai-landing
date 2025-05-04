import { createContext, useContext, useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";

type ProContextType = {
  isPro: boolean;
  loading: boolean;
};

const ProContext = createContext<ProContextType>({ isPro: false, loading: true });

export const ProProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSessionContext();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProStatus = async () => {
      if (!session?.user) return setLoading(false);

      const { data, error } = await supabase
        .from("users")
        .select("is_pro")
        .eq("id", session.user.id)
        .single();

      if (error) console.error("Failed to fetch Pro status:", error.message);

      setIsPro(data?.is_pro ?? false);
      setLoading(false);
    };

    checkProStatus();
  }, [session]);

  return (
    <ProContext.Provider value={{ isPro, loading }}>
      {children}
    </ProContext.Provider>
  );
};

export const usePro = () => useContext(ProContext);
