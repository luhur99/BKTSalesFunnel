import { supabase, isConnected } from "./client";
import { MOCK_FOLLOW_UP_STAGES, MOCK_BROADCAST_STAGES } from "./mock-data";
import { Stage } from "@/types/lead";

export const stages = {
  async getByFunnel(funnelId: string): Promise<Stage[]> {
    if (!isConnected) return [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES];
    const { data, error } = await supabase
      .from("stages")
      .select("*")
      .or(`funnel_id.eq.${funnelId},funnel_id.is.null`)
      .order("funnel_type", { ascending: true })
      .order("stage_number", { ascending: true });

    if (error) {
      console.error("Error fetching stages:", error);
      throw error;
    }

    const stageList = data || [];
    const result: Stage[] = [];

    for (const type of ["follow_up", "broadcast"] as const) {
      const typeStages = stageList.filter(s => s.funnel_type === type);
      const funnelSpecific = typeStages.filter(s => s.funnel_id === funnelId);
      const global = typeStages.filter(s => !s.funnel_id);
      result.push(...(funnelSpecific.length > 0 ? funnelSpecific : global));
    }

    return result;
  },

  async getAll(): Promise<Stage[]> {
    if (!isConnected) return [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES];
    const { data, error } = await supabase
      .from("stages")
      .select("*")
      .order("funnel_type", { ascending: true })
      .order("stage_number", { ascending: true });

    if (error) {
      console.error("Error fetching stages:", error);
      throw error;
    }

    return data || [];
  },

  async create(stage: Omit<Stage, "id" | "created_at">): Promise<Stage> {
    const { data, error } = await supabase
      .from("stages")
      .insert(stage)
      .select()
      .single();

    if (error) {
      console.error("Error creating stage:", error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: Partial<Stage>): Promise<Stage> {
    const { data, error } = await supabase
      .from("stages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating stage:", error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("stages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting stage:", error);
      throw error;
    }
  }
};
