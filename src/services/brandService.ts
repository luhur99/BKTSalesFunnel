/**
 * Brand Service
 * 
 * Handles all CRUD operations for brands and funnels
 */

import { supabase } from "@/integrations/supabase/client";
import type { 
  Brand, 
  Funnel, 
  CreateBrandInput, 
  UpdateBrandInput,
  CreateFunnelInput,
  UpdateFunnelInput,
  BrandStats,
  FunnelStats
} from "@/types/brand";

// ============================================================================
// BRAND OPERATIONS
// ============================================================================

/**
 * Get all brands for current user (or all if no auth)
 */
export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select(`
      *,
      funnels(count)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Transform to include funnel_count
  return (data || []).map(brand => ({
    ...brand,
    funnel_count: brand.funnels?.[0]?.count || 0,
  })) as Brand[];
}

/**
 * Get single brand by ID
 */
export async function getBrandById(brandId: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single();

  if (error) throw error;
  return data as Brand;
}

/**
 * Create new brand
 */
export async function createBrand(input: CreateBrandInput): Promise<Brand> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("brands")
    .insert({
      user_id: user?.id || null,
      name: input.name,
      description: input.description,
      color: input.color || "#0055b6",
      logo_url: input.logo_url,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

/**
 * Update existing brand
 */
export async function updateBrand(
  brandId: string, 
  input: UpdateBrandInput
): Promise<Brand> {
  const { data, error } = await supabase
    .from("brands")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", brandId)
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

/**
 * Delete brand (soft delete by setting is_active = false)
 */
export async function deleteBrand(brandId: string): Promise<void> {
  const { error } = await supabase
    .from("brands")
    .update({ is_active: false })
    .eq("id", brandId);

  if (error) throw error;
}

/**
 * Hard delete brand (WARNING: This will cascade delete all related data)
 */
export async function hardDeleteBrand(brandId: string): Promise<void> {
  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", brandId);

  if (error) throw error;
}

/**
 * Get brand statistics with lead counts
 */
export async function getBrandStats(brandId?: string): Promise<BrandStats[]> {
  let query = supabase
    .from("brands")
    .select(`
      id,
      name,
      leads(
        id,
        current_funnel,
        current_stage_id
      ),
      funnels(
        id,
        is_active
      )
    `)
    .eq("is_active", true);

  if (brandId) {
    query = query.eq("id", brandId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Get stages to determine won/lost
  const { data: stages } = await supabase
    .from("stages")
    .select("id, stage_name");

  const wonStageIds = (stages || [])
    .filter(s => s.stage_name.toLowerCase().includes("won"))
    .map(s => s.id);
  
  const lostStageIds = (stages || [])
    .filter(s => s.stage_name.toLowerCase().includes("lost") || s.stage_name.toLowerCase().includes("tidak"))
    .map(s => s.id);

  return (data || []).map(brand => {
    const leads = brand.leads || [];
    const followup = leads.filter(l => l.current_funnel === "follow_up");
    const broadcast = leads.filter(l => l.current_funnel === "broadcast");
    const won = leads.filter(l => wonStageIds.includes(l.current_stage_id));
    const lost = leads.filter(l => lostStageIds.includes(l.current_stage_id));
    
    const conversionRate = leads.length > 0 
      ? (won.length / leads.length) * 100 
      : 0;

    return {
      brand_id: brand.id,
      brand_name: brand.name,
      total_leads: leads.length,
      followup_leads: followup.length,
      broadcast_leads: broadcast.length,
      won_leads: won.length,
      lost_leads: lost.length,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      total_funnels: brand.funnels?.length || 0,
      active_funnels: brand.funnels?.filter(f => f.is_active).length || 0,
    };
  }) as BrandStats[];
}

// ============================================================================
// FUNNEL OPERATIONS
// ============================================================================

/**
 * Get all funnels for a brand
 */
export async function getFunnelsByBrand(brandId: string): Promise<Funnel[]> {
  const { data, error } = await supabase
    .from("funnels")
    .select("*")
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Funnel[];
}

/**
 * Get single funnel by ID
 */
export async function getFunnelById(funnelId: string): Promise<Funnel | null> {
  const { data, error } = await supabase
    .from("funnels")
    .select(`
      *,
      brand:brands(*)
    `)
    .eq("id", funnelId)
    .single();

  if (error) throw error;
  return data as Funnel;
}

/**
 * Create new funnel
 */
export async function createFunnel(input: CreateFunnelInput): Promise<Funnel> {
  const { data, error } = await supabase
    .from("funnels")
    .insert({
      brand_id: input.brand_id,
      name: input.name,
      description: input.description,
      is_default: input.is_default || false,
      is_active: true,
      total_leads_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Funnel;
}

/**
 * Update existing funnel
 */
export async function updateFunnel(
  funnelId: string,
  input: UpdateFunnelInput
): Promise<Funnel> {
  const { data, error } = await supabase
    .from("funnels")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", funnelId)
    .select()
    .single();

  if (error) throw error;
  return data as Funnel;
}

/**
 * Set funnel as default (and unset others in same brand)
 */
export async function setDefaultFunnel(funnelId: string): Promise<void> {
  // First get the funnel to know its brand_id
  const { data: funnel, error: fetchError } = await supabase
    .from("funnels")
    .select("brand_id")
    .eq("id", funnelId)
    .single();

  if (fetchError) throw fetchError;

  // Unset all other funnels in same brand
  const { error: unsetError } = await supabase
    .from("funnels")
    .update({ is_default: false })
    .eq("brand_id", funnel.brand_id);

  if (unsetError) throw unsetError;

  // Set this funnel as default
  const { error: setError } = await supabase
    .from("funnels")
    .update({ is_default: true })
    .eq("id", funnelId);

  if (setError) throw setError;
}

/**
 * Delete funnel (soft delete)
 */
export async function deleteFunnel(funnelId: string): Promise<void> {
  const { error } = await supabase
    .from("funnels")
    .update({ is_active: false })
    .eq("id", funnelId);

  if (error) throw error;
}

/**
 * Get funnel statistics with lead distribution
 */
export async function getFunnelStats(funnelId: string): Promise<FunnelStats | null> {
  const { data: funnel, error: funnelError } = await supabase
    .from("funnels")
    .select(`
      id,
      name,
      brand_id,
      leads(
        id,
        current_funnel,
        current_stage_id,
        created_at
      )
    `)
    .eq("id", funnelId)
    .single();

  if (funnelError) throw funnelError;

  // Get stages with names
  const { data: stages } = await supabase
    .from("stages")
    .select("id, stage_name, funnel_type");

  const stageMap = new Map(stages?.map(s => [s.id, s]) || []);
  
  const wonStageIds = (stages || [])
    .filter(s => s.stage_name.toLowerCase().includes("won"))
    .map(s => s.id);
  
  const lostStageIds = (stages || [])
    .filter(s => s.stage_name.toLowerCase().includes("lost") || s.stage_name.toLowerCase().includes("tidak"))
    .map(s => s.id);

  const leads = funnel.leads || [];
  const followup = leads.filter(l => l.current_funnel === "follow_up");
  const broadcast = leads.filter(l => l.current_funnel === "broadcast");
  const won = leads.filter(l => wonStageIds.includes(l.current_stage_id));
  const lost = leads.filter(l => lostStageIds.includes(l.current_stage_id));
  
  const conversionRate = leads.length > 0 
    ? (won.length / leads.length) * 100 
    : 0;

  // Calculate stage distribution
  const stageDistribution: { [key: string]: { stage_name: string; stage_type: 'follow_up' | 'broadcast'; count: number } } = {};
  
  leads.forEach(lead => {
    const stage = stageMap.get(lead.current_stage_id);
    if (stage) {
      const key = lead.current_stage_id;
      if (!stageDistribution[key]) {
        stageDistribution[key] = {
          stage_name: stage.stage_name,
          stage_type: stage.funnel_type as 'follow_up' | 'broadcast',
          count: 0,
        };
      }
      stageDistribution[key].count++;
    }
  });

  return {
    funnel_id: funnel.id,
    funnel_name: funnel.name,
    brand_id: funnel.brand_id,
    total_leads: leads.length,
    followup_count: followup.length,
    broadcast_count: broadcast.length,
    won_count: won.length,
    lost_count: lost.length,
    conversion_rate: Math.round(conversionRate * 100) / 100,
    stage_distribution: Object.values(stageDistribution).map(d => ({
      stage_name: d.stage_name,
      stage_type: d.stage_type,
      lead_count: d.count,
    })),
  };
}