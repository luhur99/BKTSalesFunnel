import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/supabase";
import { LeadSource, Stage } from "@/types/lead";
import { Loader2 } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source_id: "",
    current_stage_id: "",
    deal_value: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [sourcesData, stagesData] = await Promise.all([
        db.sources.getAll(),
        db.stages.getByFunnel("follow_up")
      ]);
      setSources(sourcesData);
      setStages(stagesData);
      
      // Set default stage to first Follow Up stage
      if (stagesData.length > 0 && !formData.current_stage_id) {
        setFormData(prev => ({ ...prev, current_stage_id: stagesData[0].id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStage = stages.find(s => s.id === formData.current_stage_id);
      
      const leadData = {
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        source_id: formData.source_id,
        current_stage_id: formData.current_stage_id,
        current_funnel: selectedStage?.funnel_type || "follow_up",
        status: "active",
        deal_value: formData.deal_value ? parseFloat(formData.deal_value) : null,
        last_response_note: formData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.leads.create(leadData);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source_id: "",
        current_stage_id: stages[0]?.id || "",
        deal_value: "",
        notes: ""
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Gagal menambahkan lead. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    // At least one contact method must be provided
    const hasContact = formData.email || formData.phone;
    const hasSource = formData.source_id;
    const hasStage = formData.current_stage_id;
    
    return hasContact && hasSource && hasStage;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah Lead Baru</DialogTitle>
          <DialogDescription>
            Tambahkan lead baru ke sistem. Minimal satu kontak (email/phone) wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Lead</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama (Opsional)</Label>
                <Input
                  id="name"
                  placeholder="Nama lengkap..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Opsional)</Label>
                <Input
                  id="company"
                  placeholder="Nama perusahaan..."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="text-sm text-slate-500 italic">
              * Minimal satu kontak (email atau phone) wajib diisi
            </div>
          </div>

          {/* Source & Stage */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Source & Stage</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">
                  Lead Source <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.source_id} onValueChange={(v) => setFormData({ ...formData, source_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">
                  Initial Stage <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.current_stage_id} onValueChange={(v) => setFormData({ ...formData, current_stage_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.stage_number}. {stage.stage_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deal Value & Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detail Tambahan</h3>
            
            <div className="space-y-2">
              <Label htmlFor="deal_value">Estimasi Deal Value (Opsional)</Label>
              <Input
                id="deal_value"
                type="number"
                placeholder="5000000"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Awal (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Catatan atau informasi tambahan tentang lead ini..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid() || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Tambah Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}