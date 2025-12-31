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
import { Loader2, X, Tag, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [funnel, setFunnel] = useState<"follow_up" | "broadcast">("follow_up");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source_id: "",
    current_stage_id: "",
    status: "active",
    custom_labels: [] as string[],
    notes: "",
    deal_value: "" as string | number
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editLead) {
      // Prepopulate form for editing
      setFormData({
        name: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        company: editLead.company || "",
        source_id: editLead.source_id || "",
        current_stage_id: editLead.current_stage_id || "",
        status: editLead.status || "active",
        custom_labels: Array.isArray(editLead.custom_labels) ? editLead.custom_labels : [],
        notes: editLead.last_response_note || "",
        deal_value: editLead.deal_value || ""
      });
      
      // Determine funnel based on stage
      if (editLead.current_stage_id && stages.length > 0) {
        const stage = stages.find(s => s.id === editLead.current_stage_id);
        if (stage) {
          setFunnel(stage.funnel_type as "follow_up" | "broadcast");
        }
      }
    } else if (isOpen && !editLead) {
      // Reset form for new lead
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source_id: "",
        current_stage_id: "",
        status: "active",
        custom_labels: [],
        notes: "",
        deal_value: ""
      });
      setFunnel("follow_up");
    }
  }, [isOpen, editLead, stages]);

  const loadData = async () => {
    try {
      // Load sources
      const sourcesData = await db.sources.getAll();
      setSources(sourcesData);
      
      // Set default source if creating new lead
      if (!editLead && sourcesData.length > 0) {
        setFormData(prev => ({ ...prev, source_id: sourcesData[0].id }));
      }
      
      // Load stages
      const followUpStages = await db.stages.getByFunnel("follow_up");
      const broadcastStages = await db.stages.getByFunnel("broadcast");
      const allStages = [...followUpStages, ...broadcastStages].sort((a, b) => {
        if (a.funnel_type !== b.funnel_type) {
          return a.funnel_type === "follow_up" ? -1 : 1;
        }
        return a.stage_number - b.stage_number;
      });
      setStages(allStages);
      
      // Set default stage if creating new lead
      if (!editLead && followUpStages.length > 0) {
        const firstStage = followUpStages.find(s => s.stage_number === 1);
        if (firstStage) {
          setFormData(prev => ({ ...prev, current_stage_id: firstStage.id }));
        }
      }
      
      // Load available labels
      const customLabels = await db.customLabels.getAll();
      setAvailableLabels(customLabels.map((l: any) => l.name));
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Gagal memuat data options. Silakan refresh halaman.");
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

  // Update stage when funnel changes
  const handleFunnelChange = (newFunnel: "follow_up" | "broadcast") => {
    setFunnel(newFunnel);
    
    // Find first stage of new funnel
    const firstStage = stages.find(s => s.funnel_type === newFunnel && s.stage_number === 1);
    if (firstStage) {
      setFormData(prev => ({ ...prev, current_stage_id: firstStage.id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validation
      if (!formData.phone || formData.phone.trim() === "") {
        throw new Error("No. Phone / WhatsApp wajib diisi!");
      }

      if (!formData.source_id) {
        // Try to set default source if missing
        if (sources.length > 0) {
          formData.source_id = sources[0].id;
        } else {
          throw new Error("Lead Source wajib dipilih!");
        }
      }

      // Ensure stage is set
      let stageId = formData.current_stage_id;
      if (!stageId) {
        const defaultStage = stages.find(s => s.funnel_type === funnel && s.stage_number === 1);
        if (defaultStage) {
          stageId = defaultStage.id;
        } else {
          throw new Error("Stage tidak valid. Hubungi admin untuk konfigurasi stage.");
        }
      }

      // 2. Prepare Payload
      const payload = {
        name: formData.name.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone.trim(),
        company: formData.company?.trim() || null,
        source_id: formData.source_id,
        current_stage_id: stageId,
        status: formData.status as any,
        custom_labels: formData.custom_labels,
        last_response_note: formData.notes?.trim() || null,
        deal_value: formData.deal_value ? Number(formData.deal_value) : null
      };

      console.log("🚀 Submitting payload:", payload);

      // 3. Execute
      if (editLead) {
        await db.leads.update(editLead.id, payload);
      } else {
        await db.leads.create(payload);
      }

      console.log("✅ Success!");
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error("❌ Submit error:", err);
      let errorMessage = err.message || "Terjadi kesalahan saat menyimpan lead.";
      
      // User friendly error mapping
      if (err.code === "23502") {
        errorMessage = "Data tidak lengkap: No. Phone / WhatsApp wajib diisi.";
      } else if (err.message?.includes("fetch")) {
        errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.phone.trim() !== "" && formData.source_id !== "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editLead ? "Edit Lead" : "Tambah Lead Baru"}
          </DialogTitle>
          <DialogDescription>
            {editLead ? "Update informasi lead" : "Tambahkan lead baru ke sistem."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* --- SECTION 1: ESSENTIAL INFO --- */}
            <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Informasi Utama</h3>
              
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-1 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">No. Phone / WhatsApp <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="mt-1 bg-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PIPELINE INFO --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Pipeline & Source</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.source_id} 
                    onValueChange={(val) => setFormData({ ...formData, source_id: val })}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Pilih Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="funnel">Funnel Type</Label>
                  <Select 
                    value={funnel} 
                    onValueChange={(val: "follow_up" | "broadcast") => handleFunnelChange(val)}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="broadcast">Broadcast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stage">Current Stage</Label>
                  <Select 
                    value={formData.current_stage_id} 
                    onValueChange={(val) => setFormData({ ...formData, current_stage_id: val })}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Pilih Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages
                        .filter(s => s.funnel_type === funnel)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.stage_number}. {s.stage_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deal">Deal</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* --- SECTION 3: ADDITIONAL INFO --- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Additional Info</h3>
              
              <div>
                <Label htmlFor="company">Company / Instansi</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nama perusahaan"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="deal_value">Deal Value (Rp)</Label>
                <Input
                  id="deal_value"
                  type="number"
                  value={formData.deal_value}
                  onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="mb-2 block">Custom Labels</Label>
                
                {/* Available Labels Quick Select */}
                {availableLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded border">
                    {availableLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={formData.custom_labels.includes(label) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90"
                        onClick={() => handleToggleLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add New Label */}
                <div className="flex gap-2 mb-3">
                  <Input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Tambah label baru..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                  />
                  <Button type="button" onClick={handleAddLabel} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Labels Display */}
                <div className="flex flex-wrap gap-2">
                  {formData.custom_labels.map((label) => (
                    <Badge key={label} variant="secondary" className="gap-1 pl-2">
                      <Tag className="h-3 w-3" />
                      {label}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLabel(label)}
                        className="hover:text-red-500 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan tentang lead ini..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                editLead ? "Simpan Perubahan" : "Tambah Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}