import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Funnel, UpdateFunnelInput } from "@/types/brand";
import { brandService } from "@/services/brandService";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { CustomLabel } from "@/types/lead";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose", "slate"
];

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
  slate: "#64748b",
};

const LABEL_COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
  green: "bg-green-50 text-green-700 border-green-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

interface EditFunnelModalProps {
  funnel: Funnel;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditFunnelModal({ funnel, isOpen, onClose, onUpdated }: EditFunnelModalProps) {
  const [formData, setFormData] = useState<UpdateFunnelInput>({
    name: funnel.name,
    description: funnel.description || "",
    is_active: funnel.is_active,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<CustomLabel[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [labelForm, setLabelForm] = useState({
    name: "",
    color: "blue",
  });
  const [labelError, setLabelError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    loadLabels();
  }, [isOpen, funnel.id]);

  const loadLabels = async () => {
    try {
      setLabelsLoading(true);
      const data = await db.labels.getByFunnel(funnel.id);
      const funnelOnly = data.filter((label: CustomLabel) => label.funnel_id === funnel.id);
      setLabels(funnelOnly);
    } catch (err) {
      console.error("Error loading labels:", err);
      setLabels([]);
    } finally {
      setLabelsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError("Funnel name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await brandService.updateFunnel(funnel.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        is_active: !!formData.is_active,
      });

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error updating funnel:", err);
      setError(err instanceof Error ? err.message : "Failed to update funnel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLabel = async () => {
    const name = labelForm.name.trim();
    if (!name) return;
    setLabelError(null);

    try {
      await db.labels.create({
        name,
        color: labelForm.color,
        icon: "tag",
        funnel_id: funnel.id,
      });
      setLabelForm({ name: "", color: labelForm.color });
      await loadLabels();
      onUpdated?.();
      toast({ title: "Label created" });
    } catch (err) {
      console.error("Error creating label:", err);
      const message = err instanceof Error ? err.message : "Failed to create label";
      setLabelError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm("Delete this label?")) return;

    try {
      await db.labels.delete(labelId);
      await loadLabels();
      onUpdated?.();
      toast({ title: "Label deleted" });
    } catch (err) {
      console.error("Error deleting label:", err);
      const message = err instanceof Error ? err.message : "Failed to delete label";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Funnel</DialogTitle>
          <DialogDescription>
            Update funnel details and active status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="funnel-name">Funnel Name *</Label>
              <Input
                id="funnel-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funnel-description">Description</Label>
              <Textarea
                id="funnel-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="funnel-active" className="text-sm">Active</Label>
                <p className="text-xs text-muted-foreground">Disable to hide this funnel.</p>
              </div>
              <Switch
                id="funnel-active"
                checked={!!formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={isSubmitting}
              />
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <div>
                <Label className="text-sm">Custom Labels</Label>
                <p className="text-xs text-muted-foreground">Create labels for this funnel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="label-name">Label Name</Label>
                  <Input
                    id="label-name"
                    value={labelForm.name}
                    onChange={(e) => setLabelForm({ ...labelForm, name: e.target.value })}
                    disabled={isSubmitting}
                    maxLength={100}
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
                          labelForm.color === color ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: COLOR_HEX[color] }}
                        onClick={() => setLabelForm({ ...labelForm, color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCreateLabel}
                  disabled={isSubmitting || !labelForm.name.trim()}
                >
                  Add Label
                </Button>
              </div>

              {labelError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                  {labelError}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {labelsLoading ? (
                  <span className="text-xs text-muted-foreground">Loading labels...</span>
                ) : labels.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No labels yet.</span>
                ) : (
                  labels.map((label) => (
                    <span
                      key={label.id}
                      className={cn(
                        "inline-flex items-center gap-2 text-xs border rounded-full px-2 py-0.5",
                        LABEL_COLOR_CLASSES[label.color] || "bg-slate-50 text-slate-700 border-slate-200"
                      )}
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => handleDeleteLabel(label.id)}
                        className="text-current/70 hover:text-current"
                        aria-label={`Delete ${label.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
