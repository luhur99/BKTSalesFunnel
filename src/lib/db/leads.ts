import { supabase, isConnected, log } from "./client";
import { MOCK_LEADS, MOCK_SOURCES, MOCK_FOLLOW_UP_STAGES, MOCK_BROADCAST_STAGES, MOCK_STAGE_HISTORY } from "./mock-data";
import { Lead } from "@/types/lead";

export const leads = {
  getAll: async () => {
    if (!isConnected) {
      return MOCK_LEADS.map(lead => ({
        ...lead,
        source: MOCK_SOURCES.find(s => s.id === lead.source_id),
        current_stage: [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === lead.current_stage_id)
      }));
    }
    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        source:lead_sources(*),
        current_stage:stages(*)
      `)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getByFunnelId: async (funnelId: string) => {
    if (!isConnected) {
      const mockFiltered = MOCK_LEADS.filter(l => l.brand_id === 'brand-1');
      return mockFiltered.map(lead => ({
        ...lead,
        source: MOCK_SOURCES.find(s => s.id === lead.source_id),
        current_stage: [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === lead.current_stage_id)
      }));
    }

    log(`[db.leads.getByFunnelId] Fetching leads for funnel_id: ${funnelId}`);

    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        source:lead_sources(*),
        current_stage:stages(*)
      `)
      .eq("funnel_id", funnelId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(`[db.leads.getByFunnelId] Error fetching leads for funnel ${funnelId}:`, error);
      throw error;
    }

    log(`[db.leads.getByFunnelId] Found ${data?.length || 0} leads for funnel ${funnelId}.`);

    if (data) {
      const incorrectLeads = data.filter(lead => lead.funnel_id !== funnelId);
      if (incorrectLeads.length > 0) {
        console.warn(`[db.leads.getByFunnelId] WARNING: Query returned ${incorrectLeads.length} leads that do NOT match the requested funnelId '${funnelId}'.`);
        console.warn('[db.leads.getByFunnelId] Incorrect leads sample:', incorrectLeads.map(l => ({ id: l.id, funnel_id: l.funnel_id })));
      }
    }

    return data || [];
  },

  async getByBrandId(brandId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        brand:brands(*),
        funnel:funnels(*),
        current_stage:stages(*),
        lead_activities(*)
      `)
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads by brand:", error);
      throw error;
    }

    return (data || []) as Lead[];
  },

  create: async (leadData: any) => {
    if (!isConnected) {
      const newLead = { id: `lead-${Date.now()}`, ...leadData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      MOCK_LEADS.unshift(newLead);
      return newLead;
    }

    log("🔵 Supabase connected - attempting INSERT");
    log("📊 Lead data to insert:", leadData);

    if (!leadData.phone) {
      const error = new Error("Phone number is required");
      console.error("❌ VALIDATION ERROR:", error.message);
      throw error;
    }

    if (!leadData.source_id) {
      const error = new Error("Lead source is required");
      console.error("❌ VALIDATION ERROR:", error.message);
      throw error;
    }

    if (!leadData.current_stage_id) {
      const error = new Error("Current stage is required");
      console.error("❌ VALIDATION ERROR:", error.message);
      throw error;
    }

    log("✅ Validation passed, attempting Supabase INSERT...");
    log("🔑 Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    log("🔑 Anon key present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.from("leads").insert([leadData]).select().single();

    if (error) {
      console.error("❌ Supabase INSERT error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);

      const userMessage = `Failed to save lead: ${error.message}${error.hint ? `\n\nHint: ${error.hint}` : ''}${error.details ? `\n\nDetails: ${error.details}` : ''}`;
      const enhancedError = new Error(userMessage);
      (enhancedError as any).code = error.code;
      (enhancedError as any).details = error.details;
      (enhancedError as any).hint = error.hint;
      throw enhancedError;
    }

    log("✅ Lead inserted successfully:", data);
    return data;
  },

  update: async (leadId: string, leadData: any) => {
    if (!isConnected) {
      const index = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (index !== -1) {
        MOCK_LEADS[index] = { ...MOCK_LEADS[index], ...leadData, updated_at: new Date().toISOString() };
        return MOCK_LEADS[index];
      }
      return null;
    }
    const { data, error } = await supabase.from("leads").update(leadData).eq("id", leadId).select().single();
    if (error) throw error;
    return data;
  },

  delete: async (leadId: string) => {
    if (!isConnected) {
      const index = MOCK_LEADS.findIndex(l => l.id === leadId);
      if (index !== -1) {
        MOCK_LEADS.splice(index, 1);
      }
      return;
    }
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) throw error;
  },

  getStats: async () => {
    if (!isConnected) {
      const total = MOCK_LEADS.length;
      const active = MOCK_LEADS.filter(l => l.status === "active").length;
      const deal = MOCK_LEADS.filter(l => l.status === "deal").length;
      const lost = MOCK_LEADS.filter(l => l.status === "lost").length;
      const fu = MOCK_LEADS.filter(l => l.current_funnel === "follow_up" && l.status === "active").length;
      const bc = MOCK_LEADS.filter(l => l.current_funnel === "broadcast" && l.status === "active").length;

      return {
        total_leads: total,
        active_leads: active,
        leads_progressing: active,
        leads_stuck: 0,
        deals_closed: deal,
        lost_leads: lost,
        follow_up_leads: fu,
        broadcast_leads: bc,
        conversion_rate: total > 0 ? (deal / total) * 100 : 0,
        total_deal_value: 0
      };
    }

    const { data: leadsData } = await supabase
      .from("leads")
      .select(`
        id,
        status,
        current_funnel,
        updated_at,
        current_stage_id
      `);

    if (!leadsData) {
      return {
        total_leads: 0,
        active_leads: 0,
        leads_progressing: 0,
        leads_stuck: 0,
        deals_closed: 0,
        lost_leads: 0,
        follow_up_leads: 0,
        broadcast_leads: 0,
        conversion_rate: 0,
        total_deal_value: 0
      };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMovements } = await supabase
      .from("lead_stage_history")
      .select("lead_id")
      .gte("moved_at", sevenDaysAgo.toISOString());

    const recentlyMovedLeadIds = new Set(recentMovements?.map(m => m.lead_id) || []);

    const total = leadsData.length;
    const activeLeads = leadsData.filter(l => l.status === "active");
    const deal = leadsData.filter(l => l.status === "deal").length;
    const progressing = activeLeads.filter(l => recentlyMovedLeadIds.has(l.id)).length;
    const stuck = activeLeads.filter(l => !recentlyMovedLeadIds.has(l.id)).length;

    return {
      total_leads: total,
      active_leads: activeLeads.length,
      leads_progressing: progressing,
      leads_stuck: stuck,
      deals_closed: deal,
      lost_leads: leadsData.filter(l => l.status === "lost").length,
      follow_up_leads: leadsData.filter(l => l.current_funnel === "follow_up" && l.status === "active").length,
      broadcast_leads: leadsData.filter(l => l.current_funnel === "broadcast" && l.status === "active").length,
      conversion_rate: total > 0 ? (deal / total) * 100 : 0,
      total_deal_value: 0
    };
  },

  moveToStage: async (leadId: string, toStageId: string, reason: string, notes: string, userId: string) => {
    if (!isConnected) {
      const lead = MOCK_LEADS.find(l => l.id === leadId);
      const toStage = [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === toStageId);

      if (lead && toStage) {
        MOCK_STAGE_HISTORY.unshift({
          id: `hist-${Date.now()}`,
          lead_id: leadId,
          from_stage_id: lead.current_stage_id,
          to_stage_id: toStageId,
          from_funnel: lead.current_funnel,
          to_funnel: toStage.funnel_type,
          from_stage: [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === lead.current_stage_id),
          to_stage: toStage,
          reason,
          notes,
          moved_at: new Date().toISOString(),
          moved_by: userId
        });

        lead.current_stage_id = toStageId;
        lead.current_funnel = toStage.funnel_type;
        lead.updated_at = new Date().toISOString();
      }
      return;
    }

    try {
      log("🔵 SUPABASE - moveToStage started");
      log("📊 Lead ID:", leadId);
      log("📊 Target Stage ID:", toStageId);
      log("📊 Reason:", reason);
      log("📊 Notes:", notes);
      log("📊 User ID:", userId);

      log("🔍 STEP 1: Fetching current lead info...");
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("current_stage_id, current_funnel")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("❌ Error fetching lead:", leadError);
        throw new Error(`Failed to fetch lead: ${leadError.message}`);
      }

      if (!lead) {
        throw new Error("Lead not found");
      }

      log("✅ Current lead info:", lead);

      log("🔍 STEP 2: Fetching target stage info...");
      const { data: toStage, error: stageError } = await supabase
        .from("stages")
        .select("funnel_type, stage_number, stage_name")
        .eq("id", toStageId)
        .single();

      if (stageError) {
        console.error("❌ Error fetching stage:", stageError);
        throw new Error(`Failed to fetch target stage: ${stageError.message}`);
      }

      if (!toStage) {
        throw new Error("Target stage not found");
      }

      log("✅ Target stage info:", toStage);

      log("🔍 STEP 3: Verifying from_stage_id exists...");
      const { data: fromStage, error: fromStageError } = await supabase
        .from("stages")
        .select("id, stage_name")
        .eq("id", lead.current_stage_id)
        .single();

      if (fromStageError || !fromStage) {
        console.error("❌ Invalid from_stage_id:", lead.current_stage_id);
        throw new Error(`Current stage ID is invalid. Please refresh the page and try again.`);
      }

      log("✅ From stage verified:", fromStage);

      const movedAt = new Date().toISOString();
      log("🔍 STEP 4: Creating history record with timestamp:", movedAt);

      const historyPayload = {
        lead_id: leadId,
        from_stage_id: lead.current_stage_id,
        to_stage_id: toStageId,
        from_funnel: lead.current_funnel,
        to_funnel: toStage.funnel_type,
        reason: reason,
        notes: notes,
        moved_by: userId,
        moved_at: movedAt
      };

      log("📊 History payload:", historyPayload);

      const { data: historyData, error: historyError } = await supabase
        .from("lead_stage_history")
        .insert([historyPayload])
        .select();

      if (historyError) {
        console.error("❌ Error creating history:", historyError);
        console.error("❌ History error code:", historyError.code);
        console.error("❌ History error details:", historyError.details);
        console.error("❌ History error hint:", historyError.hint);

        if (historyError.code === "23503") {
          throw new Error("Database integrity error. Please refresh the page and try again.");
        }

        throw new Error(`Failed to create movement history: ${historyError.message}`);
      }

      log("✅ History record created:", historyData);

      log("🔍 STEP 5: Updating lead with new stage and funnel...");
      const { data: updatedLead, error: updateError } = await supabase
        .from("leads")
        .update({
          current_stage_id: toStageId,
          current_funnel: toStage.funnel_type,
          updated_at: movedAt
        })
        .eq("id", leadId)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating lead:", updateError);
        throw new Error(`Failed to update lead: ${updateError.message}`);
      }

      log("✅ Lead updated successfully:", updatedLead);
      log("🎉 moveToStage - Operation completed successfully!");

      const { data: completeLeadData, error: fetchError } = await supabase
        .from("leads")
        .select(`
          *,
          source:lead_sources(*),
          current_stage:stages(*)
        `)
        .eq("id", leadId)
        .single();

      if (fetchError) {
        console.error("⚠️ Warning: Could not fetch complete lead data:", fetchError);
        return updatedLead;
      }

      log("✅ Complete lead data fetched:", completeLeadData);
      log("🔍 Source data:", completeLeadData.source);
      log("🔍 Current stage data:", completeLeadData.current_stage);

      return completeLeadData;

    } catch (error) {
      console.error("❌ moveToStage - Fatal error:", error);
      throw error;
    }
  }
};
