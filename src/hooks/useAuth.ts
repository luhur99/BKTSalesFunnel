import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Protects a page by requiring an active Supabase session.
 * Redirects to "/" if the user is not authenticated.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    // React to auth state changes (sign-out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { session, loading };
}
