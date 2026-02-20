import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const isConnected =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-project-url" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder";

// Only log in development
export const log: (...args: any[]) => void =
  process.env.NODE_ENV === "development" ? console.log : () => {};
