import { supabase, isConnected } from "./client";

export const funnels = {
  getByBrand: async (brandId: string) => {
    if (!isConnected) {
      return [
        {
          id: "funnel-1",
          brand_id: brandId,
          name: "Main Funnel",
          description: "Default funnel for Powerdash leads",
          is_active: true,
          is_default: true,
          total_leads_count: 242,
          conversion_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    const { data, error } = await supabase
      .from("funnels")
      .select("*")
      .eq("brand_id", brandId)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (funnelId: string) => {
    if (!isConnected) return null;
    const { data, error } = await supabase
      .from("funnels")
      .select(`
        *,
        brand:brands(*)
      `)
      .eq("id", funnelId)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (funnelData: { brand_id: string; name: string; description?: string; is_default?: boolean }) => {
    if (!isConnected) {
      const newFunnel = {
        id: `funnel-${Date.now()}`,
        ...funnelData,
        is_active: true,
        is_default: funnelData.is_default || false,
        total_leads_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newFunnel;
    }
    const { data, error } = await supabase
      .from("funnels")
      .insert({
        brand_id: funnelData.brand_id,
        name: funnelData.name,
        description: funnelData.description,
        is_default: funnelData.is_default || false,
        is_active: true,
        total_leads_count: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (funnelId: string, funnelData: { name?: string; description?: string; is_active?: boolean; is_default?: boolean }) => {
    if (!isConnected) return null;
    const { data, error } = await supabase
      .from("funnels")
      .update({
        ...funnelData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", funnelId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  setDefault: async (funnelId: string) => {
    if (!isConnected) return;

    const { data: funnel, error: fetchError } = await supabase
      .from("funnels")
      .select("brand_id")
      .eq("id", funnelId)
      .single();

    if (fetchError) throw fetchError;

    const { error: unsetError } = await supabase
      .from("funnels")
      .update({ is_default: false })
      .eq("brand_id", funnel.brand_id);

    if (unsetError) throw unsetError;

    const { error: setError } = await supabase
      .from("funnels")
      .update({ is_default: true })
      .eq("id", funnelId);

    if (setError) throw setError;
  },

  delete: async (funnelId: string) => {
    if (!isConnected) return;
    const { error } = await supabase
      .from("funnels")
      .update({ is_active: false })
      .eq("id", funnelId);
    if (error) throw error;
  }
};
