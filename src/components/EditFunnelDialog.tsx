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
import { Funnel, UpdateFunnelInput } from "@/types/brand";
import { Loader2 } from "lucide-react";

interface EditFunnelDialogProps {
  funnel: Funnel;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (input: UpdateFunnelInput) => Promise<void>;
}

export function EditFunnelDialog({
  funnel,
  isOpen,
  onClose,
  onUpdate,
}: EditFunnelDialogProps) {
  const [name, setName] = useState(funnel.name);
  const [description, setDescription] = useState(funnel.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(funnel.name);
    setDescription(funnel.description || "");
  }, [funnel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error updating funnel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Funnel Details</DialogTitle>
          <DialogDescription>
            Update the name and description of your funnel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Funnel Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Website Leads, Facebook Ads"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this funnel..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}