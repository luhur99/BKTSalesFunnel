import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      setRole(data?.role ?? null);
      setLoading(false);
    });
  }, []);

  return { role, isAdmin: role === "admin", loading };
}
