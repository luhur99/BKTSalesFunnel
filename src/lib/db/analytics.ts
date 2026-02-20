import { supabase, isConnected, log } from "./client";
import { MOCK_FOLLOW_UP_STAGES, MOCK_BROADCAST_STAGES } from "./mock-data";
import { BottleneckAnalytics } from "@/types/lead";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, FunnelFlowStep, FunnelDualFlowData } from "@/types/analytics";

export const analytics = {
  getBottlenecks: async () => {
    return analytics.getBottleneckAnalytics();
  },

  getBottleneckAnalytics: async (): Promise<BottleneckAnalytics[]> => {
    if (!isConnected) {
      return [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].map(stage => ({
        stage_id: stage.id,
        stage_name: stage.stage_name,
        stage_number: stage.stage_number,
        funnel_type: stage.funnel_type,
        leads_entered: Math.floor(Math.random() * 50) + 10,
        leads_progressed: Math.floor(Math.random() * 20),
        leads_stuck: Math.floor(Math.random() * 10),
        conversion_rate: Math.random() * 100,
        avg_time_in_stage: 24
      }));
    }
    const { data, error } = await supabase.rpc("get_bottleneck_analytics");
    if (error) throw error;
    return data;
  },

  getDailyStageMovements: async (startDate?: Date, endDate?: Date) => {
    if (!isConnected) {
      const mockMovements = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockMovements.push({
          movement_date: date.toISOString().split('T')[0],
          from_stage_name: "FU 1",
          to_stage_name: "FU 2",
          from_funnel: "follow_up",
          to_funnel: "follow_up",
          is_funnel_switch: false,
          total_movements: Math.floor(Math.random() * 15) + 5,
          movement_reasons: { progression: Math.floor(Math.random() * 10) + 5 }
        });
      }
      return mockMovements;
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const { data, error } = await supabase.rpc("get_daily_stage_movements", {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    });

    if (error) throw error;
    return data;
  },

  getLeadJourneyAnalytics: async (leadId: string) => {
    if (!isConnected) {
      return {
        lead_id: leadId,
        lead_name: "Mock Lead",
        total_journey_days: "5.5",
        current_status: "active",
        current_funnel: "follow_up",
        current_stage_name: "FU 2",
        stages_history: [
          {
            stage_name: "FU 1",
            stage_number: 1,
            funnel_type: "follow_up",
            entered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            exited_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            days_in_stage: 2,
            reason: "progression",
            notes: "Lead responded positively"
          },
          {
            stage_name: "FU 2",
            stage_number: 2,
            funnel_type: "follow_up",
            entered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            exited_at: null,
            days_in_stage: 3.5,
            reason: null,
            notes: null
          }
        ]
      };
    }

    const { data, error } = await supabase.rpc("get_lead_journey_analytics", {
      p_lead_id: leadId
    });

    if (error) throw error;
    return data;
  },

  getFunnelJourneySummary: async (funnelId: string) => {
    if (!isConnected) {
      return {
        funnel_id: funnelId,
        funnel_name: "Mock Funnel",
        total_leads: 120,
        active_leads: 70,
        won_count: 30,
        lost_count: 20,
        conversion_rate: 25,
        followup_active: 50,
        broadcast_active: 20,
        switches_to_broadcast: 18,
        switches_to_followup: 9,
        avg_journey_days: 12.4
      };
    }

    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("id, status, created_at, current_funnel")
      .eq("funnel_id", funnelId);

    if (leadsError) {
      console.error("Error fetching leads for funnel summary:", leadsError);
      return null;
    }

    const { data: history, error: historyError } = await supabase
      .from("lead_stage_history")
      .select("from_funnel, to_funnel, lead:leads!inner(funnel_id)")
      .eq("lead.funnel_id", funnelId);

    if (historyError) {
      console.error("Error fetching stage history for funnel summary:", historyError);
      return null;
    }

    const totalLeads = leadsData?.length || 0;
    const wonCount = (leadsData || []).filter(l => l.status === "deal").length;
    const lostCount = (leadsData || []).filter(l => l.status === "lost").length;
    const activeLeads = (leadsData || []).filter(l => l.status === "active").length;
    const followupActive = (leadsData || []).filter(l => l.current_funnel === "follow_up").length;
    const broadcastActive = (leadsData || []).filter(l => l.current_funnel === "broadcast").length;

    const switchesToBroadcast = (history || []).filter(h => h.from_funnel === "follow_up" && h.to_funnel === "broadcast").length;
    const switchesToFollowup = (history || []).filter(h => h.from_funnel === "broadcast" && h.to_funnel === "follow_up").length;

    const now = Date.now();
    const totalDays = (leadsData || []).reduce((sum, lead) => {
      if (!lead.created_at) return sum;
      const diffMs = now - new Date(lead.created_at).getTime();
      return sum + diffMs / (1000 * 60 * 60 * 24);
    }, 0);

    const avgJourneyDays = totalLeads > 0 ? totalDays / totalLeads : 0;

    return {
      funnel_id: funnelId,
      funnel_name: "",
      total_leads: totalLeads,
      active_leads: activeLeads,
      won_count: wonCount,
      lost_count: lostCount,
      conversion_rate: totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0,
      followup_active: followupActive,
      broadcast_active: broadcastActive,
      switches_to_broadcast: switchesToBroadcast,
      switches_to_followup: switchesToFollowup,
      avg_journey_days: Math.round(avgJourneyDays * 100) / 100
    };
  },

  getFunnelLeakageStats: async (funnelId?: string): Promise<FunnelLeakageStats> => {
    if (!isConnected) {
      return {
        total_leads: 100,
        leaked_to_broadcast: 25,
        leakage_percentage: 25
      };
    }

    if (funnelId) {
      const { data: allLeads } = await supabase
        .from("leads")
        .select("id, current_funnel")
        .eq("funnel_id", funnelId);

      const total = allLeads?.length || 0;
      const leaked = allLeads?.filter(l => l.current_funnel === "broadcast").length || 0;

      return {
        total_leads: total,
        leaked_to_broadcast: leaked,
        leakage_percentage: total > 0 ? (leaked / total) * 100 : 0
      };
    }

    const { data, error } = await supabase.rpc("get_funnel_leakage_stats");
    if (error) {
      console.error("Error fetching funnel leakage stats:", error);
      return { total_leads: 0, leaked_to_broadcast: 0, leakage_percentage: 0 };
    }
    return data?.[0] || { total_leads: 0, leaked_to_broadcast: 0, leakage_percentage: 0 };
  },

  getStageVelocity: async (funnelId?: string): Promise<StageVelocity[]> => {
    if (!isConnected) {
      return [
        { stage_name_out: "FU 1", avg_hours: "24.5", total_leads_passed: 50 },
        { stage_name_out: "FU 2", avg_hours: "18.3", total_leads_passed: 45 },
        { stage_name_out: "BC 1", avg_hours: "36.7", total_leads_passed: 20 }
      ];
    }

    if (funnelId) {
      const { data, error } = await supabase
        .from("lead_stage_history")
        .select(`
          to_stage_id,
          moved_at,
          lead:leads!inner(funnel_id),
          to_stage:stages!to_stage_id(stage_name)
        `)
        .eq("lead.funnel_id", funnelId);

      if (error) {
        console.error("Error fetching stage velocity for funnel:", error);
        return [];
      }

      const stageGroups = new Map<string, { name: string; times: number[]; count: number }>();

      (data || []).forEach(history => {
        const stageData = history.to_stage as any;
        const stageName = Array.isArray(stageData)
          ? stageData[0]?.stage_name
          : stageData?.stage_name || "Unknown";

        if (!stageGroups.has(stageName)) {
          stageGroups.set(stageName, { name: stageName, times: [], count: 0 });
        }
        stageGroups.get(stageName)!.count++;
      });

      return Array.from(stageGroups.values()).map(group => ({
        stage_name_out: group.name,
        avg_hours: "24.0",
        total_leads_passed: group.count
      }));
    }

    const { data, error } = await supabase.rpc("get_avg_time_per_stage");
    if (error) {
      console.error("Error fetching stage velocity:", error);
      return [];
    }
    return (data || []).map((row: any) => ({
      ...row,
      avg_hours: row.avg_hours != null ? String(row.avg_hours) : "0",
    }));
  },

  getHeatmapAnalytics: async (targetType: "deal" | "all" = "all", funnelId?: string): Promise<HeatmapDataPoint[]> => {
    if (!isConnected) {
      const mockHeatmap: HeatmapDataPoint[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (const day of days) {
        for (let hour = 9; hour <= 17; hour++) {
          mockHeatmap.push({
            day_name: day,
            hour_of_day: hour,
            count: Math.floor(Math.random() * 20)
          });
        }
      }
      return mockHeatmap;
    }

    if (funnelId) {
      const { data, error } = await supabase
        .from("leads")
        .select("created_at")
        .eq("funnel_id", funnelId);

      if (error) {
        console.error("Error fetching heatmap for funnel:", error);
        return [];
      }

      const heatmapMap = new Map<string, number>();
      (data || []).forEach(lead => {
        const date = new Date(lead.created_at);
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
        const hour = date.getHours();
        const key = `${dayName}-${hour}`;
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
      });

      const result: HeatmapDataPoint[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (const day of days) {
        for (let hour = 0; hour < 24; hour++) {
          const key = `${day}-${hour}`;
          result.push({
            day_name: day,
            hour_of_day: hour,
            count: heatmapMap.get(key) || 0
          });
        }
      }
      return result;
    }

    const { data, error } = await supabase.rpc("get_heatmap_analytics", { target_type: targetType });
    if (error) {
      console.error("Error fetching heatmap analytics:", error);
      return [];
    }
    return data || [];
  },

  getBottleneckWarnings: async (funnelId?: string): Promise<BottleneckWarning[]> => {
    const velocityData = await analytics.getStageVelocity(funnelId);
    if (velocityData.length === 0) return [];

    const avgHours = velocityData.reduce((sum, stage) => sum + parseFloat(stage.avg_hours), 0) / velocityData.length;
    const threshold = avgHours * 1.5;

    return velocityData
      .filter(stage => parseFloat(stage.avg_hours) > threshold)
      .map(stage => {
        const hours = parseFloat(stage.avg_hours);
        let severity: "low" | "medium" | "high" = "low";
        if (hours > avgHours * 2) severity = "high";
        else if (hours > threshold) severity = "medium";

        return {
          stage_name: stage.stage_name_out,
          avg_hours: hours,
          severity,
          message: `Stage "${stage.stage_name_out}" is ${Math.round((hours / avgHours - 1) * 100)}% slower than average`,
          total_leads: Number(stage.total_leads_passed)
        };
      })
      .sort((a, b) => b.avg_hours - a.avg_hours);
  },

  getFunnelFlowData: async (funnelId?: string): Promise<FunnelFlowStep[]> => {
    return analytics.getFollowUpFunnelFlow(funnelId);
  },

  getFollowUpFunnelFlow: async (funnelId?: string): Promise<FunnelFlowStep[]> => {
    if (!isConnected) {
      return [
        { stage_id: "stage-fu-1", stage_name: "New Lead", stage_number: 1, leads_entered: 100, leads_progressed: 85, leads_dropped: 15, drop_rate: 15, conversion_rate: 85 },
        { stage_id: "stage-fu-2", stage_name: "Contacted", stage_number: 2, leads_entered: 85, leads_progressed: 68, leads_dropped: 17, drop_rate: 20, conversion_rate: 80 },
        { stage_id: "stage-fu-3", stage_name: "Interest", stage_number: 3, leads_entered: 68, leads_progressed: 54, leads_dropped: 14, drop_rate: 20.6, conversion_rate: 79.4 },
        { stage_id: "stage-fu-4", stage_name: "Negotiation", stage_number: 4, leads_entered: 54, leads_progressed: 43, leads_dropped: 11, drop_rate: 20.4, conversion_rate: 79.6 },
        { stage_id: "stage-fu-5", stage_name: "Closing", stage_number: 5, leads_entered: 43, leads_progressed: 35, leads_dropped: 8, drop_rate: 18.6, conversion_rate: 81.4 },
        { stage_id: "stage-fu-6", stage_name: "Follow Up 6", stage_number: 6, leads_entered: 35, leads_progressed: 28, leads_dropped: 7, drop_rate: 20, conversion_rate: 80 },
        { stage_id: "stage-fu-7", stage_name: "Follow Up 7", stage_number: 7, leads_entered: 28, leads_progressed: 23, leads_dropped: 5, drop_rate: 17.9, conversion_rate: 82.1 },
        { stage_id: "stage-fu-8", stage_name: "Follow Up 8", stage_number: 8, leads_entered: 23, leads_progressed: 19, leads_dropped: 4, drop_rate: 17.4, conversion_rate: 82.6 },
        { stage_id: "stage-fu-9", stage_name: "Follow Up 9", stage_number: 9, leads_entered: 19, leads_progressed: 16, leads_dropped: 3, drop_rate: 15.8, conversion_rate: 84.2 },
        { stage_id: "stage-fu-10", stage_name: "Follow Up 10", stage_number: 10, leads_entered: 16, leads_progressed: 14, leads_dropped: 2, drop_rate: 12.5, conversion_rate: 87.5 },
      ];
    }

    if (funnelId) {
      log("Funnel-specific flow not yet implemented, using global data");
    }

    const { data, error } = await supabase.rpc("get_follow_up_funnel_flow");
    if (error) {
      console.error("Error fetching follow-up funnel flow:", error);
      return [];
    }
    return (data || []).map(row => ({
      ...row,
      funnel_type: row.funnel_type as "follow_up" | "broadcast" | undefined,
    }));
  },

  getDualFlowByFunnel: async (funnelId: string): Promise<FunnelDualFlowData> => {
    const empty: FunnelDualFlowData = {
      funnelId,
      totalLeads: 0, wonCount: 0, lostCount: 0, activeLeads: 0,
      followupActive: 0, broadcastActive: 0,
      switchesToBroadcast: 0, switchesToFollowup: 0,
      followUpStages: [], broadcastStages: [],
    };

    if (!isConnected) {
      return {
        funnelId,
        totalLeads: 100,
        wonCount: 25,
        lostCount: 20,
        activeLeads: 55,
        followupActive: 40,
        broadcastActive: 15,
        switchesToBroadcast: 30,
        switchesToFollowup: 8,
        followUpStages: [
          { stage_id: "fu-1", stage_name: "FU 1", stage_number: 1, funnel_type: "follow_up", leads_entered: 100, leads_progressed: 82, leads_dropped: 18, drop_rate: 18, conversion_rate: 82, leads_switched_to_broadcast: 12 },
          { stage_id: "fu-2", stage_name: "FU 2", stage_number: 2, funnel_type: "follow_up", leads_entered: 82, leads_progressed: 68, leads_dropped: 14, drop_rate: 17.1, conversion_rate: 82.9, leads_switched_to_broadcast: 10 },
          { stage_id: "fu-3", stage_name: "FU 3", stage_number: 3, funnel_type: "follow_up", leads_entered: 68, leads_progressed: 55, leads_dropped: 13, drop_rate: 19.1, conversion_rate: 80.9, leads_switched_to_broadcast: 8 },
        ],
        broadcastStages: [
          { stage_id: "bc-1", stage_name: "BC 1", stage_number: 1, funnel_type: "broadcast", leads_entered: 30, leads_progressed: 22, leads_dropped: 8, drop_rate: 26.7, conversion_rate: 73.3, leads_returned_to_followup: 5 },
          { stage_id: "bc-2", stage_name: "BC 2", stage_number: 2, funnel_type: "broadcast", leads_entered: 22, leads_progressed: 18, leads_dropped: 4, drop_rate: 18.2, conversion_rate: 81.8, leads_returned_to_followup: 3 },
        ],
      };
    }

    // 1. Fetch leads in this funnel
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("id, current_stage_id, current_funnel, status")
      .eq("funnel_id", funnelId);

    if (leadsError || !leadsData?.length) return empty;

    const leadIds = leadsData.map(l => l.id);
    const totalLeads = leadsData.length;
    const wonCount = leadsData.filter(l => l.status === "deal").length;
    const lostCount = leadsData.filter(l => l.status === "lost").length;
    const activeLeads = leadsData.filter(l => l.status === "active").length;
    const followupActive = leadsData.filter(l => l.current_funnel === "follow_up").length;
    const broadcastActive = leadsData.filter(l => l.current_funnel === "broadcast").length;

    // 2. Fetch stage history
    const { data: history } = await supabase
      .from("lead_stage_history")
      .select("lead_id, from_stage_id, to_stage_id, from_funnel, to_funnel")
      .in("lead_id", leadIds);

    const hist = history ?? [];
    const switchesToBroadcast = hist.filter(h => h.from_funnel === "follow_up" && h.to_funnel === "broadcast").length;
    const switchesToFollowup = hist.filter(h => h.from_funnel === "broadcast" && h.to_funnel === "follow_up").length;

    // 3. Fetch stages
    const { data: stagesRaw } = await supabase
      .from("stages")
      .select("id, stage_name, stage_number, funnel_type, funnel_id")
      .or(`funnel_id.eq.${funnelId},funnel_id.is.null`)
      .order("funnel_type", { ascending: true })
      .order("stage_number", { ascending: true });

    if (!stagesRaw?.length) return { ...empty, totalLeads, wonCount, lostCount, activeLeads, followupActive, broadcastActive, switchesToBroadcast, switchesToFollowup };

    // Prefer funnel-specific stages over global
    const orderedStages: typeof stagesRaw = [];
    for (const type of ["follow_up", "broadcast"] as const) {
      const typeStages = stagesRaw.filter(s => s.funnel_type === type);
      const specific = typeStages.filter(s => s.funnel_id === funnelId);
      const global = typeStages.filter(s => !s.funnel_id);
      orderedStages.push(...(specific.length > 0 ? specific : global));
    }

    // 4. Compute per-stage flow using Sets
    const computedStages: FunnelFlowStep[] = orderedStages.map(stage => {
      const enteredSet = new Set<string>(hist.filter(h => h.to_stage_id === stage.id).map(h => h.lead_id as string));
      leadsData.filter(l => l.current_stage_id === stage.id).forEach(l => enteredSet.add(l.id));
      const progressedSet = new Set<string>(hist.filter(h => h.from_stage_id === stage.id).map(h => h.lead_id as string));
      const entered = enteredSet.size;
      const progressed = progressedSet.size;
      const dropped = entered - progressed;
      const isBroadcast = stage.funnel_type === "broadcast";
      // For broadcast stages: count leads pushed back to follow_up from this specific stage
      const leadsReturnedToFollowup = isBroadcast
        ? new Set<string>(hist.filter(h => h.from_stage_id === stage.id && h.to_funnel === "follow_up").map(h => h.lead_id as string)).size
        : undefined;
      // For follow_up stages: count leads that switched to broadcast from this specific stage
      const leadsSwitchedToBroadcast = !isBroadcast
        ? new Set<string>(hist.filter(h => h.from_stage_id === stage.id && h.to_funnel === "broadcast").map(h => h.lead_id as string)).size
        : undefined;
      return {
        stage_id: stage.id,
        stage_name: stage.stage_name,
        stage_number: stage.stage_number,
        funnel_type: stage.funnel_type as "follow_up" | "broadcast",
        leads_entered: entered,
        leads_progressed: progressed,
        leads_dropped: dropped,
        drop_rate: entered > 0 ? parseFloat(((dropped / entered) * 100).toFixed(1)) : 0,
        conversion_rate: entered > 0 ? parseFloat(((progressed / entered) * 100).toFixed(1)) : 0,
        ...(leadsReturnedToFollowup !== undefined && { leads_returned_to_followup: leadsReturnedToFollowup }),
        ...(leadsSwitchedToBroadcast !== undefined && { leads_switched_to_broadcast: leadsSwitchedToBroadcast }),
      };
    });

    return {
      funnelId,
      totalLeads, wonCount, lostCount, activeLeads,
      followupActive, broadcastActive,
      switchesToBroadcast, switchesToFollowup,
      followUpStages: computedStages.filter(s => s.funnel_type === "follow_up"),
      broadcastStages: computedStages.filter(s => s.funnel_type === "broadcast"),
    };
  },

  getFunnelPerformanceComparison: async (brandId: string) => {
    if (!isConnected) {
      return [
        {
          funnel_id: "funnel-1",
          funnel_name: "Main Funnel",
          total_leads: 242,
          won_count: 50,
          lost_count: 20,
          conversion_rate: 20.66,
          avg_close_time_days: 12.5
        }
      ];
    }

    const { data: funnelsData, error: funnelError } = await supabase
      .from("funnels")
      .select("id, name")
      .eq("brand_id", brandId)
      .eq("is_active", true);

    if (funnelError || !funnelsData) {
      console.error("Error fetching funnels:", funnelError);
      return [];
    }

    const funnelStats = await Promise.all(
      funnelsData.map(async (funnel) => {
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("id, status, created_at, current_stage_id")
          .eq("funnel_id", funnel.id);

        if (leadsError || !leadsData) return null;

        const { data: stagesData } = await supabase
          .from("stages")
          .select("id, stage_name");

        const wonStageIds = (stagesData || [])
          .filter(s => s.stage_name.toLowerCase().includes("won"))
          .map(s => s.id);

        const lostStageIds = (stagesData || [])
          .filter(s => s.stage_name.toLowerCase().includes("lost") || s.stage_name.toLowerCase().includes("tidak"))
          .map(s => s.id);

        const wonLeads = leadsData.filter(l => wonStageIds.includes(l.current_stage_id));
        const lostLeads = leadsData.filter(l => lostStageIds.includes(l.current_stage_id));

        let avgCloseTime = 0;
        if (wonLeads.length > 0) {
          const closeTimes = wonLeads.map(lead => {
            const created = new Date(lead.created_at);
            const now = new Date();
            return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          });
          avgCloseTime = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
        }

        return {
          funnel_id: funnel.id,
          funnel_name: funnel.name,
          total_leads: leadsData.length,
          won_count: wonLeads.length,
          lost_count: lostLeads.length,
          conversion_rate: leadsData.length > 0 ? (wonLeads.length / leadsData.length) * 100 : 0,
          avg_close_time_days: Math.round(avgCloseTime * 10) / 10
        };
      })
    );

    return funnelStats.filter(stat => stat !== null);
  },

  getAutoLostLeadsStats: async (funnelId?: string) => {
    if (!isConnected) {
      return [
        {
          funnelId: "funnel-1",
          funnelName: "Main Funnel",
          autoLostCount: 15,
          avgDaysInStage: 8.5
        }
      ];
    }

    try {
      let query = supabase
        .from("leads")
        .select(`
          id,
          funnel_id,
          status,
          created_at,
          updated_at,
          funnel:funnels(id, name)
        `)
        .eq("status", "lost");

      if (funnelId) {
        query = query.eq("funnel_id", funnelId);
      }

      const { data: lostLeads, error } = await query;

      if (error) {
        console.error("Error fetching lost leads:", error);
        return [];
      }

      if (!lostLeads || lostLeads.length === 0) {
        log("No lost leads found");
        return [];
      }

      log(`Found ${lostLeads.length} lost leads`);

      const leadIds = lostLeads.map(l => l.id);
      const { data: stageHistoryData, error: historyError } = await supabase
        .from("lead_stage_history")
        .select("lead_id, moved_at")
        .in("lead_id", leadIds)
        .order("moved_at", { ascending: false });

      if (historyError) {
        console.error("Error fetching stage history:", historyError);
      }

      const funnelStatsMap = new Map<string, {
        funnelId: string;
        funnelName: string;
        autoLostCount: number;
        totalDays: number
      }>();

      lostLeads.forEach(lead => {
        const funnelData = Array.isArray(lead.funnel) ? lead.funnel[0] : lead.funnel;
        const fId = lead.funnel_id || 'unknown';
        const fName = (funnelData as any)?.name || 'Unknown Funnel';

        if (!funnelStatsMap.has(fId)) {
          funnelStatsMap.set(fId, {
            funnelId: fId,
            funnelName: fName,
            autoLostCount: 0,
            totalDays: 0
          });
        }

        const stats = funnelStatsMap.get(fId)!;
        stats.autoLostCount++;

        const updatedDate = new Date(lead.updated_at);
        const daysSinceUpdate = (new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
        stats.totalDays += daysSinceUpdate;
      });

      const result = Array.from(funnelStatsMap.values()).map(stat => ({
        funnelId: stat.funnelId,
        funnelName: stat.funnelName,
        autoLostCount: stat.autoLostCount,
        avgDaysInStage: stat.autoLostCount > 0
          ? Math.round((stat.totalDays / stat.autoLostCount) * 10) / 10
          : 0
      }));

      log("Auto-lost stats calculated:", result);
      return result;

    } catch (error) {
      console.error("Error in getAutoLostLeadsStats:", error);
      return [];
    }
  },

  markStaleBroadcastLeadsAsLost: async () => {
    if (!isConnected) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: staleLeads, error } = await supabase
      .from("leads")
      .select("id")
      .eq("current_funnel", "broadcast")
      .neq("status", "lost")
      .lt("updated_at", sevenDaysAgo.toISOString());

    if (error || !staleLeads || staleLeads.length === 0) return [];

    const idsToUpdate = staleLeads.map(l => l.id);

    const { data, error: updateError } = await supabase
      .from("leads")
      .update({ status: 'lost', last_response_note: 'Auto-marked as lost due to inactivity in broadcast funnel' })
      .in("id", idsToUpdate)
      .select();

    if (updateError) {
      console.error("Error auto-marking lost leads:", updateError);
      return [];
    }

    return data || [];
  }
};
