export type FunnelType = "follow_up" | "broadcast";
export type LeadStatus = "active" | "deal" | "lost";
export type ActivityType = "call" | "email" | "whatsapp" | "meeting" | "note";

export interface LeadSource {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  funnel_type: FunnelType;
  stage_number: number;
  stage_name: string;
  description: string;
  created_at: string;
}

export interface StageScript {
  id: string;
  stage_id: string;
  script_text: string;
  media_links: string[];
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string | null; // Name is now optional
  email: string | null;
  phone: string; // Phone is now mandatory
  company: string | null;
  source_id: string;
  current_stage_id: string;
  current_funnel: FunnelType;
  status: "active" | "deal" | "lost";
  last_response_date: string | null;
  last_response_note: string | null;
  custom_labels: string[];
  deal_value?: number | null;
  
  // New fields for multi-brand
  brand_id: string;
  funnel_id?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations (optional/loaded)
  source?: LeadSource;
  current_stage?: Stage;
}

export interface LeadStageHistory {
  id: string;
  lead_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  from_funnel: FunnelType | null;
  to_funnel: FunnelType;
  reason: string;
  notes: string | null;
  moved_by: string;
  moved_at: string;
  from_stage?: Stage;
  to_stage?: Stage;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  description: string;
  response_received: boolean;
  created_by: string;
  created_at: string;
}

export interface BottleneckAnalytics {
  stage_id: string;
  stage_name: string;
  funnel_type: FunnelType;
  stage_number: number;
  leads_entered: number;
  leads_progressed: number;
  leads_stuck: number;
  conversion_rate: number;
  avg_time_in_stage: number;
}

export interface DashboardMetrics {
  total_leads: number;
  active_leads: number;
  deals_closed: number;
  lost_leads: number;
  follow_up_leads: number;
  broadcast_leads: number;
  conversion_rate: number;
  total_deal_value: number;
}