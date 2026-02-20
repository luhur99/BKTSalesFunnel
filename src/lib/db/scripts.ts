import { supabase, isConnected } from "./client";
import { MOCK_SCRIPTS } from "./mock-data";

export const scripts = {
  getAll: async () => {
    if (!isConnected) return MOCK_SCRIPTS;
    const { data, error } = await supabase.from("stage_scripts").select("*");
    if (error) throw error;
    return data;
  },

  getByStage: async (stageId: string) => {
    if (!isConnected) {
      return MOCK_SCRIPTS.find(s => s.stage_id === stageId) || null;
    }
    const { data, error } = await supabase
      .from("stage_scripts")
      .select("*")
      .eq("stage_id", stageId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching script for stage:", error);
      return null;
    }

    return data;
  },

  create: async (scriptData: { stage_id: string; script_text: string; media_links?: string[]; image_url?: string | null; video_url?: string | null }) => {
    if (!isConnected) {
      const newScript = {
        id: `script-${Date.now()}`,
        stage_id: scriptData.stage_id,
        script_text: scriptData.script_text,
        media_links: scriptData.media_links || [],
        image_url: scriptData.image_url || null,
        video_url: scriptData.video_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      MOCK_SCRIPTS.push(newScript);
      return newScript;
    }
    const { data, error } = await supabase
      .from("stage_scripts")
      .insert([scriptData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (scriptId: string, scriptData: { script_text?: string; media_links?: string[]; image_url?: string | null; video_url?: string | null }) => {
    if (!isConnected) {
      const index = MOCK_SCRIPTS.findIndex(s => s.id === scriptId);
      if (index !== -1) {
        MOCK_SCRIPTS[index] = { ...MOCK_SCRIPTS[index], ...scriptData, updated_at: new Date().toISOString() };
        return MOCK_SCRIPTS[index];
      }
      return null;
    }
    const { data, error } = await supabase
      .from("stage_scripts")
      .update(scriptData)
      .eq("id", scriptId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (scriptId: string) => {
    if (!isConnected) {
      const index = MOCK_SCRIPTS.findIndex(s => s.id === scriptId);
      if (index !== -1) {
        MOCK_SCRIPTS.splice(index, 1);
      }
      return;
    }
    const { error } = await supabase.from("stage_scripts").delete().eq("id", scriptId);
    if (error) throw error;
  }
};
