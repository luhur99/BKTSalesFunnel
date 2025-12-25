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
import { ArrowRight, ArrowLeft, Phone, Mail, Building2, Clock, MessageSquare, FileText, Calendar, TrendingUp, Activity, Globe, Tag } from "lucide-react";
import { Lead, Stage, LeadActivity, ActivityType, StageScript, LeadStageHistory } from "@/types/lead";
import { db } from "@/lib/supabase";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function LeadDetailModal({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [stageHistory, setStageHistory] = useState<LeadStageHistory[]>([]);
  const [script, setScript] = useState<StageScript | null>(null);
  const [moveToStage, setMoveToStage] = useState("");
  const [moveNotes, setMoveNotes] = useState("");
  const [newActivity, setNewActivity] = useState({
    type: "note" as ActivityType,
    description: "",
    response_received: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      loadLeadData();
    }
  }, [lead]);

  const loadLeadData = async () => {
    if (!lead) return;

    try {
      const [allStages, leadActivities, leadHistory, stageScript] = await Promise.all([
        db.stages.getAll(),
        db.activities.getByLead(lead.id),
        db.stageHistory.getByLead(lead.id),
        lead.current_stage_id ? db.scripts.getByStage(lead.current_stage_id) : Promise.resolve(null)
      ]);

      setStages(allStages || []);
      setActivities(leadActivities || []);
      setStageHistory(leadHistory || []);
      setScript(stageScript);
    } catch (error) {
      console.error("Error loading lead data:", error);
    }
  };

  const handleMoveStage = async () => {
    if (!lead || !moveToStage) return;

    try {
      setIsSubmitting(true);
      await db.leads.moveToStage(lead.id, moveToStage, "manual_move", moveNotes, "Sales User");
      setMoveToStage("");
      setMoveNotes("");
      onUpdate();
      loadLeadData();
    } catch (error) {
      console.error("Error moving stage:", error);
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
      
      // Update last_response_note on lead
      await db.leads.update(lead.id, {
        last_response_note: newActivity.description,
        updated_at: new Date().toISOString()
      });
      
      setNewActivity({ type: "note", description: "", response_received: false });
      onUpdate();
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
    if (broadcastStages.length === 0) return;

    try {
      setIsSubmitting(true);
      await db.leads.moveToStage(
        lead.id,
        broadcastStages[0].id,
        "no_response",
        "Lead tidak merespon, dipindah ke Broadcast Funnel",
        "Sales User"
      );
      onUpdate();
      loadLeadData();
    } catch (error) {
      console.error("Error moving to broadcast:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToFollowUp = async () => {
    if (!lead) return;

    const followUpStages = stages.filter(s => s.funnel_type === "follow_up");
    if (followUpStages.length === 0) return;

    try {
      setIsSubmitting(true);
      await db.leads.moveToStage(
        lead.id,
        followUpStages[0].id,
        "responded",
        "Lead merespon, kembali ke Follow Up Funnel",
        "Sales User"
      );
      onUpdate();
      loadLeadData();
    } catch (error) {
      console.error("Error moving to follow up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  const availableStages = stages.filter(s => s.funnel_type === lead.current_funnel);
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

        <Tabs defaultValue="history" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">History Timeline</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="response">Last Response</TabsTrigger>
            <TabsTrigger value="move">Move Stage</TabsTrigger>
          </TabsList>

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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Stage</Label>
                  <Select value={moveToStage} onValueChange={setMoveToStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          Stage {stage.stage_number}: {stage.stage_name}
                        </SelectItem>
                      ))}
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
                  Pindah Lead
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}