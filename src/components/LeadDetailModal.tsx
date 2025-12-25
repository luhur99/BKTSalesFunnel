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
import { ArrowRight, ArrowLeft, Phone, Mail, Building2, DollarSign, Clock, MessageSquare, FileText, X } from "lucide-react";
import { Lead, Stage, LeadActivity, ActivityType, StageScript } from "@/types/lead";
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
  const [script, setScript] = useState<StageScript | null>(null);
  const [moveToStage, setMoveToStage] = useState("");
  const [moveReason, setMoveReason] = useState("");
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
      const [allStages, leadActivities, stageScript] = await Promise.all([
        db.stages.getAll(),
        db.activities.getByLead(lead.id),
        lead.current_stage_id ? db.scripts.getByStage(lead.current_stage_id) : Promise.resolve(null)
      ]);

      setStages(allStages || []);
      setActivities(leadActivities || []);
      setScript(stageScript);
    } catch (error) {
      console.error("Error loading lead data:", error);
    }
  };

  const handleMoveStage = async () => {
    if (!lead || !moveToStage || !moveReason) return;

    try {
      setIsSubmitting(true);
      await db.leads.moveToStage(lead.id, moveToStage, moveReason, moveNotes, "Sales User");
      setMoveToStage("");
      setMoveReason("");
      setMoveNotes("");
      onUpdate();
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
      setNewActivity({ type: "note", description: "", response_received: false });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                {lead.company && (
                  <>
                    <Building2 className="w-4 h-4" />
                    {lead.company}
                  </>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={
                lead.status === "active" ? "bg-blue-100 text-blue-700" :
                lead.status === "deal" ? "bg-green-100 text-green-700" :
                "bg-red-100 text-red-700"
              }>
                {lead.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {lead.current_funnel === "follow_up" ? "Follow Up" : "Broadcast"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="move">Move Stage</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.deal_value && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold">${lead.deal_value.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{lead.current_stage?.stage_name}</div>
                    <div className="text-sm text-slate-600 mt-1">{lead.current_stage?.description}</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    Stage {lead.current_stage?.stage_number}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {lead.last_response_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span className="text-sm">{new Date(lead.last_response_date).toLocaleString()}</span>
                  </div>
                  {lead.last_response_note && (
                    <p className="text-sm text-slate-600 mt-2">{lead.last_response_note}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              {lead.current_funnel === "follow_up" && (
                <Button
                  onClick={handleMoveToBroadcast}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move to Broadcast (No Response)
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
                  Back to Follow Up (Responded)
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
                <p>No script available for this stage</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Activity Type</Label>
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
                  <Label>Description</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Describe the activity..."
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
                  <Label htmlFor="response_received" className="text-sm">Lead responded</Label>
                </div>

                <Button onClick={handleAddActivity} disabled={isSubmitting || !newActivity.description}>
                  Add Activity
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity History</CardTitle>
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
                              {new Date(activity.created_at).toLocaleString()}
                              <span>• by {activity.created_by}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No activities yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="move" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Move to Different Stage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Stage</Label>
                  <Select value={moveToStage} onValueChange={setMoveToStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage..." />
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
                  <Label>Reason</Label>
                  <Select value={moveReason} onValueChange={setMoveReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progression">Natural Progression</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                      <SelectItem value="responded">Lead Responded</SelectItem>
                      <SelectItem value="manual_move">Manual Move</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder="Add any relevant notes..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleMoveStage}
                  disabled={isSubmitting || !moveToStage || !moveReason}
                  className="w-full"
                >
                  Move Lead
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}