import { supabase, isConnected } from "./client";

export const customLabels = {
  getAll: async () => {
    if (!isConnected) {
      const stored = localStorage.getItem("customLabels");
      if (stored) {
        return JSON.parse(stored);
      }
      return [
        { id: "1", name: "VIP", color: "purple", icon: "star", funnel_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "2", name: "Hot Lead", color: "red", icon: "zap", funnel_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "3", name: "Follow Up Urgent", color: "orange", icon: "flag", funnel_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
    }
    const { data, error } = await supabase
      .from("custom_labels")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getByFunnel: async (funnelId: string) => {
    if (!isConnected) {
      const stored = localStorage.getItem("customLabels");
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    }
    const { data, error } = await supabase
      .from("custom_labels")
      .select("*")
      .or(`funnel_id.is.null,funnel_id.eq.${funnelId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (labelData: { name: string; color: string; icon: string; funnel_id?: string | null }) => {
    if (!isConnected) {
      const stored = localStorage.getItem("customLabels");
      const labels = stored ? JSON.parse(stored) : [];
      const newLabel = {
        id: Date.now().toString(),
        ...labelData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      labels.push(newLabel);
      localStorage.setItem("customLabels", JSON.stringify(labels));
      return newLabel;
    }
    const { data, error } = await supabase
      .from("custom_labels")
      .insert([labelData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (labelId: string, labelData: { name?: string; color?: string; icon?: string; funnel_id?: string | null }) => {
    if (!isConnected) {
      const stored = localStorage.getItem("customLabels");
      if (stored) {
        const labels = JSON.parse(stored);
        const index = labels.findIndex((l: any) => l.id === labelId);
        if (index !== -1) {
          labels[index] = { ...labels[index], ...labelData, updated_at: new Date().toISOString() };
          localStorage.setItem("customLabels", JSON.stringify(labels));
          return labels[index];
        }
      }
      return null;
    }
    const { data, error } = await supabase
      .from("custom_labels")
      .update({ ...labelData, updated_at: new Date().toISOString() })
      .eq("id", labelId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (labelId: string) => {
    if (!isConnected) {
      const stored = localStorage.getItem("customLabels");
      if (stored) {
        const labels = JSON.parse(stored);
        const filtered = labels.filter((l: any) => l.id !== labelId);
        localStorage.setItem("customLabels", JSON.stringify(filtered));
      }
      return;
    }
    const { error } = await supabase
      .from("custom_labels")
      .delete()
      .eq("id", labelId);
    if (error) throw error;
  }
};
