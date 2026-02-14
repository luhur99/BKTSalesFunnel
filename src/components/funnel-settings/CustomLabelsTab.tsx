import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/supabase";
import { Loader2, Plus, X, Tag, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CustomLabel {
  id: string;
  name: string;
  color: string;
  icon: string;
  funnel_id?: string | null;
}

interface CustomLabelsTabProps {
  funnelId: string;
  onUpdate?: () => void;
}

const PRESET_COLORS = [
  "red", "orange", "amber", "yellow", "lime", 
  "green", "emerald", "teal", "cyan", "sky", 
  "blue", "indigo", "violet", "purple", "fuchsia", 
  "pink", "rose", "slate"
];

// Color mapping for display
const COLOR_HEX: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
  slate: "#64748b"
};

// Tailwind color classes mapping
const LABEL_COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-50 text-red-900 border-red-200",
  orange: "bg-orange-50 text-orange-900 border-orange-200",
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  yellow: "bg-yellow-50 text-yellow-900 border-yellow-200",
  lime: "bg-lime-50 text-lime-900 border-lime-200",
  green: "bg-green-50 text-green-900 border-green-200",
  emerald: "bg-emerald-50 text-emerald-900 border-emerald-200",
  teal: "bg-teal-50 text-teal-900 border-teal-200",
  cyan: "bg-cyan-50 text-cyan-900 border-cyan-200",
  sky: "bg-sky-50 text-sky-900 border-sky-200",
  blue: "bg-blue-50 text-blue-900 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-900 border-indigo-200",
  violet: "bg-violet-50 text-violet-900 border-violet-200",
  purple: "bg-purple-50 text-purple-900 border-purple-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200",
  pink: "bg-pink-50 text-pink-900 border-pink-200",
  rose: "bg-rose-50 text-rose-900 border-rose-200",
  slate: "bg-slate-50 text-slate-900 border-slate-200",
};

export function CustomLabelsTab({ funnelId, onUpdate }: CustomLabelsTabProps) {
  const [labels, setLabels] = useState<CustomLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "blue",
    icon: "tag"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLabels();
  }, [funnelId]);

  const loadLabels = async () => {
    try {
      setLoading(true);
      // Fetch hybrid labels (global + funnel specific)
      const data = await db.labels.getByFunnel(funnelId);
      setLabels(data);
    } catch (error) {
      console.error("Error loading labels:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load labels",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      await db.labels.create({
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
        funnel_id: funnelId // Always create as funnel-specific label
      });
      
      toast({ title: "Label created successfully" });
      setFormData({ name: "", color: "blue", icon: "tag" });
      loadLabels();
      onUpdate?.();
    } catch (error) {
      console.error("Error creating label:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create label",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (labelId: string) => {
    if (!confirm("Are you sure you want to delete this label?")) return;

    try {
      await db.labels.delete(labelId);
      toast({ title: "Label deleted successfully" });
      loadLabels();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting label:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete label",
      });
    }
  };

  const globalLabels = labels.filter(l => !l.funnel_id);
  const funnelLabels = labels.filter(l => l.funnel_id === funnelId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Label
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Label Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP, Hot Lead"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full border border-gray-200 transition-all",
                      `bg-${color}-500`,
                      formData.color === color ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-110"
                    )}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !formData.name.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Label
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        {/* Funnel Specific Labels */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Funnel Labels</h3>
            <Badge variant="secondary">{funnelLabels.length}</Badge>
            <span className="text-xs text-muted-foreground ml-2">(Specific to this funnel)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {funnelLabels.map((label) => (
              <div
                key={label.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border bg-card",
                  LABEL_COLOR_CLASSES[label.color] || "bg-slate-50 text-slate-900 border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Tag className="w-3 h-3 flex-shrink-0" style={{ color: COLOR_HEX[label.color] || '#64748b' }} />
                  <span className="text-sm font-medium truncate">
                    {label.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(label.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {funnelLabels.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground italic py-2">
                No custom labels created for this funnel yet.
              </div>
            )}
          </div>
        </div>

        {/* Global Labels */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Global Labels</h3>
            <Badge variant="secondary">{globalLabels.length}</Badge>
            <span className="text-xs text-muted-foreground ml-2">(Shared across all funnels)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {globalLabels.map((label) => (
              <div
                key={label.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border bg-card opacity-80",
                  LABEL_COLOR_CLASSES[label.color] || "bg-slate-50 text-slate-700 border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-3 h-3 flex-shrink-0" style={{ color: COLOR_HEX[label.color] }} />
                  <span className="text-sm font-medium truncate">
                    {label.name}
                  </span>
                </div>
                <Lock className="w-3 h-3 text-gray-400" />
              </div>
            ))}
            {globalLabels.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground italic py-2">
                No global labels available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}