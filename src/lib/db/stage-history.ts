import { supabase, isConnected } from "./client";
import { MOCK_STAGE_HISTORY } from "./mock-data";

export const stageHistory = {
  getByLead: async (leadId: string) => {
    if (!isConnected) {
      return MOCK_STAGE_HISTORY
        .filter(h => h.lead_id === leadId)
        .sort((a, b) => new Date(b.moved_at).getTime() - new Date(a.moved_at).getTime());
    }
    const { data, error } = await supabase
      .from("lead_stage_history")
      .select(`
        *,
        from_stage:stages!from_stage_id(*),
        to_stage:stages!to_stage_id(*)
      `)
      .eq("lead_id", leadId)
      .order("moved_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (historyData: {
    lead_id: string;
    from_stage_id: string | null;
    to_stage_id: string;
    from_funnel: "follow_up" | "broadcast" | null;
    to_funnel: "follow_up" | "broadcast";
    reason: string;
    notes: string;
    moved_by: string;
  }) => {
    if (!isConnected) {
      const newHistory = {
        id: `hist-${Date.now()}`,
        ...historyData,
        moved_at: new Date().toISOString()
      };
      MOCK_STAGE_HISTORY.unshift(newHistory);
      return newHistory;
    }

    const { data, error } = await supabase
      .from("lead_stage_history")
      .insert([historyData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
