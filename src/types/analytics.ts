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
  leads_entered: number;
  leads_progressed: number;
  leads_dropped: number;
  drop_rate: number;
  conversion_rate: number;
}

// Funnel Performance Comparison
export interface FunnelPerformanceComparison {
  funnelId: string;
  funnelName: string;
  totalLeads: number;
  wonDeals: number;
  lostDeals: number;
  conversionRate: number;
  avgCloseTime: number;
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