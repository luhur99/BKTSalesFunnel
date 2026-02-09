import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Phone, Mail, Building2, Clock, MessageSquare, FileText, Calendar, TrendingUp, Activity, Globe, Tag, Edit2, X, Plus } from "lucide-react";
import { Lead, Stage, LeadActivity, ActivityType, StageScript, LeadStageHistory, LeadSource } from "@/types/lead";
import { db } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

interface Funnel {
  id: string;
  name: string;
}

interface EditFormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  source_id: string;
  status: string;
  custom_labels: string[];
  deal_value: string | number;
  created_at: string;
}

export function LeadDetailModal({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [stageHistory, setStageHistory] = useState<LeadStageHistory[]>([]);
  const [script, setScript] = useState<StageScript | null>(null);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [moveToStage, setMoveToStage] = useState("");
  const [moveNotes, setMoveNotes] = useState("");
  const [moveReason, setMoveReason] = useState("manual_move");
  const [newActivity, setNewActivity] = useState({
    type: "note" as ActivityType,
    description: "",
    response_received: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labelInput, setLabelInput] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    source_id: "",
    status: "active",
    custom_labels: [],
    deal_value: "",
    created_at: "",
  });

  const toDateInputValue = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toIsoDateStart = (dateInputValue: string) => {
    const [year, month, day] = dateInputValue.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
  };

  useEffect(() => {
    if (lead) {
      loadLeadData();
      // Initialize edit form with lead data
      setEditForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        source_id: lead.source_id || "",
        status: lead.status || "active",
        custom_labels: lead.custom_labels || [],
        deal_value: lead.deal_value ? String(lead.deal_value) : "",
        created_at: toDateInputValue(lead.created_at),
      });
    }
  }, [lead]);

  const loadLeadData = async () => {
    if (!lead) return;

    try {
      console.log("🔄 Loading lead data for brand:", lead.brand_id);
      
      // FIX: Load funnels first to get funnel IDs (stages don't have brand_id)
      const { data: funnelsData, error: funnelsError } = await supabase
        .from("funnels")
        .select("id, name")
        .eq("brand_id", lead.brand_id)
        .order("name", { ascending: true });

      if (funnelsError) throw funnelsError;
      
      console.log("✅ Loaded ALL funnels:", funnelsData?.length, "funnels");

      // FIX: Extract funnel IDs to query stages
      const funnelIds = funnelsData?.map(f => f.id) || [];
      
      if (funnelIds.length === 0) {
        console.warn("⚠️ No funnels found for brand");
        setStages([]);
        setFunnels([]);
        return;
      }

      // FIX: Load ALL stages from ALL funnels in the brand
      const { data: allStagesData, error: stagesError } = await supabase
        .from("stages")
        .select("*")
        .in("funnel_id", funnelIds)
        .order("funnel_type", { ascending: true })
        .order("stage_number", { ascending: true });

      if (stagesError) throw stagesError;
      
      console.log("✅ Loaded ALL stages from brand funnels:", allStagesData?.length, "stages");

      const leadActivities = await db.activities.getByLead(lead.id);
      const leadHistory = await db.stageHistory.getByLead(lead.id);
      const stageScript = lead.current_stage_id ? await db.scripts.getByStage(lead.current_stage_id) : null;
      const allSources = await db.sources.getAll();
      const customLabels = await db.customLabels.getAll();

      setStages(allStagesData || []);
      setFunnels(funnelsData || []);
      setActivities(leadActivities || []);
      setStageHistory(leadHistory || []);
      setScript(stageScript);
      setSources(allSources || []);
      setAvailableLabels(customLabels?.map((l: any) => l.name) || []);
    } catch (error) {
      console.error("Error loading lead data:", error);
    }
  };

  const handleMoveStage = async () => {
    if (!lead || !moveToStage) return;

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.email || "System";
      
      // FIX #2: Find target stage to get funnel_type
      const targetStage = stages.find(s => s.id === moveToStage);
      if (!targetStage) {
        throw new Error("Target stage not found");
      }

      const fromStage = lead.current_stage;
      
      console.log("🔄 Moving lead to stage:", moveToStage);
      console.log("📊 From:", fromStage?.stage_name, "→ To:", targetStage.stage_name);
      console.log("📊 Funnel Type:", fromStage?.funnel_type, "→", targetStage.funnel_type);
      
      // FIX #2: Update BOTH current_stage_id AND current_funnel
      await db.leads.update(lead.id, {
        current_stage_id: moveToStage,
        current_funnel: targetStage.funnel_type, // ✅ Update current_funnel based on target stage
        updated_at: new Date().toISOString()
      });

      // Create history record
      await db.stageHistory.create({
        lead_id: lead.id,
        from_stage_id: lead.current_stage_id,
        to_stage_id: moveToStage,
        from_funnel: lead.current_funnel,
        to_funnel: targetStage.funnel_type,
        reason: moveReason,
        notes: moveNotes,
        moved_by: userId
      });
      
      toast({
        title: "✅ Lead Berhasil Dipindahkan",
        description: `${fromStage?.stage_name || 'Stage sebelumnya'} → ${targetStage.stage_name}`,
      });
      
      console.log("🔄 Calling onUpdate to refresh parent data...");
      await onUpdate();
      console.log("✅ onUpdate completed, waiting before close...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("✅ Closing modal after successful update");
      onClose();
      
    } catch (error: any) {
      console.error("❌ Error moving lead:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to move lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddActivity = async () => {
    if (!lead || !newActivity.description) return;

    try {
      setIsSubmitting(true);
      await db.activities.create({
        lead_id: lead.id,
        activity_type: newActivity.type,
        description: newActivity.description,
        response_received: newActivity.response_received,
        created_by: "Sales User"
      });
      
      await db.leads.update(lead.id, {
        last_response_note: newActivity.description,
        updated_at: new Date().toISOString()
      });
      
      setNewActivity({ type: "note", description: "", response_received: false });
      await onUpdate();
      loadLeadData();
    } catch (error) {
      console.error("Error adding activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToBroadcast = async () => {
    if (!lead) return;

    const broadcastStages = stages.filter(s => s.funnel_type === "broadcast");
    if (broadcastStages.length === 0) {
      toast({
        title: "Error",
        description: "No broadcast stages available",
        variant: "destructive",
      });
      return;
    }

    const firstBroadcastStage = broadcastStages.sort((a, b) => a.stage_number - b.stage_number)[0];

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.email || "System";

      console.log("🔄 Moving lead to broadcast funnel, stage:", firstBroadcastStage);
      console.log("📊 From:", lead.current_stage?.stage_name, "(Follow Up) → To:", firstBroadcastStage.stage_name, "(Broadcast)");
      
      // Update BOTH stage and funnel
      await db.leads.update(lead.id, {
        current_stage_id: firstBroadcastStage.id,
        current_funnel: "broadcast",
        updated_at: new Date().toISOString()
      });

      // Create history
      await db.stageHistory.create({
        lead_id: lead.id,
        from_stage_id: lead.current_stage_id,
        to_stage_id: firstBroadcastStage.id,
        from_funnel: lead.current_funnel,
        to_funnel: "broadcast",
        reason: "moved_to_broadcast",
        notes: "Moved to broadcast funnel",
        moved_by: userId
      });

      toast({
        title: "✅ Lead Dipindahkan ke Broadcast",
        description: `${lead.current_stage?.stage_name || 'Stage sebelumnya'} (Follow Up) → ${firstBroadcastStage.stage_name} (Broadcast)`,
      });

      console.log("🔄 Calling onUpdate to refresh parent data...");
      await onUpdate();
      console.log("✅ onUpdate completed, waiting before close...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("✅ Closing modal after successful update");
      onClose();

    } catch (error: any) {
      console.error("❌ Error moving to broadcast:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to move lead to Broadcast",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToFollowUp = async () => {
    if (!lead) return;

    const followUpStages = stages.filter(s => s.funnel_type === "follow_up");
    if (followUpStages.length === 0) {
      toast({
        title: "Error",
        description: "No follow-up stages available",
        variant: "destructive",
      });
      return;
    }

    const firstFollowUpStage = followUpStages.sort((a, b) => a.stage_number - b.stage_number)[0];

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.email || "System";

      console.log("🔄 Moving lead to follow-up funnel, stage:", firstFollowUpStage);
      console.log("📊 From:", lead.current_stage?.stage_name, "(Broadcast) → To:", firstFollowUpStage.stage_name, "(Follow Up)");
      
      // Update BOTH stage and funnel
      await db.leads.update(lead.id, {
        current_stage_id: firstFollowUpStage.id,
        current_funnel: "follow_up",
        updated_at: new Date().toISOString()
      });

      // Create history
      await db.stageHistory.create({
        lead_id: lead.id,
        from_stage_id: lead.current_stage_id,
        to_stage_id: firstFollowUpStage.id,
        from_funnel: lead.current_funnel,
        to_funnel: "follow_up",
        reason: "moved_to_followup",
        notes: "Moved to follow-up funnel",
        moved_by: userId
      });

      toast({
        title: "✅ Lead Dipindahkan ke Follow Up",
        description: `${lead.current_stage?.stage_name || 'Stage sebelumnya'} (Broadcast) → ${firstFollowUpStage.stage_name} (Follow Up)`,
      });

      console.log("🔄 Calling onUpdate to refresh parent data...");
      await onUpdate();
      console.log("✅ onUpdate completed, waiting before close...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("✅ Closing modal after successful update");
      onClose();

    } catch (error: any) {
      console.error("❌ Error moving to follow-up:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to move lead to Follow Up",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !editForm.custom_labels.includes(labelInput.trim())) {
      setEditForm({ 
        ...editForm, 
        custom_labels: [...editForm.custom_labels, labelInput.trim()] 
      });
      setLabelInput("");
    }
  };

  const handleToggleLabel = (label: string) => {
    if (editForm.custom_labels.includes(label)) {
      setEditForm({
        ...editForm,
        custom_labels: editForm.custom_labels.filter(l => l !== label)
      });
    } else {
      setEditForm({
        ...editForm,
        custom_labels: [...editForm.custom_labels, label]
      });
    }
  };

  const handleRemoveLabel = (label: string) => {
    setEditForm({
      ...editForm,
      custom_labels: editForm.custom_labels.filter(l => l !== label)
    });
  };

  const handleSaveEdit = async () => {
    if (!lead) return;

    try {
      setIsSubmitting(true);

      const createdAtIso = editForm.created_at
        ? toIsoDateStart(editForm.created_at)
        : null;
      
      await db.leads.update(lead.id, {
        name: editForm.name.trim() || null,
        email: editForm.email.trim() || null,
        phone: editForm.phone.trim(),
        company: editForm.company.trim() || null,
        source_id: editForm.source_id,
        status: editForm.status as any,
        custom_labels: editForm.custom_labels,
        deal_value: editForm.deal_value ? Number(editForm.deal_value) : null,
        ...(createdAtIso ? { created_at: createdAtIso } : {}),
        updated_at: new Date().toISOString()
      });
      
      console.log("✅ Lead updated successfully");
      await onUpdate();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (error) {
      console.error("❌ Error updating lead:", error);
      alert("Gagal mengupdate lead. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  const followUpStages = stages.filter(s => s.funnel_type === "follow_up");
  const broadcastStages = stages.filter(s => s.funnel_type === "broadcast");
  
  const activityTypeIcons = {
    call: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    meeting: Clock,
    note: FileText
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getReasonBadge = (reason: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      progression: { color: "bg-blue-100 text-blue-700", label: "Progression" },
      no_response: { color: "bg-orange-100 text-orange-700", label: "No Response" },
      responded: { color: "bg-green-100 text-green-700", label: "Responded" },
      manual_move: { color: "bg-purple-100 text-purple-700", label: "Manual Move" }
    };
    const variant = variants[reason] || variants.manual_move;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {lead.name || <span className="text-slate-400 italic">Lead Tanpa Nama</span>}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detail informasi dan riwayat lead, termasuk kontak, aktivitas, dan perpindahan stage
              </DialogDescription>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 flex-wrap">
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Globe className="w-3 h-3" />
                  {lead.source?.name || "Unknown Source"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </div>
                {lead.email && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                  </>
                )}
                {lead.company && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {lead.company}
                    </div>
                  </>
                )}
              </div>
              {lead.custom_labels && lead.custom_labels.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {lead.custom_labels.map((label, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-col sm:flex-row items-end sm:items-center">
              <Badge className={
                lead.status === "active" ? "bg-blue-100 text-blue-700 border-blue-200" :
                lead.status === "deal" ? "bg-green-100 text-green-700 border-green-200" :
                "bg-gray-100 text-gray-700 border-gray-200"
              }>
                {lead.status === "active" ? "AKTIF" : lead.status === "deal" ? "DEAL" : "LOST"}
              </Badge>
              <Badge variant="outline">
                {lead.current_funnel === "follow_up" ? "Follow Up" : "Broadcast"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="edit" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="edit">Edit Lead</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="move">Move Stage</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Lead Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nama</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nama lead"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-phone">Phone / WhatsApp <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="08123456789"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-company">Company</Label>
                    <Input
                      id="edit-company"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Nama perusahaan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-source">Source</Label>
                    <Select 
                      value={editForm.source_id} 
                      onValueChange={(val) => setEditForm({ ...editForm, source_id: val })}
                    >
                      <SelectTrigger id="edit-source">
                        <SelectValue placeholder="Pilih Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={editForm.status} 
                      onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deal">Deal</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-created-at">Date In</Label>
                    <Input
                      id="edit-created-at"
                      type="date"
                      value={editForm.created_at}
                      onChange={(e) => setEditForm({ ...editForm, created_at: e.target.value })}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-deal-value">Deal Value (Rp)</Label>
                  <Input
                    id="edit-deal-value"
                    type="number"
                    value={editForm.deal_value}
                    onChange={(e) => setEditForm({ ...editForm, deal_value: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Custom Labels</Label>
                  
                  {availableLabels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded border">
                      {availableLabels.map((label) => (
                        <Badge
                          key={label}
                          variant={editForm.custom_labels.includes(label) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/90"
                          onClick={() => handleToggleLabel(label)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mb-3">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Tambah label baru..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                    />
                    <Button type="button" onClick={handleAddLabel} variant="secondary" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editForm.custom_labels.map((label) => (
                      <Badge key={label} variant="secondary" className="gap-1 pl-2">
                        <Tag className="h-3 w-3" />
                        {label}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLabel(label)}
                          className="hover:text-red-500 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting || !editForm.phone.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Lead Journey Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stageHistory.length > 0 ? (
                  <div className="relative space-y-4">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500"></div>
                    
                    {stageHistory.map((history, index) => (
                      <div key={history.id} className="relative flex gap-4 pl-10">
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                          index === 0 ? "bg-green-500 ring-4 ring-green-100" : "bg-blue-500 ring-4 ring-blue-100"
                        }`}></div>
                        
                        <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {history.from_stage_id ? (
                                  <>
                                    <Badge variant="outline" className="text-xs">
                                      {history.from_funnel === "follow_up" ? "Follow Up" : "Broadcast"} - Stage {history.from_stage?.stage_number}
                                    </Badge>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                      {history.to_funnel === "follow_up" ? "Follow Up" : "Broadcast"} - Stage {history.to_stage?.stage_number}
                                    </Badge>
                                  </>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    Lead Masuk - {history.to_funnel === "follow_up" ? "Follow Up" : "Broadcast"} Stage {history.to_stage?.stage_number}
                                  </Badge>
                                )}
                              </div>
                              <div className="font-semibold text-slate-900">
                                {history.from_stage_id ? (
                                  <>
                                    {history.from_stage?.stage_name} → {history.to_stage?.stage_name}
                                  </>
                                ) : (
                                  <>
                                    Masuk ke {history.to_stage?.stage_name}
                                  </>
                                )}
                              </div>
                              {history.notes && (
                                <p className="text-sm text-slate-600 mt-2">{history.notes}</p>
                              )}
                            </div>
                            {getReasonBadge(history.reason)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(history.moved_at)}
                            </div>
                            <div>
                              Oleh: {history.moved_by}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="relative flex gap-4 pl-10">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-yellow-100 animate-pulse"></div>
                      <div className="flex-1 bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            Posisi Saat Ini
                          </Badge>
                        </div>
                        <div className="font-semibold text-slate-900">
                          {lead.current_stage?.stage_name}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {lead.current_funnel === "follow_up" ? "Follow Up" : "Broadcast"} - Stage {lead.current_stage?.stage_number}
                        </div>
                        {lead.last_response_note && (
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1">
                              <MessageSquare className="w-3 h-3" />
                              Last Response:
                            </div>
                            <p className="text-sm text-slate-600 italic">{lead.last_response_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Belum ada history perpindahan stage</p>
                    <p className="text-sm mt-1">Lead ini baru saja ditambahkan</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              {lead.current_funnel === "follow_up" && (
                <Button
                  onClick={handleMoveToBroadcast}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Pindah ke Broadcast (No Response)
                </Button>
              )}
              {lead.current_funnel === "broadcast" && (
                <Button
                  onClick={handleMoveToFollowUp}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Follow Up (Responded)
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            {script ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Script untuk {lead.current_stage?.stage_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{script.script_text}</p>
                  </div>

                  {script.media_links && script.media_links.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Media Links</Label>
                      <div className="space-y-1">
                        {script.media_links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {script.image_url && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Image</Label>
                      <img src={script.image_url} alt="Script media" className="rounded-lg max-w-md" />
                    </div>
                  )}

                  {script.video_url && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Video</Label>
                      <video src={script.video_url} controls className="rounded-lg max-w-md" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Belum ada script untuk stage ini</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tambah Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Tipe Activity</Label>
                  <Select value={newActivity.type} onValueChange={(value: ActivityType) => setNewActivity({ ...newActivity, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Last Response</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Catat response terakhir dari lead..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="response_received"
                    checked={newActivity.response_received}
                    onChange={(e) => setNewActivity({ ...newActivity, response_received: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="response_received" className="text-sm">Lead merespon</Label>
                </div>

                <Button onClick={handleAddActivity} disabled={isSubmitting || !newActivity.description}>
                  Tambah Response
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riwayat Response</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const Icon = activityTypeIcons[activity.activity_type];
                      return (
                        <div key={activity.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Icon className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.activity_type}
                              </Badge>
                              {activity.response_received && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Responded
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-700">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(activity.created_at)}
                              <span>• oleh {activity.created_by}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Belum ada response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="move" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pindah ke Stage Lain</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Pilih stage tujuan dari funnel manapun dalam brand ini
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Stage</Label>
                  <Select value={moveToStage} onValueChange={setMoveToStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {funnels.map((funnel) => {
                        const funnelStages = stages.filter(s => s.funnel_id === funnel.id);
                        if (funnelStages.length === 0) return null;
                        
                        // Group stages by funnel_type within this funnel
                        const followUpStages = funnelStages.filter(s => s.funnel_type === "follow_up");
                        const broadcastStages = funnelStages.filter(s => s.funnel_type === "broadcast");
                        
                        return (
                          <div key={funnel.id}>
                            {followUpStages.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">
                                  {funnel.name} - Follow Up
                                </div>
                                {followUpStages.map((stage) => (
                                  <SelectItem key={stage.id} value={stage.id}>
                                    Stage {stage.stage_number}: {stage.stage_name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {broadcastStages.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">
                                  {funnel.name} - Broadcast
                                </div>
                                {broadcastStages.map((stage) => (
                                  <SelectItem key={stage.id} value={stage.id}>
                                    Stage {stage.stage_number}: {stage.stage_name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Catatan (Opsional)</Label>
                  <Textarea
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleMoveStage}
                  disabled={isSubmitting || !moveToStage}
                  className="w-full"
                >
                  {isSubmitting ? "Memindahkan..." : "Pindah Lead"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}