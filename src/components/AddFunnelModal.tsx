/**
 * Add Funnel Modal Component
 * Form for creating new funnels within a brand
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateFunnelInput } from "@/types/brand";

interface AddFunnelModalProps {
  brandId: string;
  brandName: string;
  onAdd: (funnel: CreateFunnelInput) => Promise<void>;
  onClose: () => void;
}

export function AddFunnelModal({ brandId, brandName, onAdd, onClose }: AddFunnelModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Funnel name is required");
      return;
    }

    try {
      setLoading(true);
      await onAdd({
        brand_id: brandId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch (err) {
      console.error("Error creating funnel:", err);
      setError(err instanceof Error ? err.message : "Failed to create funnel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Funnel</DialogTitle>
          <DialogDescription>
            Create a new funnel for <span className="font-semibold text-slate-900">{brandName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Funnel Name */}
            <div className="space-y-2">
              <Label htmlFor="funnel-name">
                Funnel Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="funnel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Pipeline, Support Funnel, Upsell Flow"
                maxLength={100}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="funnel-description">Description (Optional)</Label>
              <Textarea
                id="funnel-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this funnel's purpose..."
                maxLength={500}
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                {description.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Creating...
                </>
              ) : (
                "Create Funnel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}