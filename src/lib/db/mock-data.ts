import { Lead, LeadSource, Stage, LeadActivity, LeadStageHistory, StageScript } from "@/types/lead";

export const MOCK_SOURCES: LeadSource[] = [
  { id: "source-1", name: "Facebook Ads", type: "social", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-2", name: "Instagram DM", type: "social", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-3", name: "Website Form", type: "website", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "source-4", name: "Whatsapp Direct", type: "direct", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const MOCK_FOLLOW_UP_STAGES: Stage[] = [
  { id: "stage-fu-1", stage_name: "New Lead", stage_number: 1, funnel_type: "follow_up", description: "Lead baru masuk", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-fu-2", stage_name: "Contacted", stage_number: 2, funnel_type: "follow_up", description: "Sudah dihubungi", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-fu-3", stage_name: "Interest", stage_number: 3, funnel_type: "follow_up", description: "Tertarik produk", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-fu-4", stage_name: "Negotiation", stage_number: 4, funnel_type: "follow_up", description: "Negosiasi harga", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-fu-5", stage_name: "Closing", stage_number: 5, funnel_type: "follow_up", description: "Menunggu pembayaran", funnel_id: null, created_at: new Date().toISOString() },
];

export const MOCK_BROADCAST_STAGES: Stage[] = [
  { id: "stage-bc-1", stage_name: "No Response 1", stage_number: 1, funnel_type: "broadcast", description: "Broadcast ke-1", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-bc-2", stage_name: "No Response 2", stage_number: 2, funnel_type: "broadcast", description: "Broadcast ke-2", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-bc-3", stage_name: "No Response 3", stage_number: 3, funnel_type: "broadcast", description: "Broadcast ke-3", funnel_id: null, created_at: new Date().toISOString() },
  { id: "stage-bc-4", stage_name: "Final Attempt", stage_number: 4, funnel_type: "broadcast", description: "Broadcast terakhir", funnel_id: null, created_at: new Date().toISOString() },
];

export const MOCK_LEADS: Lead[] = [
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

export const MOCK_ACTIVITIES: LeadActivity[] = [
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

export const MOCK_STAGE_HISTORY: LeadStageHistory[] = [
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

export const MOCK_SCRIPTS: StageScript[] = [
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
