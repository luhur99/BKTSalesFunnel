import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/supabase";
import { Stage, FunnelType } from "@/types/lead";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FunnelStagesTabProps {
  funnelId: string;
  onUpdate?: () => void;
}

export function FunnelStagesTab({ funnelId, onUpdate }: FunnelStagesTabProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState({
    stage_name: "",
    description: "",
    funnel_type: "follow_up" as FunnelType,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStages();
  }, [funnelId]);

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await db.stages.getByFunnel(funnelId);
      setStages(data);
    } catch (error) {
      console.error("Error loading stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load funnel stages",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStage) {
        await db.stages.update(editingStage.id, {
          stage_name: formData.stage_name,
          description: formData.description,
        });
        toast({ title: "Stage updated successfully" });
      } else {
        const maxStageNumber = Math.max(
          ...stages
            .filter((s) => s.funnel_type === formData.funnel_type)
            .map((s) => s.stage_number),
          0
        );

        await db.stages.create({
          stage_name: formData.stage_name,
          stage_number: maxStageNumber + 1,
          funnel_type: formData.funnel_type,
          description: formData.description,
          funnel_id: funnelId,
        });
        toast({ title: "Stage created successfully" });
      }

      setFormData({ stage_name: "", description: "", funnel_type: "follow_up" });
      setEditingStage(null);
      loadStages();
      onUpdate?.();
    } catch (error) {
      console.error("Error saving stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save stage",
      });
    }
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm("Are you sure you want to delete this stage?")) return;

    try {
      await db.stages.delete(stageId);
      toast({ title: "Stage deleted successfully" });
      loadStages();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stage",
      });
    }
  };

  const handleMoveStage = async (stageId: string, direction: "up" | "down") => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;

    const sameTypeStages = stages
      .filter((s) => s.funnel_type === stage.funnel_type)
      .sort((a, b) => a.stage_number - b.stage_number);

    const currentIndex = sameTypeStages.findIndex((s) => s.id === stageId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sameTypeStages.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapStage = sameTypeStages[swapIndex];

    try {
      await Promise.all([
        db.stages.update(stage.id, { stage_number: swapStage.stage_number }),
        db.stages.update(swapStage.id, { stage_number: stage.stage_number }),
      ]);

      toast({ title: "Stage order updated" });
      loadStages();
      onUpdate?.();
    } catch (error) {
      console.error("Error reordering stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reorder stages",
      });
    }
  };

  const followUpStages = stages
    .filter((s) => s.funnel_type === "follow_up")
    .sort((a, b) => a.stage_number - b.stage_number);

  const broadcastStages = stages
    .filter((s) => s.funnel_type === "broadcast")
    .sort((a, b) => a.stage_number - b.stage_number);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage_name">Stage Name *</Label>
              <Input
                id="stage_name"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                placeholder="e.g., Contacted, Qualified"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funnel_type">Funnel Type *</Label>
              <select
                id="funnel_type"
                value={formData.funnel_type}
                onChange={(e) => setFormData({ ...formData, funnel_type: e.target.value as FunnelType })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!editingStage}
              >
                <option value="follow_up">Follow Up</option>
                <option value="broadcast">Broadcast</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this stage..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingStage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingStage(null);
                  setFormData({ stage_name: "", description: "", funnel_type: "follow_up" });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              {editingStage ? "Update Stage" : "Add Stage"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Follow-Up Stages</h3>
            <Badge variant="secondary">{followUpStages.length}</Badge>
          </div>
          <div className="space-y-2">
            {followUpStages.map((stage, index) => (
              <Card key={stage.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.stage_number}</Badge>
                      <p className="font-medium truncate">{stage.stage_name}</p>
                    </div>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveStage(stage.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveStage(stage.id, "down")}
                      disabled={index === followUpStages.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingStage(stage);
                        setFormData({
                          stage_name: stage.stage_name,
                          description: stage.description || "",
                          funnel_type: stage.funnel_type,
                        });
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(stage.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Broadcast Stages</h3>
            <Badge variant="secondary">{broadcastStages.length}</Badge>
          </div>
          <div className="space-y-2">
            {broadcastStages.map((stage, index) => (
              <Card key={stage.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.stage_number}</Badge>
                      <p className="font-medium truncate">{stage.stage_name}</p>
                    </div>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveStage(stage.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveStage(stage.id, "down")}
                      disabled={index === broadcastStages.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingStage(stage);
                        setFormData({
                          stage_name: stage.stage_name,
                          description: stage.description || "",
                          funnel_type: stage.funnel_type,
                        });
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(stage.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}