import { supabase, isConnected } from "./client";

export const brands = {
  getAll: async () => {
    if (!isConnected) {
      return [
        {
          id: "brand-1",
          user_id: null,
          name: "Powerdash",
          description: "Dashcam Camera AI",
          color: "#0055b6",
          logo_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          funnel_count: 1,
          lead_count: 242
        }
      ];
    }
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (brandId: string) => {
    if (!isConnected) return null;
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", brandId)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (brandData: { name: string; description?: string; color?: string; logo_url?: string }) => {
    if (!isConnected) {
      const newBrand = {
        id: `brand-${Date.now()}`,
        user_id: null,
        ...brandData,
        color: brandData.color || "#0055b6",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newBrand;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("brands")
      .insert({
        user_id: user?.id || null,
        name: brandData.name,
        description: brandData.description,
        color: brandData.color || "#0055b6",
        logo_url: brandData.logo_url,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (brandId: string, brandData: { name?: string; description?: string; color?: string; logo_url?: string; is_active?: boolean }) => {
    if (!isConnected) return null;
    const { data, error } = await supabase
      .from("brands")
      .update({
        ...brandData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (brandId: string) => {
    if (!isConnected) return;
    const { error } = await supabase
      .from("brands")
      .update({ is_active: false })
      .eq("id", brandId);
    if (error) throw error;
  }
};
