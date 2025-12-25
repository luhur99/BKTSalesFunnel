import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database helpers
export const db = {
  // Leads
  leads: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          source:lead_sources(*),
          current_stage:stages(*)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          source:lead_sources(*),
          current_stage:stages(*)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },

    getStats: async () => {
      const { data: leads } = await supabase.from("leads").select("*");
      
      if (!leads) return {
        total_leads: 0,
        active_leads: 0,
        deals_closed: 0,
        lost_leads: 0,
        follow_up_leads: 0,
        broadcast_leads: 0,
        conversion_rate: 0,
        total_deal_value: 0
      };

      const active = leads.filter(l => l.status === "active");
      const deals = leads.filter(l => l.status === "deal");
      const lost = leads.filter(l => l.status === "lost");
      
      return {
        total_leads: leads.length,
        active_leads: active.length,
        deals_closed: deals.length,
        lost_leads: lost.length,
        follow_up_leads: active.filter(l => l.current_funnel === "follow_up").length,
        broadcast_leads: active.filter(l => l.current_funnel === "broadcast").length,
        conversion_rate: leads.length > 0 ? (deals.length / leads.length) * 100 : 0,
        total_deal_value: deals.reduce((sum, l) => sum + (l.deal_value || 0), 0)
      };
    },

    getByFunnel: async (funnel: "follow_up" | "broadcast") => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          source:lead_sources(*),
          current_stage:stages(*)
        `)
        .eq("current_funnel", funnel)
        .eq("status", "active")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (lead: any) => {
      const { data, error } = await supabase
        .from("leads")
        .insert([lead])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    moveToStage: async (leadId: string, toStageId: string, reason: string, notes: string, movedBy: string) => {
      // Get current lead state
      const { data: lead } = await supabase
        .from("leads")
        .select("*, current_stage:stages(*)")
        .eq("id", leadId)
        .single();

      if (!lead) throw new Error("Lead not found");

      // Get target stage
      const { data: toStage } = await supabase
        .from("stages")
        .select("*")
        .eq("id", toStageId)
        .single();

      if (!toStage) throw new Error("Target stage not found");

      // Record history
      await supabase.from("lead_stage_history").insert([{
        lead_id: leadId,
        from_stage_id: lead.current_stage_id,
        to_stage_id: toStageId,
        from_funnel: lead.current_funnel,
        to_funnel: toStage.funnel_type,
        reason,
        notes,
        moved_by: movedBy
      }]);

      // Update lead
      const { data, error } = await supabase
        .from("leads")
        .update({
          current_stage_id: toStageId,
          current_funnel: toStage.funnel_type,
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Stages
  stages: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("funnel_type")
        .order("stage_number");
      
      if (error) throw error;
      return data;
    },

    getByFunnel: async (funnel: "follow_up" | "broadcast") => {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("funnel_type", funnel)
        .order("stage_number");
      
      if (error) throw error;
      return data;
    }
  },

  // Sources
  sources: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("lead_sources")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  },

  // Stage Scripts
  scripts: {
    getByStage: async (stageId: string) => {
      const { data, error } = await supabase
        .from("stage_scripts")
        .select("*")
        .eq("stage_id", stageId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },

    upsert: async (script: any) => {
      const { data, error } = await supabase
        .from("stage_scripts")
        .upsert([script])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Analytics
  analytics: {
    getDashboardMetrics: async () => {
      const { data: leads } = await supabase.from("leads").select("*");
      
      if (!leads) return {
        total_leads: 0,
        active_leads: 0,
        deals_closed: 0,
        lost_leads: 0,
        follow_up_leads: 0,
        broadcast_leads: 0,
        conversion_rate: 0,
        total_deal_value: 0
      };

      const active = leads.filter(l => l.status === "active");
      const deals = leads.filter(l => l.status === "deal");
      const lost = leads.filter(l => l.status === "lost");
      
      return {
        total_leads: leads.length,
        active_leads: active.length,
        deals_closed: deals.length,
        lost_leads: lost.length,
        follow_up_leads: active.filter(l => l.current_funnel === "follow_up").length,
        broadcast_leads: active.filter(l => l.current_funnel === "broadcast").length,
        conversion_rate: leads.length > 0 ? (deals.length / leads.length) * 100 : 0,
        total_deal_value: deals.reduce((sum, l) => sum + (l.deal_value || 0), 0)
      };
    },

    getBottleneckAnalytics: async () => {
      const { data: stages } = await supabase
        .from("stages")
        .select("*")
        .order("funnel_type")
        .order("stage_number");

      const { data: history } = await supabase
        .from("lead_stage_history")
        .select("*");

      if (!stages || !history) return [];

      return stages.map(stage => {
        const entered = history.filter(h => h.to_stage_id === stage.id).length;
        const progressed = history.filter(h => h.from_stage_id === stage.id).length;
        const stuck = entered - progressed;

        return {
          stage_id: stage.id,
          stage_name: stage.stage_name,
          funnel_type: stage.funnel_type,
          stage_number: stage.stage_number,
          leads_entered: entered,
          leads_progressed: progressed,
          leads_stuck: stuck,
          conversion_rate: entered > 0 ? (progressed / entered) * 100 : 0,
          avg_time_in_stage: 0 // Would need additional time calculations
        };
      });
    }
  },

  // Activities
  activities: {
    getByLead: async (leadId: string) => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (activity: any) => {
      const { data, error } = await supabase
        .from("lead_activities")
        .insert([activity])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};