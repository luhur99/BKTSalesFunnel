import { supabase, isConnected, log } from "./client";

export const autoLostLeads = {
  getStats: async () => {
    if (!isConnected) {
      return {
        total_leads: 0,
        auto_lost_leads: 0,
        auto_lost_percentage: 0,
        auto_lost_reasons: [],
      };
    }

    const { data: leads } = await supabase
      .from("leads")
      .select(`
        id,
        status,
        current_funnel,
        updated_at,
        current_stage_id
      `);

    if (!leads) {
      return {
        total_leads: 0,
        auto_lost_leads: 0,
        auto_lost_percentage: 0,
        auto_lost_reasons: [],
      };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMovements } = await supabase
      .from("lead_stage_history")
      .select("lead_id")
      .gte("moved_at", sevenDaysAgo.toISOString());

    const recentlyMovedLeadIds = new Set(recentMovements?.map(m => m.lead_id) || []);

    const total = leads.length;
    const activeLeads = leads.filter(l => l.status === "active");
    const deal = leads.filter(l => l.status === "deal").length;
    const progressing = activeLeads.filter(l => recentlyMovedLeadIds.has(l.id)).length;
    const stuck = activeLeads.filter(l => !recentlyMovedLeadIds.has(l.id)).length;

    return {
      total_leads: total,
      active_leads: activeLeads.length,
      leads_progressing: progressing,
      leads_stuck: stuck,
      deals_closed: deal,
      lost_leads: leads.filter(l => l.status === "lost").length,
      follow_up_leads: leads.filter(l => l.current_funnel === "follow_up" && l.status === "active").length,
      broadcast_leads: leads.filter(l => l.current_funnel === "broadcast" && l.status === "active").length,
      conversion_rate: total > 0 ? (deal / total) * 100 : 0,
      total_deal_value: 0
    };
  },

  getAutoLostLeads: async () => {
    if (!isConnected) {
      return [];
    }

    const { data: leads } = await supabase
      .from("leads")
      .select(`
        id,
        status,
        current_funnel,
        updated_at,
        current_stage_id
      `);

    if (!leads) {
      return [];
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMovements } = await supabase
      .from("lead_stage_history")
      .select("lead_id")
      .gte("moved_at", sevenDaysAgo.toISOString());

    const recentlyMovedLeadIds = new Set(recentMovements?.map(m => m.lead_id) || []);

    const total = leads.length;
    const activeLeads = leads.filter(l => l.status === "active");
    const deal = leads.filter(l => l.status === "deal").length;
    const progressing = activeLeads.filter(l => recentlyMovedLeadIds.has(l.id)).length;
    const stuck = activeLeads.filter(l => !recentlyMovedLeadIds.has(l.id)).length;

    return {
      total_leads: total,
      active_leads: activeLeads.length,
      leads_progressing: progressing,
      leads_stuck: stuck,
      deals_closed: deal,
      lost_leads: leads.filter(l => l.status === "lost").length,
      follow_up_leads: leads.filter(l => l.current_funnel === "follow_up" && l.status === "active").length,
      broadcast_leads: leads.filter(l => l.current_funnel === "broadcast" && l.status === "active").length,
      conversion_rate: total > 0 ? (deal / total) * 100 : 0,
      total_deal_value: 0
    };
  },

  getAutoLostLeadsByReason: async () => {
    if (!isConnected) {
      return [];
    }

    await supabase
      .from("leads")
      .select(`
        id,
        status,
        current_funnel,
        updated_at,
        current_stage_id
      `);

    return [];
  }
};
