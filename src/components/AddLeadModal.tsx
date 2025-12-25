import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadSource } from "@/types/lead";
import { db } from "@/lib/supabase";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source_id: "",
    deal_value: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

  const loadSources = async () => {
    try {
      const data = await db.sources.getAll();
      setSources(data || []);
    } catch (error) {
      console.error("Error loading sources:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = "Email atau nomor telepon harus diisi";
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.source_id) {
      newErrors.source_id = "Sumber lead wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Get first Follow Up stage
      const stages = await db.stages.getByFunnel("follow_up");
      if (!stages || stages.length === 0) {
        alert("Error: Follow Up stages not found. Please setup stages first.");
        return;
      }

      await db.leads.create({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        source_id: formData.source_id,
        current_stage_id: stages[0].id,
        current_funnel: "follow_up",
        status: "active",
        deal_value: formData.deal_value ? parseFloat(formData.deal_value) : undefined,
        notes: formData.notes || undefined
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source_id: "",
        deal_value: "",
        notes: ""
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Gagal menambahkan lead. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah Lead Baru</DialogTitle>
          <DialogDescription>
            Lead baru akan otomatis masuk ke Follow Up Funnel Stage 1
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama lengkap lead"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="company">Perusahaan</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nama perusahaan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>

          {errors.contact && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.contact}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">
                Sumber Lead <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.source_id} onValueChange={(value) => setFormData({ ...formData, source_id: value })}>
                <SelectTrigger className={errors.source_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih sumber..." />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source_id && <p className="text-xs text-red-500 mt-1">{errors.source_id}</p>}
            </div>

            <div>
              <Label htmlFor="deal_value">Estimasi Nilai Deal (Rp)</Label>
              <Input
                id="deal_value"
                type="number"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan tentang lead ini..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? "Menyimpan..." : "Tambah Lead"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}