import { supabase, isConnected } from "./client";
import { MOCK_SOURCES } from "./mock-data";

export const sources = {
  getAll: async () => {
    if (!isConnected) return MOCK_SOURCES;
    const { data, error } = await supabase.from("lead_sources").select("*").order("name");
    if (error) throw error;
    return data;
  }
};
