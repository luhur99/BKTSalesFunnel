import { createClient } from "@supabase/supabase-js";
import { Lead, LeadSource, Stage, LeadActivity, LeadStageHistory, StageScript, BottleneckAnalytics, FunnelType } from "@/types/lead";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, FunnelFlowStep } from "@/types/analytics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isConnected = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-project-url";

// Mock Data
const MOCK_SOURCES: LeadSource[] = [
  { id: "source-1", name: "Facebook Ads", type: "social", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-2", name: "Instagram DM", type: "social", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-3", name: "Website Form", type: "website", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-4", name: "Whatsapp Direct", type: "direct", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const MOCK_FOLLOW_UP_STAGES: Stage[] = [
  { id: "stage-fu-1", stage_name: "New Lead", stage_number: 1, funnel_type: "follow_up", description: "Lead baru masuk", created_at: new Date().toISOString() },
  { id: "stage-fu-2", stage_name: "Contacted", stage_number: 2, funnel_type: "follow_up", description: "Sudah dihubungi", created_at: new Date().toISOString() },
  { id: "stage-fu-3", stage_name: "Interest", stage_number: 3, funnel_type: "follow_up", description: "Tertarik produk", created_at: new Date().toISOString() },
  { id: "stage-fu-4", stage_name: "Negotiation", stage_number: 4, funnel_type: "follow_up", description: "Negosiasi harga", created_at: new Date().toISOString() },
  { id: "stage-fu-5", stage_name: "Closing", stage_number: 5, funnel_type: "follow_up", description: "Menunggu pembayaran", created_at: new Date().toISOString() },
];

const MOCK_BROADCAST_STAGES: Stage[] = [
  { id: "stage-bc-1", stage_name: "No Response 1", stage_number: 1, funnel_type: "broadcast", description: "Broadcast ke-1", created_at: new Date().toISOString() },
  { id: "stage-bc-2", stage_name: "No Response 2", stage_number: 2, funnel_type: "broadcast", description: "Broadcast ke-2", created_at: new Date().toISOString() },
  { id: "stage-bc-3", stage_name: "No Response 3", stage_number: 3, funnel_type: "broadcast", description: "Broadcast ke-3", created_at: new Date().toISOString() },
  { id: "stage-bc-4", stage_name: "Final Attempt", stage_number: 4, funnel_type: "broadcast", description: "Broadcast terakhir", created_at: new Date().toISOString() },
];

const MOCK_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "081234567890",
    company: "PT Maju Jaya",
    source_id: "source-1",
    current_stage_id: "stage-fu-2",
    current_funnel: "follow_up",
    status: "active",
    last_response_date: new Date(Date.now() - 86400000).toISOString(),
    last_response_note: "Customer merespon positif via WA",
    custom_labels: ["VIP", "Hot Lead"],
    brand_id: "brand-1",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "lead-2",
    name: "Siti Rahayu",
    email: null,
    phone: "082345678901",
    company: null,
    source_id: "source-2",
    current_stage_id: "stage-bc-1",
    current_funnel: "broadcast",
    status: "active",
    last_response_date: null,
    last_response_note: "Tidak ada respon, dipindah ke broadcast",
    custom_labels: ["Follow Up Urgent"],
    brand_id: "brand-1",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "lead-3",
    name: "Ahmad Yani",
    email: "ahmad@perusahaan.id",
    phone: "083456789012",
    company: "CV Sukses Mandiri",
    source_id: "source-3",
    current_stage_id: "stage-fu-5",
    current_funnel: "follow_up",
    status: "deal",
    last_response_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_response_note: "Deal closed - kontrak ditandatangani",
    custom_labels: ["Closed Deal", "Referral"],
    brand_id: "brand-1",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const MOCK_ACTIVITIES: LeadActivity[] = [
  {
    id: "act-1",
    lead_id: "lead-1",
    activity_type: "whatsapp",
    description: "Follow up via WA menanyakan kabar",
    response_received: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: "Sales User"
  }
];

const MOCK_STAGE_HISTORY: LeadStageHistory[] = [
  {
    id: "hist-1",
    lead_id: "lead-1",
    from_stage_id: "stage-fu-1",
    to_stage_id: "stage-fu-2",
    from_funnel: "follow_up",
    to_funnel: "follow_up",
    reason: "progression",
    notes: "Lead merespon positif",
    moved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    moved_by: "Sales User"
  }
];

const MOCK_SCRIPTS: StageScript[] = [
  {
    id: "script-1",
    stage_id: "stage-fu-1",
    script_text: "Halo [Nama], terima kasih sudah menghubungi kami. Ada yang bisa kami bantu?",
    media_links: [],
    image_url: null,
    video_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Database Helper
export const db = {
  sources: {
    getAll: async () => {
      if (!isConnected) return MOCK_SOURCES;
      const { data, error } = await supabase.from("lead_sources").select("*").order("name");
      if (error) throw error;
      return data;
    }
  },

  stages: {
    getAll: async () => {
      if (!isConnected) return [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES];
      const { data, error } = await supabase.from("stages").select("*").order("stage_number");
      if (error) throw error;
      return data;
    },
    getByFunnel: async (funnel: FunnelType) => {
      if (!isConnected) {
        return funnel === "follow_up" ? MOCK_FOLLOW_UP_STAGES : MOCK_BROADCAST_STAGES;
      }
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("funnel_type", funnel)
        .order("stage_number");
      if (error) throw error;
      return data;
    },
    create: async (stageData: { name: string; description?: string; funnel_type: FunnelType; order: number }) => {
      if (!isConnected) {
        const newStage: Stage = {
          id: `stage-${Date.now()}`,
          stage_name: stageData.name,
          stage_number: stageData.order,
          funnel_type: stageData.funnel_type,
          description: stageData.description || null,
          created_at: new Date().toISOString()
        };
        if (stageData.funnel_type === "follow_up") {
          MOCK_FOLLOW_UP_STAGES.push(newStage);
        } else {
          MOCK_BROADCAST_STAGES.push(newStage);
        }
        return newStage;
      }
      const { data, error } = await supabase.from("stages").insert([{
        stage_name: stageData.name,
        stage_number: stageData.order,
        funnel_type: stageData.funnel_type,
        description: stageData.description
      }]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (stageId: string, stageData: { name?: string; description?: string; order?: number }) => {
      if (!isConnected) {
        const allStages = [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES];
        const index = allStages.findIndex(s => s.id === stageId);
        if (index !== -1) {
          if (stageData.name) allStages[index].stage_name = stageData.name;
          if (stageData.description !== undefined) allStages[index].description = stageData.description || null;
          if (stageData.order) allStages[index].stage_number = stageData.order;
        }
        return allStages[index];
      }
      const updateData: any = {};
      if (stageData.name) updateData.stage_name = stageData.name;
      if (stageData.description !== undefined) updateData.description = stageData.description;
      if (stageData.order) updateData.stage_number = stageData.order;
      
      const { data, error } = await supabase.from("stages").update(updateData).eq("id", stageId).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (stageId: string) => {
      if (!isConnected) {
        const fuIndex = MOCK_FOLLOW_UP_STAGES.findIndex(s => s.id === stageId);
        if (fuIndex !== -1) {
          MOCK_FOLLOW_UP_STAGES.splice(fuIndex, 1);
          return;
        }
        const bcIndex = MOCK_BROADCAST_STAGES.findIndex(s => s.id === stageId);
        if (bcIndex !== -1) {
          MOCK_BROADCAST_STAGES.splice(bcIndex, 1);
        }
        return;
      }
      const { error } = await supabase.from("stages").delete().eq("id", stageId);
      if (error) throw error;
    }
  },

  leads: {
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
        // Mock implementation for offline mode
        return MOCK_LEADS
          .map(lead => ({
            ...lead,
            source: MOCK_SOURCES.find(s => s.id === lead.source_id),
            current_stage: [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === lead.current_stage_id)
          }));
        // Note: In real offline mode we'd filter by funnel_id but mock data doesn't have it yet
      }
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          source:lead_sources(*),
          current_stage:stages(*)
        `)
        .eq("funnel_id", funnelId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (leadData: any) => {
      if (!isConnected) {
        const newLead = { id: `lead-${Date.now()}`, ...leadData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        MOCK_LEADS.unshift(newLead);
        return newLead;
      }
      
      console.log("🔵 Supabase connected - attempting INSERT");
      console.log("📊 Lead data to insert:", leadData);
      
      // Validate required fields before INSERT
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
      
      console.log("✅ Validation passed, attempting Supabase INSERT...");
      console.log("🔑 Using Supabase URL:", supabaseUrl);
      console.log("🔑 Anon key present:", !!supabaseKey);
      
      const { data, error } = await supabase.from("leads").insert([leadData]).select().single();
      
      if (error) {
        console.error("❌ Supabase INSERT error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        
        // Enhanced error message for users
        const userMessage = `Failed to save lead: ${error.message}${error.hint ? `\n\nHint: ${error.hint}` : ''}${error.details ? `\n\nDetails: ${error.details}` : ''}`;
        const enhancedError = new Error(userMessage);
        (enhancedError as any).code = error.code;
        (enhancedError as any).details = error.details;
        (enhancedError as any).hint = error.hint;
        throw enhancedError;
      }
      
      console.log("✅ Lead inserted successfully:", data);
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
      // Return stats compatible with dashboard
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
      
      // Get all leads with their stage movement history
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

      // Get recent stage movements (last 7 days) to identify progressing leads
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
      
      // Leads progressing = active leads that moved in last 7 days
      const progressing = activeLeads.filter(l => recentlyMovedLeadIds.has(l.id)).length;
      
      // Leads stuck = active leads that haven't moved in 7+ days
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

    moveToStage: async (leadId: string, toStageId: string, reason: string, notes: string, userId: string) => {
      if (!isConnected) {
        const lead = MOCK_LEADS.find(l => l.id === leadId);
        const toStage = [...MOCK_FOLLOW_UP_STAGES, ...MOCK_BROADCAST_STAGES].find(s => s.id === toStageId);
        
        if (lead && toStage) {
          // Create history record
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

          // Update lead
          lead.current_stage_id = toStageId;
          lead.current_funnel = toStage.funnel_type;
          lead.updated_at = new Date().toISOString();
        }
        return;
      }

      // Real implementation with Supabase transaction
      try {
        console.log("🔵 SUPABASE - moveToStage started");
        console.log("📊 Lead ID:", leadId);
        console.log("📊 Target Stage ID:", toStageId);
        console.log("📊 Reason:", reason);
        console.log("📊 Notes:", notes);
        console.log("📊 User ID:", userId);
        
        // Step 1: Get current lead info
        console.log("🔍 STEP 1: Fetching current lead info...");
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
        
        console.log("✅ Current lead info:", lead);

        // Step 2: Get target stage info
        console.log("🔍 STEP 2: Fetching target stage info...");
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
        
        console.log("✅ Target stage info:", toStage);

        // Step 3: Verify from_stage_id exists (FK constraint check)
        console.log("🔍 STEP 3: Verifying from_stage_id exists...");
        const { data: fromStage, error: fromStageError } = await supabase
          .from("stages")
          .select("id, stage_name")
          .eq("id", lead.current_stage_id)
          .single();
        
        if (fromStageError || !fromStage) {
          console.error("❌ Invalid from_stage_id:", lead.current_stage_id);
          throw new Error(`Current stage ID is invalid. Please refresh the page and try again.`);
        }
        
        console.log("✅ From stage verified:", fromStage);

        // Step 4: Create history record with proper timestamp
        const movedAt = new Date().toISOString();
        console.log("🔍 STEP 4: Creating history record with timestamp:", movedAt);
        
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
        
        console.log("📊 History payload:", historyPayload);
        
        const { data: historyData, error: historyError } = await supabase
          .from("lead_stage_history")
          .insert([historyPayload])
          .select();
        
        if (historyError) {
          console.error("❌ Error creating history:", historyError);
          console.error("❌ History error code:", historyError.code);
          console.error("❌ History error details:", historyError.details);
          console.error("❌ History error hint:", historyError.hint);
          
          // User-friendly error message
          if (historyError.code === "23503") {
            throw new Error("Database integrity error. Please refresh the page and try again.");
          }
          
          throw new Error(`Failed to create movement history: ${historyError.message}`);
        }
        
        console.log("✅ History record created:", historyData);

        // Step 5: Update lead with new stage
        console.log("🔍 STEP 5: Updating lead...");
        const { error: updateError } = await supabase
          .from("leads")
          .update({
            current_stage_id: toStageId,
            current_funnel: toStage.funnel_type,
            updated_at: movedAt
          })
          .eq("id", leadId);
        
        if (updateError) {
          console.error("❌ Error updating lead:", updateError);
          throw new Error(`Failed to update lead: ${updateError.message}`);
        }
        
        console.log("✅ Lead updated successfully");
        console.log("🎉 moveToStage - Operation completed successfully!");

      } catch (error) {
        console.error("❌ moveToStage - Fatal error:", error);
        throw error;
      }
    }
  },

  activities: {
    getByLead: async (leadId: string) => {
      if (!isConnected) {
        return MOCK_ACTIVITIES.filter(a => a.lead_id === leadId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      const { data, error } = await supabase.from("lead_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (activity: any) => {
      if (!isConnected) {
        const newActivity = { id: `act-${Date.now()}`, ...activity, created_at: new Date().toISOString() };
        MOCK_ACTIVITIES.unshift(newActivity);
        return newActivity;
      }
      const { data, error } = await supabase.from("lead_activities").insert([activity]).select().single();
      if (error) throw error;
      return data;
    }
  },

  stageHistory: {
    getByLead: async (leadId: string) => {
      if (!isConnected) {
        return MOCK_STAGE_HISTORY
          .filter(h => h.lead_id === leadId)
          .sort((a, b) => new Date(b.moved_at).getTime() - new Date(a.moved_at).getTime());
      }
      const { data, error } = await supabase
        .from("lead_stage_history")
        .select(`
          *,
          from_stage:stages!from_stage_id(*),
          to_stage:stages!to_stage_id(*)
        `)
        .eq("lead_id", leadId)
        .order("moved_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  scripts: {
    getAll: async () => {
      if (!isConnected) return MOCK_SCRIPTS;
      const { data, error } = await supabase.from("stage_scripts").select("*");
      if (error) throw error;
      return data;
    },
    getByStage: async (stageId: string) => {
      if (!isConnected) {
        return MOCK_SCRIPTS.find(s => s.stage_id === stageId) || null;
      }
      
      // ✅ FIX: Use maybeSingle() to handle 0 or 1 results properly (prevents 406 errors)
      const { data, error } = await supabase
        .from("stage_scripts")
        .select("*")
        .eq("stage_id", stageId)
        .maybeSingle();  // Changed from limit(1) to maybeSingle()
      
      if (error) {
        console.error("❌ Error fetching script for stage:", error);
        return null;
      }
      
      // maybeSingle() returns null if no row found, or the single row
      return data;
    },
    create: async (scriptData: { stage_id: string; script_text: string; media_links?: string[]; image_url?: string | null; video_url?: string | null }) => {
      if (!isConnected) {
        const newScript = {
          id: `script-${Date.now()}`,
          stage_id: scriptData.stage_id,
          script_text: scriptData.script_text,
          media_links: scriptData.media_links || [],
          image_url: scriptData.image_url || null,
          video_url: scriptData.video_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        MOCK_SCRIPTS.push(newScript);
        return newScript;
      }
      const { data, error } = await supabase.from("stage_scripts").insert([scriptData]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (scriptId: string, scriptData: { script_text?: string; media_links?: string[]; image_url?: string | null; video_url?: string | null }) => {
      if (!isConnected) {
        const index = MOCK_SCRIPTS.findIndex(s => s.id === scriptId);
        if (index !== -1) {
          MOCK_SCRIPTS[index] = { ...MOCK_SCRIPTS[index], ...scriptData, updated_at: new Date().toISOString() };
          return MOCK_SCRIPTS[index];
        }
        return null;
      }
      const { data, error } = await supabase.from("stage_scripts").update(scriptData).eq("id", scriptId).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (scriptId: string) => {
      if (!isConnected) {
        const index = MOCK_SCRIPTS.findIndex(s => s.id === scriptId);
        if (index !== -1) {
          MOCK_SCRIPTS.splice(index, 1);
        }
        return;
      }
      const { error } = await supabase.from("stage_scripts").delete().eq("id", scriptId);
      if (error) throw error;
    }
  },

  analytics: {
    getBottlenecks: async () => { // Kept for backward compatibility if needed, but getBottleneckAnalytics is preferred
      return db.analytics.getBottleneckAnalytics();
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
        // Mock data for daily movements
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
        // Mock journey data
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

    // NEW: Funnel Leakage Stats
    getFunnelLeakageStats: async (): Promise<FunnelLeakageStats> => {
      if (!isConnected) {
        return {
          total_leads: 100,
          leaked_to_broadcast: 25,
          leakage_percentage: 25
        };
      }
      const { data, error } = await supabase.rpc("get_funnel_leakage_stats");
      if (error) {
        console.error("Error fetching funnel leakage stats:", error);
        return { total_leads: 0, leaked_to_broadcast: 0, leakage_percentage: 0 };
      }
      return data?.[0] || { total_leads: 0, leaked_to_broadcast: 0, leakage_percentage: 0 };
    },

    // NEW: Stage Velocity
    getStageVelocity: async (): Promise<StageVelocity[]> => {
      if (!isConnected) {
        return [
          { stage_name_out: "FU 1", avg_hours: "24.5", total_leads_passed: 50 },
          { stage_name_out: "FU 2", avg_hours: "18.3", total_leads_passed: 45 },
          { stage_name_out: "BC 1", avg_hours: "36.7", total_leads_passed: 20 }
        ];
      }
      const { data, error } = await supabase.rpc("get_avg_time_per_stage");
      if (error) {
        console.error("Error fetching stage velocity:", error);
        return [];
      }
      return data || [];
    },

    // NEW: Heatmap Analytics
    getHeatmapAnalytics: async (targetType: "deal" | "all" = "all"): Promise<HeatmapDataPoint[]> => {
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
      const { data, error } = await supabase.rpc("get_heatmap_analytics", { target_type: targetType });
      if (error) {
        console.error("Error fetching heatmap analytics:", error);
        return [];
      }
      return data || [];
    },

    // NEW: Bottleneck Warnings (Business Logic)
    getBottleneckWarnings: async (): Promise<BottleneckWarning[]> => {
      const velocityData = await db.analytics.getStageVelocity();
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

    // NEW: Follow-Up Funnel Flow
    getFollowUpFunnelFlow: async (): Promise<FunnelFlowStep[]> => {
      if (!isConnected) {
        // Mock data for offline mode
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
      const { data, error } = await supabase.rpc("get_follow_up_funnel_flow");
      if (error) {
        console.error("Error fetching follow-up funnel flow:", error);
        return [];
      }
      return data || [];
    }
  },

  customLabels: {
    getAll: async () => {
      if (!isConnected) {
        // Return mock data from localStorage for offline mode
        const stored = localStorage.getItem("customLabels");
        if (stored) {
          return JSON.parse(stored);
        }
        return [
          { id: "1", name: "VIP", color: "purple", icon: "star", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: "2", name: "Hot Lead", color: "red", icon: "zap", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: "3", name: "Follow Up Urgent", color: "orange", icon: "flag", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];
      }
      const { data, error } = await supabase
        .from("custom_labels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (labelData: { name: string; color: string; icon: string }) => {
      if (!isConnected) {
        const stored = localStorage.getItem("customLabels");
        const labels = stored ? JSON.parse(stored) : [];
        const newLabel = {
          id: Date.now().toString(),
          ...labelData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        labels.push(newLabel);
        localStorage.setItem("customLabels", JSON.stringify(labels));
        return newLabel;
      }
      const { data, error } = await supabase
        .from("custom_labels")
        .insert([labelData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (labelId: string, labelData: { name?: string; color?: string; icon?: string }) => {
      if (!isConnected) {
        const stored = localStorage.getItem("customLabels");
        if (stored) {
          const labels = JSON.parse(stored);
          const index = labels.findIndex((l: any) => l.id === labelId);
          if (index !== -1) {
            labels[index] = { ...labels[index], ...labelData, updated_at: new Date().toISOString() };
            localStorage.setItem("customLabels", JSON.stringify(labels));
            return labels[index];
          }
        }
        return null;
      }
      const { data, error } = await supabase
        .from("custom_labels")
        .update({ ...labelData, updated_at: new Date().toISOString() })
        .eq("id", labelId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (labelId: string) => {
      if (!isConnected) {
        const stored = localStorage.getItem("customLabels");
        if (stored) {
          const labels = JSON.parse(stored);
          const filtered = labels.filter((l: any) => l.id !== labelId);
          localStorage.setItem("customLabels", JSON.stringify(filtered));
        }
        return;
      }
      const { error } = await supabase
        .from("custom_labels")
        .delete()
        .eq("id", labelId);
      if (error) throw error;
    }
  },

  // ============================================================================
  // NEW: BRAND & FUNNEL OPERATIONS
  // ============================================================================

  brands: {
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
  },

  funnels: {
    getByBrand: async (brandId: string) => {
      if (!isConnected) {
        return [
          {
            id: "funnel-1",
            brand_id: brandId,
            name: "Main Funnel",
            description: "Default funnel for Powerdash leads",
            is_active: true,
            is_default: true,
            total_leads_count: 242,
            conversion_rate: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
      const { data, error } = await supabase
        .from("funnels")
        .select("*")
        .eq("brand_id", brandId)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (funnelId: string) => {
      if (!isConnected) return null;
      const { data, error } = await supabase
        .from("funnels")
        .select(`
          *,
          brand:brands(*)
        `)
        .eq("id", funnelId)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (funnelData: { brand_id: string; name: string; description?: string; is_default?: boolean }) => {
      if (!isConnected) {
        const newFunnel = {
          id: `funnel-${Date.now()}`,
          ...funnelData,
          is_active: true,
          is_default: funnelData.is_default || false,
          total_leads_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return newFunnel;
      }
      const { data, error } = await supabase
        .from("funnels")
        .insert({
          brand_id: funnelData.brand_id,
          name: funnelData.name,
          description: funnelData.description,
          is_default: funnelData.is_default || false,
          is_active: true,
          total_leads_count: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (funnelId: string, funnelData: { name?: string; description?: string; is_active?: boolean; is_default?: boolean }) => {
      if (!isConnected) return null;
      const { data, error } = await supabase
        .from("funnels")
        .update({
          ...funnelData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", funnelId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    setDefault: async (funnelId: string) => {
      if (!isConnected) return;
      
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
    },

    delete: async (funnelId: string) => {
      if (!isConnected) return;
      const { error } = await supabase
        .from("funnels")
        .update({ is_active: false })
        .eq("id", funnelId);
      if (error) throw error;
    }
  }
};