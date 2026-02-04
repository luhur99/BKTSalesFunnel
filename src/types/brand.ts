/**
 * Brand & Funnel Type Definitions
 * 
 * Represents brands (products/businesses) and their associated funnels
 */

export interface Brand {
  id: string;
  user_id?: string; // Nullable for system brands
  name: string;
  description?: string;
  color: string; // Hex color for brand identity
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields (from joins/aggregations)
  funnel_count?: number;
  lead_count?: number;
  conversion_rate?: number;
  total_revenue?: number;
}

export interface Funnel {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  total_leads_count: number;
  conversion_rate?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  brand?: Brand;
  
  // Computed fields
  followup_count?: number;
  broadcast_count?: number;
  won_count?: number;
  lost_count?: number;
  avg_close_time?: number; // in days
}

export interface CreateBrandInput {
  name: string;
  description?: string;
  color?: string;
  logo_url?: string;
}

export interface UpdateBrandInput {
  name?: string;
  description?: string;
  color?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface CreateFunnelInput {
  brand_id: string;
  name: string;
  description?: string;
}

export interface UpdateFunnelInput {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface BrandStats {
  brand_id: string;
  brand_name: string;
  total_leads: number;
  followup_leads: number;
  broadcast_leads: number;
  won_leads: number;
  lost_leads: number;
  conversion_rate: number;
  total_funnels: number;
  active_funnels: number;
  last_activity?: string;
}

export interface FunnelStats {
  funnel_id: string;
  funnel_name: string;
  brand_id: string;
  total_leads: number;
  followup_count: number;
  broadcast_count: number;
  won_count: number;
  lost_count: number;
  conversion_rate: number;
  avg_time_to_close?: number;
  stage_distribution: {
    stage_name: string;
    stage_type: 'follow_up' | 'broadcast';
    lead_count: number;
  }[];
}