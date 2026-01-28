import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Plus, List, LayoutGrid, Settings as SettingsIcon, BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadKanban } from "@/components/LeadKanban";
import { LeadListView } from "@/components/LeadListView";
import { AddLeadModal } from "@/components/AddLeadModal";
import { Brand } from "@/types/brand";
import { Lead } from "@/types/lead";
import { Stage } from "@/types/lead";
import { brandService } from "@/services/brandService";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function BrandPage() {
  const router = useRouter();
  const { brandId } = router.query;
  const { toast } = useToast();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<"follow_up" | "broadcast" | "all">("all");

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    if (brandId && typeof brandId === "string") {
      loadBrandData(brandId);
    }
  }, [brandId, router]);

  const loadBrandData = async (id: string) => {
    try {
      setLoading(true);
      
      // Load brand info
      const brandData = await brandService.getBrandById(id);
      if (!brandData) {
        toast({
          title: "Error",
          description: "Brand not found",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }
      setBrand(brandData);

      // Load leads for this brand
      const leadsData = await db.leads.getByBrand(id);
      setLeads(leadsData);

      // Load stages
      const stagesData = await db.stages.getAll();
      setStages(stagesData);

    } catch (error) {
      console.error("Error loading brand data:", error);
      toast({
        title: "Error",
        description: "Failed to load brand data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (newLead: Partial<Lead>) => {
    if (!brandId || typeof brandId !== "string") return;

    try {
      // Add brand_id to the lead
      const leadWithBrand = {
        ...newLead,
        brand_id: brandId,
      };

      const created = await db.leads.create(leadWithBrand as Omit<Lead, "id" | "created_at" | "updated_at">);
      setLeads([created, ...leads]);
      setShowAddModal(false);

      toast({
        title: "Success",
        description: "Lead added successfully",
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const updated = await db.leads.update(leadId, updates);
      setLeads(leads.map(l => l.id === leadId ? updated : l));

      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await db.leads.delete(leadId);
      setLeads(leads.filter(l => l.id !== leadId));

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  // Filter leads by funnel
  const filteredLeads = selectedFunnel === "all" 
    ? leads 
    : leads.filter(l => l.current_funnel === selectedFunnel);

  // Stats
  const stats = {
    total: leads.length,
    followUp: leads.filter(l => l.current_funnel === "follow_up").length,
    broadcast: leads.filter(l => l.current_funnel === "broadcast").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading brand data...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{brand.name} - BKT-Leads</title>
        <meta name="description" content={`Manage leads for ${brand.name}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Back + Brand Info */}
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Brands
                  </Button>
                </Link>
                
                <div className="h-8 w-px bg-slate-300"></div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: brand.color,
                      backgroundImage: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`,
                    }}
                  >
                    <span className="text-white font-bold text-xl">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{brand.name}</h1>
                    {brand.description && (
                      <p className="text-sm text-slate-500">{brand.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="gap-2"
                  style={{ backgroundColor: brand.color }}
                >
                  <Plus className="w-4 h-4" />
                  Add Lead
                </Button>

                <Link href="/analytics-report">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                </Link>

                <Link href="/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Leads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Follow-up Pipeline</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.followUp}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Broadcast Pipeline</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.broadcast}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <List className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant={selectedFunnel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFunnel("all")}
              >
                All Leads ({stats.total})
              </Button>
              <Button
                variant={selectedFunnel === "follow_up" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFunnel("follow_up")}
              >
                Follow-up ({stats.followUp})
              </Button>
              <Button
                variant={selectedFunnel === "broadcast" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFunnel("broadcast")}
              >
                Broadcast ({stats.broadcast})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>

          {/* Lead View */}
          {viewMode === "kanban" ? (
            <LeadKanban
              leads={filteredLeads}
              stages={stages}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              funnelFilter={selectedFunnel}
            />
          ) : (
            <LeadListView
              leads={filteredLeads}
              stages={stages}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
            />
          )}
        </main>

        {/* Add Lead Modal */}
        {showAddModal && (
          <AddLeadModal
            stages={stages}
            onAdd={handleAddLead}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </>
  );
}