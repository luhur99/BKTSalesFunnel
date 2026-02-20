import { supabase, isConnected } from "./client";
import { MOCK_ACTIVITIES } from "./mock-data";

export const activities = {
  getByLead: async (leadId: string) => {
    if (!isConnected) {
      return MOCK_ACTIVITIES
        .filter(a => a.lead_id === leadId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    const { data, error } = await supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (activity: any) => {
    if (!isConnected) {
      const newActivity = { id: `act-${Date.now()}`, ...activity, created_at: new Date().toISOString() };
      MOCK_ACTIVITIES.unshift(newActivity);
      return newActivity;
    }
    const { data, error } = await supabase
      .from("lead_activities")
      .insert([activity])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
