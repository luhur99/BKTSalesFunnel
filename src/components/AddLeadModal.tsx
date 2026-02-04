import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/supabase";
import { LeadSource, Stage, CustomLabel } from "@/types/lead";
import { Loader2, X, Tag, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getBrands } from "@/services/brandService";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded?: () => void;
  defaultBrandId?: string;
  defaultFunnelId?: string;
}

export default function AddLeadModal({ 
  isOpen, 
  onClose, 
  onLeadAdded,
  defaultBrandId,
  defaultFunnelId
}: AddLeadModalProps) {
  const [brands, setBrands] = useState<any[]>([]); // Add brands state if missing
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [customLabels, setCustomLabels] = useState<CustomLabel[]>([]);

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
    deal_value: "" as string | number,
    date_in: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Use defaultFunnelId from props if available
      const funnelId = defaultFunnelId;
      
      const [brandsData, sourcesData, labelsData, stagesData] = await Promise.all([
        getBrands(),
        db.sources.getAll(),
        // Fetch hybrid labels: global + funnel-specific (if funnel selected)
        funnelId 
          ? db.labels.getByFunnel(funnelId)
          : db.labels.getAll(),
        // Fetch stages for the funnel
        funnelId
          ? db.stages.getByFunnel(funnelId)
          : db.stages.getAll()
      ]);

      setBrands(brandsData);
      setSources(sourcesData); // Fix: use setSources not setLeadSources
      setCustomLabels(labelsData);
      setStages(stagesData || []); // Add stages data
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // Reload labels when funnel changes (if funnel selection is added later, for now just rely on defaultFunnelId)
  useEffect(() => {
    if (defaultFunnelId) {
      loadLabelsForFunnel(defaultFunnelId);
      loadStagesForFunnel(defaultFunnelId);
    } else {
      loadLabelsForFunnel(undefined);
      loadStagesForFunnel(undefined);
    }
  }, [defaultFunnelId]);

  const loadLabelsForFunnel = async (funnelId?: string) => {
    try {
      const labelsData = funnelId 
        ? await db.labels.getByFunnel(funnelId)
        : await db.labels.getAll();
      setCustomLabels(labelsData);
    } catch (error) {
      console.error("Error loading labels:", error);
    }
  };

  const loadStagesForFunnel = async (funnelId?: string) => {
    try {
      const stagesData = funnelId 
        ? await db.stages.getByFunnel(funnelId)
        : await db.stages.getAll();
      setStages(stagesData || []);
    } catch (error) {
      console.error("Error loading stages:", error);
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
    setError(null);

    try {
      // 1. Validation
      if (!formData.phone || formData.phone.trim() === "") {
        throw new Error("No. Phone / WhatsApp wajib diisi!");
      }

      // CRITICAL FIX: Validate brand_id and funnel_id
      if (!defaultBrandId) {
        throw new Error("Brand ID tidak ditemukan. Silakan refresh halaman.");
      }
      if (!defaultFunnelId) {
        throw new Error("Funnel ID tidak ditemukan. Silakan refresh halaman.");
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
      let funnelType = "follow_up"; // Default

      if (!stageId) {
        const defaultStage = stages.find(s => s.stage_number === 1);
        if (defaultStage) {
          stageId = defaultStage.id;
          funnelType = defaultStage.funnel_type;
        } else {
          throw new Error("Stage tidak valid. Hubungi admin untuk konfigurasi stage.");
        }
      } else {
        const selectedStage = stages.find(s => s.id === stageId);
        if (selectedStage) {
          funnelType = selectedStage.funnel_type;
        }
      }

      // 2. Prepare Payload
      const payload = {
        brand_id: defaultBrandId, // ✅ ADDED
        funnel_id: defaultFunnelId, // ✅ ADDED
        name: formData.name.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone.trim(),
        company: formData.company?.trim() || null,
        source_id: formData.source_id,
        current_stage_id: stageId,
        current_funnel: funnelType, // ✅ Using correct funnel type from stage
        status: formData.status as any,
        custom_labels: formData.custom_labels,
        last_response_note: formData.notes?.trim() || null,
        deal_value: formData.deal_value ? Number(formData.deal_value) : null,
        created_at: formData.date_in ? new Date(formData.date_in).toISOString() : new Date().toISOString()
      };

      console.log("🚀 Submitting payload:", payload);

      // 3. Execute
      await db.leads.create(payload);
      if (onLeadAdded) {
        onLeadAdded();
      }

      console.log("✅ Success!");
      onClose();

    } catch (err: any) {
      console.error("❌ Submit error:", err);
      let errorMessage = err.message || "Terjadi kesalahan saat menyimpan lead.";
      
      // User friendly error mapping
      if (err.code === "23502") {
        if (err.message.includes("brand_id")) errorMessage = "Brand ID missing.";
        else errorMessage = "Data tidak lengkap: Field wajib belum diisi.";
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Lead Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi lead baru ke dalam sistem
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
                    {/* Follow Up Stages */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-blue-50">
                      Follow Up Funnel
                    </div>
                    {stages
                      .filter(s => s.funnel_type === "follow_up")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          FU-{s.stage_number}: {s.stage_name}
                        </SelectItem>
                      ))}
                    
                    {/* Broadcast Stages */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-purple-50 mt-2">
                      Broadcast Funnel
                    </div>
                    {stages
                      .filter(s => s.funnel_type === "broadcast")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          BC-{s.stage_number}: {s.stage_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="date_in">Tanggal Masuk Lead <span className="text-red-500">*</span></Label>
                <Input
                  id="date_in"
                  type="date"
                  value={formData.date_in}
                  onChange={(e) => setFormData({ ...formData, date_in: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Tanggal lead ini pertama kali masuk ke sistem</p>
              </div>

              <div>
                <Label>Custom Labels (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {customLabels.map((label) => {
                    // Check if label is selected using formData.custom_labels
                    const isSelected = formData.custom_labels.includes(label.id);
                    const isGlobal = !label.funnel_id;
                    
                    return (
                      <div
                        key={label.id}
                        onClick={() => {
                          if (isSelected) {
                            // Remove label
                            setFormData(prev => ({
                              ...prev,
                              custom_labels: prev.custom_labels.filter(id => id !== label.id)
                            }));
                          } else {
                            // Add label
                            setFormData(prev => ({
                              ...prev,
                              custom_labels: [...prev.custom_labels, label.id]
                            }));
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all",
                          "hover:bg-gray-100 border",
                          isSelected 
                            ? "bg-blue-50 border-blue-300" 
                            : "bg-white border-gray-200"
                        )}
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm font-medium flex-1 truncate">
                          {label.name}
                        </span>
                        {isGlobal && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1 py-0 h-4 bg-gray-100 text-gray-600"
                          >
                            Global
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                {customLabels.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No labels available. Create labels in Funnel Settings.
                  </p>
                )}
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
                "Tambah Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}