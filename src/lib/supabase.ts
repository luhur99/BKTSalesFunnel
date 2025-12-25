import { createClient } from "@supabase/supabase-js";
import { Lead, LeadSource, Stage, LeadActivity, LeadStageHistory, StageScript, BottleneckAnalytics, FunnelType } from "@/types/lead";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export const isConnected = !!(supabaseUrl && supabaseKey && supabaseUrl !== "your-project-url");

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

    getByFunnel: async (funnel: FunnelType) => {
      if (!isConnected) {
        return MOCK_LEADS
          .filter(l => l.current_funnel === funnel)
          .map(lead => ({
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
        .eq("current_funnel", funnel)
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
      const { data, error } = await supabase.from("leads").insert([leadData]).select().single();
      if (error) throw error;
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
          deals_closed: deal,
          lost_leads: lost,
          follow_up_leads: fu,
          broadcast_leads: bc,
          conversion_rate: total > 0 ? (deal / total) * 100 : 0,
          total_deal_value: 0
        };
      }
      
      const { data: leads } = await supabase.from("leads").select("status, current_funnel");
      if (!leads) return { total_leads: 0, active_leads: 0, deals_closed: 0, lost_leads: 0, follow_up_leads: 0, broadcast_leads: 0, conversion_rate: 0, total_deal_value: 0 };

      const total = leads.length;
      const deal = leads.filter(l => l.status === "deal").length;
      
      return {
        total_leads: total,
        active_leads: leads.filter(l => l.status === "active").length,
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

      // Real implementation would go here (RPC call or manual transaction)
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
    getByStage: async (stageId: string) => {
      if (!isConnected) {
        return MOCK_SCRIPTS.find(s => s.stage_id === stageId) || null;
      }
      const { data, error } = await supabase.from("stage_scripts").select("*").eq("stage_id", stageId).single();
      if (error) return null;
      return data;
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
    }
  }
};