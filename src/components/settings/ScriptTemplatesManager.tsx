import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { db } from "@/lib/supabase";
import { Stage } from "@/types/lead";

interface ScriptTemplate {
  id: string;
  stage_id: string;
  script_text: string;
  media_links: string[];
  image_url: string | null;
  video_url: string | null;
}

export function ScriptTemplatesManager() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [scripts, setScripts] = useState<ScriptTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptTemplate | null>(null);
  const [formData, setFormData] = useState({
    stage_id: "",
    script_text: "",
    media_links: "",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allStages = await db.stages.getAll();
    setStages(allStages);
    const allScripts = await db.scripts.getAll();
    setScripts(allScripts);
  };

  const handleSave = async () => {
    try {
      const scriptData = {
        stage_id: formData.stage_id,
        script_text: formData.script_text,
        media_links: formData.media_links.split(",").map((l) => l.trim()).filter(Boolean),
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
      };

      if (editingScript) {
        await db.scripts.update(editingScript.id, scriptData);
      } else {
        await db.scripts.create(scriptData);
      }

      setIsDialogOpen(false);
      setEditingScript(null);
      setFormData({ stage_id: "", script_text: "", media_links: "", image_url: "", video_url: "" });
      await loadData();
    } catch (error) {
      console.error("Error saving script:", error);
    }
  };

  const handleDelete = async (scriptId: string) => {
    if (!confirm("Yakin ingin menghapus script template ini?")) return;
    try {
      await db.scripts.delete(scriptId);
      await loadData();
    } catch (error) {
      console.error("Error deleting script:", error);
    }
  };

  const openEditDialog = (script: ScriptTemplate) => {
    setEditingScript(script);
    setFormData({
      stage_id: script.stage_id,
      script_text: script.script_text,
      media_links: script.media_links.join(", "),
      image_url: script.image_url || "",
      video_url: script.video_url || "",
    });
    setIsDialogOpen(true);
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.stage_name : "Unknown";
  };

  const getFunnelType = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage?.funnel_type || "follow_up";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Script Templates</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingScript(null);
              setFormData({ stage_id: "", script_text: "", media_links: "", image_url: "", video_url: "" });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Script
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Funnel</TableHead>
                <TableHead>Script Preview</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scripts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada script template. Klik "Tambah Script" untuk membuat.
                  </TableCell>
                </TableRow>
              ) : (
                scripts.map((script) => (
                  <TableRow key={script.id}>
                    <TableCell className="font-medium">{getStageName(script.stage_id)}</TableCell>
                    <TableCell>
                      <Badge variant={getFunnelType(script.stage_id) === "follow_up" ? "default" : "secondary"}>
                        {getFunnelType(script.stage_id) === "follow_up" ? "Follow Up" : "Broadcast"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {script.script_text}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {script.media_links.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {script.media_links.length} Links
                          </Badge>
                        )}
                        {script.image_url && (
                          <Badge variant="outline" className="text-xs">
                            Image
                          </Badge>
                        )}
                        {script.video_url && (
                          <Badge variant="outline" className="text-xs">
                            Video
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(script)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(script.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingScript ? "Edit Script Template" : "Tambah Script Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={formData.stage_id} onValueChange={(value) => setFormData({ ...formData, stage_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih stage..." />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.stage_name} ({stage.funnel_type === "follow_up" ? "Follow Up" : "Broadcast"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Script Text</Label>
              <Textarea
                placeholder="Halo [Nama], saya dari BKT. Bagaimana kabar Anda hari ini?"
                value={formData.script_text}
                onChange={(e) => setFormData({ ...formData, script_text: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Media Links (Optional)</Label>
              <Input
                placeholder="https://link1.com, https://link2.com (pisahkan dengan koma)"
                value={formData.media_links}
                onChange={(e) => setFormData({ ...formData, media_links: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL (Optional)</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (Optional)</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!formData.stage_id || !formData.script_text.trim()}>
              {editingScript ? "Update" : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}