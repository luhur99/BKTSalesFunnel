/**
 * Add Brand Modal Component
 * Form for creating new brands
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette } from "lucide-react";
import { brandService } from "@/services/brandService";

interface AddBrandModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BRAND_COLORS = [
  { name: "Blue", value: "#0055b6" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#9333ea" },
  { name: "Orange", value: "#ea580c" },
  { name: "Pink", value: "#db2777" },
  { name: "Teal", value: "#0d9488" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Cyan", value: "#0891b2" },
];

export function AddBrandModal({ onClose, onSuccess }: AddBrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#0055b6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Brand name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await brandService.createBrand({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating brand:", err);
      setError(err instanceof Error ? err.message : "Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>
            Create a new brand or product line to organize your leads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Powerdash, SmartCam, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this brand or product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Brand Color */}
            <div className="space-y-2">
              <Label>
                <Palette className="w-4 h-4 inline mr-1" />
                Brand Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    disabled={isSubmitting}
                    className={`
                      h-12 rounded-lg border-2 transition-all
                      ${formData.color === color.value ? "border-black scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400"}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="custom-color" className="text-xs">
                  Or enter hex code:
                </Label>
                <Input
                  id="custom-color"
                  type="text"
                  placeholder="#0055b6"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  disabled={isSubmitting}
                  className="w-32 h-8 text-xs"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Brand"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}