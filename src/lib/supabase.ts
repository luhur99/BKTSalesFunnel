import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if keys exist to avoid runtime crash
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock data for preview when Supabase is not connected
const MOCK_STAGES = [
  // Follow Up Funnel
  { id: "s1", stage_name: "New Lead", stage_number: 1, funnel_type: "follow_up", description: "Lead baru masuk" },
  { id: "s2", stage_name: "Contacted", stage_number: 2, funnel_type: "follow_up", description: "Sudah dihubungi via WA/Call" },
  { id: "s3", stage_name: "Interested", stage_number: 3, funnel_type: "follow_up", description: "Tertarik tapi belum beli" },
  { id: "s4", stage_name: "Meeting Scheduled", stage_number: 4, funnel_type: "follow_up", description: "Jadwal demo/meeting" },
  { id: "s5", stage_name: "Proposal Sent", stage_number: 5, funnel_type: "follow_up", description: "Penawaran dikirim" },
  { id: "s6", stage_name: "Negotiation", stage_number: 6, funnel_type: "follow_up", description: "Nego harga/fitur" },
  { id: "s7", stage_name: "Contract Draft", stage_number: 7, funnel_type: "follow_up", description: "Draft kontrak dikirim" },
  { id: "s8", stage_name: "Legal Review", stage_number: 8, funnel_type: "follow_up", description: "Review legal" },
  { id: "s9", stage_name: "Invoice Sent", stage_number: 9, funnel_type: "follow_up", description: "Menunggu pembayaran" },
  { id: "s10", stage_name: "Deal", stage_number: 10, funnel_type: "follow_up", description: "Closing berhasil" },
  
  // Broadcast Funnel
  { id: "b1", stage_name: "Broadcast 1", stage_number: 1, funnel_type: "broadcast", description: "Sapaan ringan (H+1)" },
  { id: "b2", stage_name: "Broadcast 2", stage_number: 2, funnel_type: "broadcast", description: "Edukasi produk (H+3)" },
  { id: "b3", stage_name: "Broadcast 3", stage_number: 3, funnel_type: "broadcast", description: "Social proof/Testimoni (H+5)" },
  { id: "b4", stage_name: "Broadcast 4", stage_number: 4, funnel_type: "broadcast", description: "Soft selling (H+7)" },
  { id: "b5", stage_name: "Broadcast 5", stage_number: 5, funnel_type: "broadcast", description: "Promo terbatas (H+10)" },
  { id: "b6", stage_name: "Broadcast 6", stage_number: 6, funnel_type: "broadcast", description: "Benefit reminder (H+14)" },
  { id: "b7", stage_name: "Broadcast 7", stage_number: 7, funnel_type: "broadcast", description: "Case study (H+20)" },
  { id: "b8", stage_name: "Broadcast 8", stage_number: 8, funnel_type: "broadcast", description: "Last call promo (H+25)" },
  { id: "b9", stage_name: "Broadcast 9", stage_number: 9, funnel_type: "broadcast", description: "Fear of missing out (H+28)" },
  { id: "b10", stage_name: "Final Attempt", stage_number: 10, funnel_type: "broadcast", description: "Perpisahan/Arsip (H+30)" },
];

const MOCK_SOURCES = [
  { id: "src1", name: "Facebook Ads" },
  { id: "src2", name: "Google Ads" },
  { id: "src3", name: "Organic Social" },
  { id: "src4", name: "Referral" },
  { id: "src5", name: "Manual Input" },
];

const MOCK_LEADS = [
  { 
    id: "l1", 
    name: "Budi Santoso", 
    company: "PT Maju Jaya", 
    email: "budi@example.com", 
    phone: "08123456789", 
    status: "active", 
    current_funnel: "follow_up", 
    current_stage_id: "s2", 
    source_id: "src1", 
    deal_value: 5000000,
    created_at: new Date().toISOString(),
    last_response_date: new Date().toISOString(),
    source: MOCK_SOURCES[0]
  },
  { 
    id: "l2", 
    name: "Siti Aminah", 
    company: "CV Berkah", 
    email: "siti@example.com", 
    phone: "08987654321", 
    status: "active", 
    current_funnel: "follow_up", 
    current_stage_id: "s1", 
    source_id: "src2", 
    deal_value: 7500000,
    created_at: new Date().toISOString(),
    source: MOCK_SOURCES[1]
  },
  { 
    id: "l3", 
    name: "Ahmad Rizki", 
    company: "Tech Indo", 
    email: "ahmad@example.com", 
    status: "active", 
    current_funnel: "broadcast", 
    current_stage_id: "b3", 
    source_id: "src3", 
    deal_value: 12000000,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    source: MOCK_SOURCES[2]
  }
];

const MOCK_SCRIPTS = [
  { 
    id: "sc1", 
    stage_id: "s1", 
    script_text: "Halo, terima kasih sudah menghubungi Budi Karya Teknologi. Ada yang bisa kami bantu untuk kebutuhan bisnis Anda?",
    media_links: ["https://bk-tech.com/portfolio"],
    image_url: null,
    video_url: null
  },
  { 
    id: "sc2", 
    stage_id: "b1", 
    script_text: "Halo Kak, bagaimana kabar bisnisnya? Kami ada update fitur terbaru nih yang cocok untuk efisiensi operasional kakak.",
    media_links: [],
    image_url: null,
    video_url: null
  }
];

const MOCK_STAGE_HISTORY = [
  {
    id: "h1",
    lead_id: "l1",
    from_stage_id: "s1",
    to_stage_id: "s2",
    from_funnel: "follow_up",
    to_funnel: "follow_up",
    reason: "progression",
    notes: "Customer merespon positif via WA",
    moved_by: "Sales User",
    moved_at: new Date(Date.now() - 86400000).toISOString(),
    from_stage: MOCK_STAGES.find(s => s.id === "s1"),
    to_stage: MOCK_STAGES.find(s => s.id === "s2")
  },
  {
    id: "h2",
    lead_id: "l1",
    from_stage_id: null,
    to_stage_id: "s1",
    from_funnel: null,
    to_funnel: "follow_up",
    reason: "new_lead",
    notes: "Lead masuk dari Facebook Ads",
    moved_by: "System",
    moved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    from_stage: null,
    to_stage: MOCK_STAGES.find(s => s.id === "s1")
  }
];

// Type-safe database helpers with fallback to mock data
export const db = {
  // Leads
  leads: {
    getAll: async () => {
      if (!supabase) return MOCK_LEADS;
      
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
      if (!supabase) return MOCK_LEADS.find(l => l.id === id);

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
      if (!supabase) {
        const leads = MOCK_LEADS;
        const active = leads.filter(l => l.status === "active");
        const deals = leads.filter(l => l.status === "deal");
        
        return {
          total_leads: leads.length,
          active_leads: active.length,
          deals_closed: deals.length,
          lost_leads: leads.filter(l => l.status === "lost").length,
          follow_up_leads: active.filter(l => l.current_funnel === "follow_up").length,
          broadcast_leads: active.filter(l => l.current_funnel === "broadcast").length,
          conversion_rate: 0,
          total_deal_value: deals.reduce((sum, l) => sum + (l.deal_value || 0), 0)
        };
      }

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
      if (!supabase) {
        return MOCK_LEADS.filter(l => l.current_funnel === funnel).map(l => ({
          ...l,
          current_stage: MOCK_STAGES.find(s => s.id === l.current_stage_id)
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
        .eq("status", "active")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (lead: any) => {
      if (!supabase) {
        console.log("Mock create lead:", lead);
        const newLead = { ...lead, id: `new_${Date.now()}`, created_at: new Date().toISOString() };
        MOCK_LEADS.push(newLead);
        return newLead;
      }

      const { data, error } = await supabase
        .from("leads")
        .insert([lead])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      if (!supabase) return { id, ...updates };

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
      if (!supabase) {
        console.log("Mock move stage:", { leadId, toStageId, reason });
        return { success: true };
      }

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
      if (!supabase) return MOCK_STAGES;

      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("funnel_type")
        .order("stage_number");
      
      if (error) throw error;
      return data;
    },

    getByFunnel: async (funnel: "follow_up" | "broadcast") => {
      if (!supabase) return MOCK_STAGES.filter(s => s.funnel_type === funnel);

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
      if (!supabase) return MOCK_SOURCES;

      const { data, error } = await supabase
        .from("lead_sources")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    
    // Add missing method for creating sources if needed (for completeness)
    create: async (name: string) => {
      if (!supabase) return { id: `src_${Date.now()}`, name };
      const { data, error } = await supabase.from("lead_sources").insert([{ name }]).select().single();
      if (error) throw error;
      return data;
    }
  },

  // Stage Scripts
  scripts: {
    getByStage: async (stageId: string) => {
      if (!supabase) {
        return MOCK_SCRIPTS.find(s => s.stage_id === stageId) || null;
      }
      const { data, error } = await supabase
        .from("scripts")
        .select("*")
        .eq("stage_id", stageId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    
    // Add create/update methods for completeness
    upsert: async (script: any) => {
        if (!supabase) return script;
        const { data, error } = await supabase.from("scripts").upsert(script).select().single();
        if (error) throw error;
        return data;
    }
  },

  stageHistory: {
    getByLead: async (leadId: string) => {
      if (!supabase) {
        return MOCK_STAGE_HISTORY
          .filter(h => h.lead_id === leadId)
          .sort((a, b) => new Date(b.moved_at).getTime() - new Date(a.moved_at).getTime());
      }
      const { data, error } = await supabase
        .from("lead_stage_history")
        .select(`
          *,
          from_stage:stages!lead_stage_history_from_stage_id_fkey(*),
          to_stage:stages!lead_stage_history_to_stage_id_fkey(*)
        `)
        .eq("lead_id", leadId)
        .order("moved_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  // Analytics
  analytics: {
    getDashboardMetrics: async () => {
      // Reuse logic from leads.getStats
      return await db.leads.getStats();
    },

    getBottleneckAnalytics: async () => {
      if (!supabase) {
        // Return mock bottleneck data based on mock stages
        return MOCK_STAGES.map(stage => ({
          stage_id: stage.id,
          stage_name: stage.stage_name,
          funnel_type: stage.funnel_type,
          stage_number: stage.stage_number,
          leads_entered: Math.floor(Math.random() * 50) + 10,
          leads_progressed: Math.floor(Math.random() * 30) + 5,
          leads_stuck: Math.floor(Math.random() * 10),
          conversion_rate: Math.floor(Math.random() * 100),
          avg_time_in_stage: 24
        }));
      }

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
      if (!supabase) {
        return [
          {
            id: "act1",
            lead_id: leadId,
            activity_type: "call",
            description: "Follow up call - no answer",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            created_by: "Sales User",
            response_received: false
          }
        ];
      }

      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (activity: any) => {
      if (!supabase) return { id: `act_${Date.now()}`, ...activity, created_at: new Date().toISOString() };

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