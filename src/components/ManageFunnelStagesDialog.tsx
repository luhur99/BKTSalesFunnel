import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, GripVertical, Copy } from "lucide-react";
import { db } from "@/lib/supabase";
import { Stage } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";

interface ManageFunnelStagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funnelId: string;
  onStagesUpdated: () => void;
}

export function ManageFunnelStagesDialog({
  open,
  onOpenChange,
  funnelId,
  onStagesUpdated,
}: ManageFunnelStagesDialogProps) {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [globalTemplates, setGlobalTemplates] = useState<Stage[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState({
    stage_name: "",
    description: "",
    funnel_type: "follow_up" as "follow_up" | "broadcast",
    stage_number: 1,
  });

  useEffect(() => {
    if (open) {
      loadStages();
      loadGlobalTemplates();
    }
  }, [open, funnelId]);

  const loadStages = async () => {
    try {
      const data = await db.stages.getByFunnel(funnelId);
      setStages(data.filter(s => s.funnel_id === funnelId));
    } catch (error) {
      console.error("Error loading stages:", error);
    }
  };

  const loadGlobalTemplates = async () => {
    try {
      const data = await db.stages.getAll();
      setGlobalTemplates(data.filter(s => s.funnel_id === null));
    } catch (error) {
      console.error("Error loading global templates:", error);
    }
  };

  const handleAdd = async () => {
    try {
      await db.stages.create({
        stage_name: formData.stage_name,
        description: formData.description,
        funnel_type: formData.funnel_type,
        stage_number: formData.stage_number,
        funnel_id: funnelId,
      });

      toast({
        title: "Success",
        description: "Stage created successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        stage_name: "",
        description: "",
        funnel_type: "follow_up",
        stage_number: 1,
      });
      await loadStages();
      onStagesUpdated();
    } catch (error) {
      console.error("Error adding stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create stage",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingStage) return;
    try {
      await db.stages.update(editingStage.id, {
        stage_name: formData.stage_name,
        description: formData.description,
        stage_number: formData.stage_number,
      });

      toast({
        title: "Success",
        description: "Stage updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingStage(null);
      setFormData({
        stage_name: "",
        description: "",
        funnel_type: "follow_up",
        stage_number: 1,
      });
      await loadStages();
      onStagesUpdated();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stage",
      });
    }
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm("Are you sure you want to delete this stage? Leads using this stage will be affected.")) {
      return;
    }

    try {
      await db.stages.delete(stageId);
      toast({
        title: "Success",
        description: "Stage deleted successfully",
      });
      await loadStages();
      onStagesUpdated();
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stage",
      });
    }
  };

  const handleCopyFromTemplate = async (templateId: string) => {
    const template = globalTemplates.find(t => t.id === templateId);
    if (!template) return;

    try {
      await db.stages.create({
        stage_name: template.stage_name,
        description: template.description,
        funnel_type: template.funnel_type,
        stage_number: stages.filter(s => s.funnel_type === template.funnel_type).length + 1,
        funnel_id: funnelId,
      });

      toast({
        title: "Success",
        description: "Stage copied from template",
      });

      await loadStages();
      onStagesUpdated();
    } catch (error) {
      console.error("Error copying template:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy template",
      });
    }
  };

  const openEditDialog = (stage: Stage) => {
    setEditingStage(stage);
    setFormData({
      stage_name: stage.stage_name,
      description: stage.description || "",
      funnel_type: stage.funnel_type,
      stage_number: stage.stage_number,
    });
    setIsEditDialogOpen(true);
  };

  const followUpStages = stages.filter(s => s.funnel_type === "follow_up").sort((a, b) => a.stage_number - b.stage_number);
  const broadcastStages = stages.filter(s => s.funnel_type === "broadcast").sort((a, b) => a.stage_number - b.stage_number);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Funnel Stages</DialogTitle>
            <DialogDescription>
              Create and manage custom stages for this funnel. These stages are specific to this funnel only.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Copy from Template Section */}
            {globalTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Quick Add from Global Templates</Label>
                <Select onValueChange={handleCopyFromTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template to copy..." />
                  </SelectTrigger>
                  <SelectContent>
                    {globalTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.funnel_type === "follow_up" ? "default" : "secondary"}>
                            {template.funnel_type}
                          </Badge>
                          {template.stage_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Follow-Up Stages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Follow-Up Stages</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData({
                      stage_name: "",
                      description: "",
                      funnel_type: "follow_up",
                      stage_number: followUpStages.length + 1,
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Follow-Up Stage
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Stage Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUpStages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No follow-up stages yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    followUpStages.map(stage => (
                      <TableRow key={stage.id}>
                        <TableCell>
                          <Badge variant="outline">{stage.stage_number}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{stage.stage_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {stage.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(stage)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(stage.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Broadcast Stages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Broadcast Stages</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData({
                      stage_name: "",
                      description: "",
                      funnel_type: "broadcast",
                      stage_number: broadcastStages.length + 1,
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Broadcast Stage
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Stage Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcastStages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No broadcast stages yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    broadcastStages.map(stage => (
                      <TableRow key={stage.id}>
                        <TableCell>
                          <Badge variant="outline">{stage.stage_number}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{stage.stage_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {stage.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(stage)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(stage.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Stage Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
            <DialogDescription>
              Create a new stage for this funnel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stage Name</Label>
              <Input
                placeholder="e.g., Initial Contact"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of this stage..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage Number</Label>
              <Input
                type="number"
                min={1}
                value={formData.stage_number}
                onChange={(e) => setFormData({ ...formData, stage_number: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formData.stage_name.trim()}>
              Create Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>
              Update stage information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stage Name</Label>
              <Input
                placeholder="e.g., Initial Contact"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of this stage..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage Number</Label>
              <Input
                type="number"
                min={1}
                value={formData.stage_number}
                onChange={(e) => setFormData({ ...formData, stage_number: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.stage_name.trim()}>
              Update Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}