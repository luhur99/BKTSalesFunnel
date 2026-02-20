import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { db } from "@/lib/supabase";
import { Stage } from "@/types/lead";

export function FunnelStagesManager() {
  const [followUpStages, setFollowUpStages] = useState<Stage[]>([]);
  const [broadcastStages, setBroadcastStages] = useState<Stage[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<"follow_up" | "broadcast">("follow_up");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState({
    stage_name: "",
    description: "",
    funnel_type: "follow_up" as "follow_up" | "broadcast",
    stage_number: 1,
  });

  const loadStages = useCallback(async () => {
    const stages = await db.stages.getAll();
    setFollowUpStages(stages.filter((s) => s.funnel_type === "follow_up").sort((a, b) => a.stage_number - b.stage_number));
    setBroadcastStages(stages.filter((s) => s.funnel_type === "broadcast").sort((a, b) => a.stage_number - b.stage_number));
  }, []);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const handleAdd = async () => {
    try {
      await db.stages.create({
        stage_name: formData.stage_name,
        description: formData.description,
        funnel_type: formData.funnel_type,
        stage_number: formData.stage_number,
        funnel_id: null, // Global template
      });
      setIsAddDialogOpen(false);
      setFormData({ stage_name: "", description: "", funnel_type: "follow_up", stage_number: 1 });
      await loadStages();
    } catch (error) {
      console.error("Error adding stage:", error);
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
      setIsEditDialogOpen(false);
      setEditingStage(null);
      setFormData({ stage_name: "", description: "", funnel_type: "follow_up", stage_number: 1 });
      await loadStages();
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm("Yakin ingin menghapus stage ini? Data terkait akan terpengaruh.")) return;
    try {
      await db.stages.delete(stageId);
      await loadStages();
    } catch (error) {
      console.error("Error deleting stage:", error);
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

  const renderStageTable = (stages: Stage[], funnelType: "follow_up" | "broadcast") => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {funnelType === "follow_up" ? "Follow Up Stages" : "Broadcast Stages"}
        </CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setSelectedFunnel(funnelType);
            setFormData({ ...formData, funnel_type: funnelType, stage_number: stages.length + 1 });
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Stage
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nama Stage</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada stage. Klik "Tambah Stage" untuk membuat.
                </TableCell>
              </TableRow>
            ) : (
              stages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">{stage.stage_number}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{stage.stage_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stage.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(stage)}
                      >
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
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderStageTable(followUpStages, "follow_up")}
      {renderStageTable(broadcastStages, "broadcast")}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Stage Baru</DialogTitle>
            <DialogDescription>
              Buat stage baru untuk funnel yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Stage</Label>
              <Input
                placeholder="Contoh: Initial Contact"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Optional)</Label>
              <Textarea
                placeholder="Deskripsi singkat tentang stage ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Urutan</Label>
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
              Batal
            </Button>
            <Button onClick={handleAdd} disabled={!formData.stage_name.trim()}>
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>
              Update informasi stage yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Stage</Label>
              <Input
                placeholder="Contoh: Initial Contact"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Optional)</Label>
              <Textarea
                placeholder="Deskripsi singkat tentang stage ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Urutan</Label>
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
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={!formData.stage_name.trim()}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}