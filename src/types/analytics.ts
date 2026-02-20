// Analytics Module Types
// Matches RPC function return types from Supabase

export interface FunnelLeakageStats {
  total_leads: number;
  leaked_to_broadcast: number;
  leakage_percentage: number;
}

export interface StageVelocity {
  stage_name_out: string;
  avg_hours: string; // PostgreSQL NUMERIC returns as string
  total_leads_passed: number;
}

export interface HeatmapDataPoint {
  day_name: string;
  hour_of_day: number;
  count: number;
}

export interface BottleneckWarning {
  stage_name: string;
  avg_hours: number;
  severity: "low" | "medium" | "high";
  message: string;
  total_leads: number;
}

export interface AnalyticsSummary {
  funnelLeakage: FunnelLeakageStats;
  stageVelocity: StageVelocity[];
  heatmapData: HeatmapDataPoint[];
  bottleneckWarnings: BottleneckWarning[];
}

export interface FunnelFlowStep {
  stage_id: string;
  stage_name: string;
  stage_number: number;
  funnel_type?: "follow_up" | "broadcast";
  leads_entered: number;
  leads_progressed: number;
  leads_dropped: number;
  drop_rate: number;
  conversion_rate: number;
  leads_returned_to_followup?: number;
  leads_switched_to_broadcast?: number;
}

export interface FunnelJourneySummary {
  funnel_id: string;
  funnel_name: string;
  total_leads: number;
  active_leads: number;
  won_count: number;
  lost_count: number;
  conversion_rate: number;
  followup_active: number;
  broadcast_active: number;
  switches_to_broadcast: number;
  switches_to_followup: number;
  avg_journey_days: number;
}

// Funnel Performance Comparison
export interface FunnelPerformanceComparison {
  funnel_id: string;
  funnel_name: string;
  total_leads: number;
  won_count: number;
  lost_count: number;
  conversion_rate: number;
  avg_close_time_days: number;
}

// Chart Data Types (for Recharts)
export interface VelocityChartData {
  stage: string;
  hours: number;
  leads: number;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  intensity: "low" | "medium" | "high" | "none";
}

export interface AutoLostLeadStats {
  funnelId: string;
  funnelName: string;
  autoLostCount: number;
  avgDaysInStage: number;
}

export interface FunnelDualFlowData {
  funnelId: string;
  totalLeads: number;
  wonCount: number;
  lostCount: number;
  activeLeads: number;
  followupActive: number;
  broadcastActive: number;
  switchesToBroadcast: number;
  switchesToFollowup: number;
  followUpStages: FunnelFlowStep[];
  broadcastStages: FunnelFlowStep[];
}