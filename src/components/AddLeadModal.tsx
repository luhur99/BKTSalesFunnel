import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/supabase";
import { LeadSource, Stage } from "@/types/lead";
import { Loader2, X, Tag, Plus } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editLead?: any;
}

export function AddLeadModal({ isOpen, onClose, onSuccess, editLead }: AddLeadModalProps) {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source_id: "",
    current_stage_id: "",
    status: "active",
    custom_labels: [] as string[],
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (editLead) {
        setFormData({
          name: editLead.name || "",
          email: editLead.email || "",
          phone: editLead.phone || "",
          company: editLead.company || "",
          source_id: editLead.source_id || "",
          current_stage_id: editLead.current_stage_id || "",
          status: editLead.status || "active",
          custom_labels: editLead.custom_labels || [],
          notes: editLead.last_response_note || ""
        });
      }
    }
  }, [isOpen, editLead]);

  const loadData = async () => {
    try {
      const [sourcesData, stagesData] = await Promise.all([
        db.sources.getAll(),
        db.stages.getByFunnel("follow_up")
      ]);
      setSources(sourcesData);
      setStages(stagesData);
      
      // Load available labels from localStorage (settings)
      const storedLabels = localStorage.getItem("customLabels");
      if (storedLabels) {
        const labels = JSON.parse(storedLabels);
        setAvailableLabels(labels.map((l: any) => l.name));
      }
      
      if (stagesData.length > 0 && !formData.current_stage_id && !editLead) {
        setFormData(prev => ({ ...prev, current_stage_id: stagesData[0].id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.custom_labels.includes(labelInput.trim())) {
      setFormData({ 
        ...formData, 
        custom_labels: [...formData.custom_labels, labelInput.trim()] 
      });
      setLabelInput("");
    }
  };

  const handleToggleLabel = (label: string) => {
    if (formData.custom_labels.includes(label)) {
      setFormData({
        ...formData,
        custom_labels: formData.custom_labels.filter(l => l !== label)
      });
    } else {
      setFormData({
        ...formData,
        custom_labels: [...formData.custom_labels, label]
      });
    }
  };

  const handleRemoveLabel = (label: string) => {
    setFormData({
      ...formData,
      custom_labels: formData.custom_labels.filter(l => l !== label)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStage = stages.find(s => s.id === formData.current_stage_id);
      
      const leadData = {
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone,
        company: formData.company || null,
        source_id: formData.source_id,
        current_stage_id: formData.current_stage_id,
        current_funnel: selectedStage?.funnel_type || "follow_up",
        status: formData.status,
        custom_labels: formData.custom_labels,
        last_response_note: formData.notes || null,
        updated_at: new Date().toISOString()
      };

      if (editLead) {
        await db.leads.update(editLead.id, leadData);
      } else {
        await db.leads.create({
          ...leadData,
          created_at: new Date().toISOString()
        });
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source_id: "",
        current_stage_id: stages[0]?.id || "",
        status: "active",
        custom_labels: [],
        notes: ""
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Gagal menyimpan lead. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const hasPhone = formData.phone.trim() !== "";
    const hasSource = formData.source_id;
    const hasStage = formData.current_stage_id;
    return hasPhone && hasSource && hasStage;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editLead ? "Edit Lead" : "Tambah Lead Baru"}
          </DialogTitle>
          <DialogDescription>
            {editLead ? "Update informasi lead" : "Tambahkan lead baru ke sistem. Wajib mengisi No. Phone/WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="phone">
                  No. Phone/WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="text-sm text-slate-500 italic">
              * Wajib mengisi No. Phone/WhatsApp
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Source, Stage & Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Custom Labels
            </h3>
            
            {availableLabels.length > 0 && (
              <div className="space-y-2">
                <Label>Pilih dari Label yang Tersedia</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                  {availableLabels.map((label, idx) => {
                    const isSelected = formData.custom_labels.includes(label);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleLabel(label)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          isSelected 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="labels">Atau Tambah Label Baru</Label>
              <div className="flex gap-2">
                <Input
                  id="labels"
                  placeholder="Contoh: VIP, Hot Lead, Follow Up Urgent..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddLabel} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tambah
                </Button>
              </div>
              
              {formData.custom_labels.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Label className="text-sm">Label Terpilih:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.custom_labels.map((label, idx) => (
                      <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
                        <Tag className="w-3 h-3" />
                        {label}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(label)}
                          className="ml-2 hover:bg-slate-300 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Catatan</h3>
            
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
                editLead ? "Update Lead" : "Tambah Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}