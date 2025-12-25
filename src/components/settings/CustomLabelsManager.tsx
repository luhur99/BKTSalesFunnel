import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Tag, Star, Zap, Flag, Heart, AlertCircle } from "lucide-react";

interface CustomLabel {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const ICON_OPTIONS = [
  { value: "tag", icon: Tag, label: "Tag" },
  { value: "star", icon: Star, label: "Star" },
  { value: "zap", icon: Zap, label: "Zap" },
  { value: "flag", icon: Flag, label: "Flag" },
  { value: "heart", icon: Heart, label: "Heart" },
  { value: "alert", icon: AlertCircle, label: "Alert" },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "gray", label: "Gray", class: "bg-gray-500" },
];

export function CustomLabelsManager() {
  const [labels, setLabels] = useState<CustomLabel[]>([
    { id: "1", name: "VIP", color: "purple", icon: "star" },
    { id: "2", name: "Hot Lead", color: "red", icon: "zap" },
    { id: "3", name: "Follow Up Urgent", color: "orange", icon: "flag" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<CustomLabel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "blue",
    icon: "tag",
  });

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingLabel) {
      setLabels(labels.map((l) => (l.id === editingLabel.id ? { ...editingLabel, ...formData } : l)));
    } else {
      const newLabel: CustomLabel = {
        id: Date.now().toString(),
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
      };
      setLabels([...labels, newLabel]);
    }

    setIsDialogOpen(false);
    setEditingLabel(null);
    setFormData({ name: "", color: "blue", icon: "tag" });
  };

  const handleDelete = (labelId: string) => {
    if (!confirm("Yakin ingin menghapus label ini?")) return;
    setLabels(labels.filter((l) => l.id !== labelId));
  };

  const openEditDialog = (label: CustomLabel) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color,
      icon: label.icon,
    });
    setIsDialogOpen(true);
  };

  const getIconComponent = (iconValue: string) => {
    const iconOption = ICON_OPTIONS.find((i) => i.value === iconValue);
    return iconOption ? iconOption.icon : Tag;
  };

  const getColorClass = (colorValue: string) => {
    const colorOption = COLOR_OPTIONS.find((c) => c.value === colorValue);
    return colorOption ? colorOption.class : "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Custom Labels</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingLabel(null);
              setFormData({ name: "", color: "blue", icon: "tag" });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Label
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Nama Label</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Warna</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada custom label. Klik "Tambah Label" untuk membuat.
                  </TableCell>
                </TableRow>
              ) : (
                labels.map((label) => {
                  const IconComponent = getIconComponent(label.icon);
                  return (
                    <TableRow key={label.id}>
                      <TableCell>
                        <Badge className={`${getColorClass(label.color)} text-white`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {label.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{label.name}</TableCell>
                      <TableCell>
                        <IconComponent className="w-4 h-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${getColorClass(label.color)}`} />
                          <span className="capitalize">{label.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(label)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(label.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLabel ? "Edit Label" : "Tambah Label Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Label</Label>
              <Input
                placeholder="Contoh: VIP Client"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-3 gap-2">
                {ICON_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.icon === option.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={formData.color === option.value ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setFormData({ ...formData, color: option.value })}
                  >
                    <div className={`w-4 h-4 rounded-full ${option.class} mr-2`} />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg bg-muted">
                <Badge className={`${getColorClass(formData.color)} text-white`}>
                  {(() => {
                    const IconComponent = getIconComponent(formData.icon);
                    return <IconComponent className="w-3 h-3 mr-1" />;
                  })()}
                  {formData.name || "Label Preview"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {editingLabel ? "Update" : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}