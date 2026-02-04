import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, BarChart3, LayoutGrid, List, Settings, TrendingUp, Users, Target, Trophy, XCircle, Edit, Trash2, Download, Power, MoreVertical } from "lucide-react";
import { db } from "@/lib/supabase";
import { getFunnelById } from "@/services/brandService";
import type { Funnel } from "@/types/brand";
import type { Lead, Stage } from "@/types/lead";
import type { StageVelocity, HeatmapDataPoint, VelocityChartData, HeatmapCell } from "@/types/analytics";
import LeadKanban from "@/components/LeadKanban";
import { LeadListView } from "@/components/LeadListView";
import AddLeadModal from "@/components/AddLeadModal";
import { useToast } from "@/hooks/use-toast";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { HeatmapGrid } from "@/components/analytics/HeatmapGrid";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { ManageFunnelStagesDialog } from "@/components/ManageFunnelStagesDialog";
import { EditFunnelDialog } from "@/components/EditFunnelDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FunnelViewPage() {
  const router = useRouter();
  const { brandId, funnelId } = router.query;
  const { toast } = useToast();

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "follow_up" | "broadcast">("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [analyticsTab, setAnalyticsTab] = useState<"velocity" | "heatmap">("velocity");
  const [velocityData, setVelocityData] = useState<VelocityChartData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [wonCount, setWonCount] = useState<number>(0);
  const [lostCount, setLostCount] = useState<number>(0);
  const [funnelStages, setFunnelStages] = useState<Stage[]>([]);
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
  const [isEditFunnelOpen, setIsEditFunnelOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    if (funnelId && typeof funnelId === "string") {
      loadFunnel();
      loadLeads();
      loadFunnelStages();
    }
  }, [funnelId]);

  // Load analytics data
  useEffect(() => {
    if (!funnelId || typeof funnelId !== "string") return;
    loadAnalytics();
  }, [funnelId]);

  const loadFunnel = async () => {
    try {
      const data = await getFunnelById(funnelId as string);
      setFunnel(data);
    } catch (error) {
      console.error("Error loading funnel:", error);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await db.leads.getByFunnelId(funnelId as string);
      setLeads(data);
      
      // Count won and lost leads
      const won = data.filter(lead => lead.status === "deal").length;
      const lost = data.filter(lead => lead.status === "lost").length;
      
      setWonCount(won);
      setLostCount(lost);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leads",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFunnelStages = async () => {
    if (!funnelId || typeof funnelId !== "string") return;

    try {
      const stagesData = await db.stages.getByFunnel(funnelId);
      setFunnelStages(stagesData);
    } catch (error) {
      console.error("Error loading funnel stages:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      console.log("📊 Loading analytics for funnel:", funnelId);

      const [velocityResult, heatmapResult] = await Promise.allSettled([
        db.analytics.getStageVelocity(funnelId as string),
        db.analytics.getHeatmapAnalytics("all", funnelId as string)
      ]);

      // Process Velocity Data
      if (velocityResult.status === "fulfilled" && Array.isArray(velocityResult.value)) {
        const formattedVelocity: VelocityChartData[] = velocityResult.value.map(item => ({
          stage: item.stage_name_out,
          hours: parseFloat(item.avg_hours),
          leads: item.total_leads_passed
        }));
        setVelocityData(formattedVelocity);
        console.log("✅ Stage velocity loaded:", formattedVelocity.length);
      }

      // Process Heatmap Data
      if (heatmapResult.status === "fulfilled" && Array.isArray(heatmapResult.value)) {
        const rawHeatmap = heatmapResult.value;
        
        // Calculate max value for intensity
        const maxCount = Math.max(...rawHeatmap.map(d => d.count), 1);
        
        const formattedHeatmap: HeatmapCell[] = rawHeatmap.map(item => {
          // Calculate intensity
          let intensity: "low" | "medium" | "high" | "none" = "none";
          if (item.count > 0) {
            const ratio = item.count / maxCount;
            if (ratio > 0.7) intensity = "high";
            else if (ratio > 0.3) intensity = "medium";
            else intensity = "low";
          }

          return {
            day: item.day_name,
            hour: item.hour_of_day,
            value: item.count,
            intensity
          };
        });
        
        setHeatmapData(formattedHeatmap);
        console.log("✅ Heatmap data loaded:", formattedHeatmap.length);
      }
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Filter leads based on active tab
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "all") return true;
    return lead.current_funnel === activeTab;
  });

  // Calculate stats
  const totalLeads = leads.length;
  const followUpLeads = leads.filter((l) => l.current_funnel === "follow_up").length;
  const broadcastLeads = leads.filter((l) => l.current_funnel === "broadcast").length;

  const handleLeadAdded = async () => {
    // Refresh leads after adding new lead
    if (funnelId && typeof funnelId === "string") {
      try {
        console.log("🔄 Refreshing leads after add/update...");
        const leadsData = await db.leads.getByFunnelId(funnelId);
        setLeads(leadsData || []);
        console.log("✅ Leads refreshed:", leadsData?.length || 0);
      } catch (error) {
        console.error("❌ Error refreshing leads:", error);
      }
    }
  };

  // Placeholder handlers for list view
  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      console.log("🔄 Updating lead:", leadId, updates);
      await db.leads.update(leadId, updates);
      await handleLeadAdded(); // Refresh leads
      toast({ title: "Success", description: "Lead updated successfully" });
    } catch (error: any) {
      console.error("❌ Error updating lead:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update lead", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      console.log("🗑️ Deleting lead:", leadId);
      await db.leads.delete(leadId);
      await handleLeadAdded(); // Refresh leads
      toast({ title: "Success", description: "Lead deleted successfully" });
    } catch (error: any) {
      console.error("❌ Error deleting lead:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to delete lead", 
        variant: "destructive" 
      });
    }
  };

  async function handleToggleActive() {
    if (!currentFunnel || !funnelId || typeof funnelId !== "string") return;

    try {
      await brandService.updateFunnel(funnelId, {
        is_active: !currentFunnel.is_active,
      });

      toast({
        title: "Success",
        description: `Funnel ${currentFunnel.is_active ? "deactivated" : "activated"} successfully`,
      });

      loadFunnel();
    } catch (error) {
      console.error("Error toggling funnel status:", error);
      toast({
        title: "Error",
        description: "Failed to update funnel status",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteFunnel() {
    if (!currentFunnel || !funnelId || typeof funnelId !== "string") return;
    if (!brandId || typeof brandId !== "string") return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${currentFunnel.name}"?\n\nThis will permanently delete:\n- The funnel\n- All ${leads.length} leads in this funnel\n- All lead activities and history\n\nThis action cannot be undone!`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await brandService.deleteFunnel(funnelId);

      toast({
        title: "Success",
        description: "Funnel deleted successfully",
      });

      router.push(`/brand/${brandId}`);
    } catch (error) {
      console.error("Error deleting funnel:", error);
      toast({
        title: "Error",
        description: "Failed to delete funnel",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdateFunnel(input: UpdateFunnelInput) {
    if (!funnelId || typeof funnelId !== "string") return;

    try {
      await brandService.updateFunnel(funnelId, input);

      toast({
        title: "Success",
        description: "Funnel updated successfully",
      });

      loadFunnel();
    } catch (error) {
      console.error("Error updating funnel:", error);
      toast({
        title: "Error",
        description: "Failed to update funnel",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function handleExportLeads() {
    if (!leads || leads.length === 0) {
      toast({
        title: "No Data",
        description: "No leads to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvData = leads.map((lead) => ({
        Name: lead.name || "",
        Phone: lead.phone,
        Email: lead.email || "",
        Company: lead.company || "",
        "Deal Value": lead.deal_value || 0,
        Status: lead.status,
        "Funnel Type": lead.funnel_type,
        Stage: lead.current_stage_id,
        Labels: lead.labels?.join(", ") || "",
        "Created At": new Date(lead.created_at).toLocaleDateString(),
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentFunnel?.name || "funnel"}_leads_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${leads.length} leads to CSV`,
      });
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast({
        title: "Error",
        description: "Failed to export leads",
        variant: "destructive",
      });
    }
  }

  async function openAddLeadModal() {
    setShowAddModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading funnel data...</p>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Funnel not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${funnel.name} - ${funnel.brand?.name || "Brand"} | Leads Management`}
        description={`Manage leads for ${funnel.name} in ${funnel.brand?.name || "your brand"}`}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Brands
          </Link>
          <span>/</span>
          <Link
            href={`/brand/${brandId}`}
            className="hover:text-blue-600 transition-colors"
          >
            {funnel.brand?.name || "Brand"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{funnel.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/brand/${brandId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Funnels
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{funnel.name}</h1>
              {funnel.description && (
                <p className="text-gray-600 mt-1">{funnel.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/analytics-report?funnel=${funnelId}`)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreVertical className="w-4 h-4" />
                    Funnel Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Funnel Management</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setIsEditFunnelOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Funnel Details
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setIsManageStagesOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Stages
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push("/analytics-report")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleExportLeads}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Leads (CSV)
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleToggleActive}>
                    <Power className="w-4 h-4 mr-2" />
                    {currentFunnel?.is_active ? "Deactivate" : "Activate"} Funnel
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDeleteFunnel}
                    className="text-red-600 focus:text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Funnel"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={openAddLeadModal} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-3xl">{totalLeads}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Follow-up Pipeline</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{followUpLeads}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Broadcast Pipeline</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{broadcastLeads}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Win and Lost Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Leads</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{wonCount}</div>
              <p className="text-xs text-muted-foreground">
                Successfully converted leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lost Leads</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lostCount}</div>
              <p className="text-xs text-muted-foreground">
                Leads marked as lost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All Leads ({totalLeads})
            </TabsTrigger>
            <TabsTrigger value="follow_up">
              Follow-up ({followUpLeads})
            </TabsTrigger>
            <TabsTrigger value="broadcast">
              Broadcast ({broadcastLeads})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Lead Management View */}
        {filteredLeads.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leads Yet</h3>
              <p className="text-gray-600 mb-6">
                Start adding leads to this funnel to begin tracking your sales pipeline.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {viewMode === "kanban" ? (
              <LeadKanban
                leads={filteredLeads}
                funnelType={activeTab === "all" ? undefined : activeTab}
                brandId={brandId as string}
                funnelId={funnelId as string}
                stages={stages}
              />
            ) : (
              <LeadListView
                leads={filteredLeads}
                funnelType={activeTab === "all" ? undefined : activeTab}
                brandId={brandId as string}
                funnelId={funnelId as string}
                stages={stages}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
              />
            )}
          </>
        )}

        {/* Detailed Analytics Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics</h2>
            <p className="text-gray-600 mt-1">
              Deep dive into stage performance and lead patterns for this funnel
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Tabs value={analyticsTab} onValueChange={(v) => setAnalyticsTab(v as any)}>
                <TabsList className="mb-6">
                  <TabsTrigger value="velocity">
                    📊 Stage Velocity
                  </TabsTrigger>
                  <TabsTrigger value="heatmap">
                    🔥 Lead Entry Patterns
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="velocity" className="mt-0">
                  {loadingAnalytics ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading stage velocity data...</p>
                    </div>
                  ) : velocityData.length > 0 ? (
                    <VelocityChart data={velocityData} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No velocity data available yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add more leads and move them through stages to see velocity metrics
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="heatmap" className="mt-0">
                  {loadingAnalytics ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading heatmap data...</p>
                    </div>
                  ) : heatmapData.length > 0 ? (
                    <HeatmapGrid data={heatmapData} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No entry pattern data available yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add more leads to see when they typically enter this funnel
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onLeadAdded={handleLeadAdded}
          defaultBrandId={brandId as string}
          defaultFunnelId={funnelId as string}
        />
      )}

      {/* Lead Detail Modal */}
      {isDetailModalOpen && detailLead && (
        <LeadDetailModal
          lead={detailLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailLead(null);
          }}
          onUpdate={loadLeads}
        />
      )}

      {currentFunnel && (
        <EditFunnelDialog
          funnel={currentFunnel}
          isOpen={isEditFunnelOpen}
          onClose={() => setIsEditFunnelOpen(false)}
          onUpdate={handleUpdateFunnel}
        />
      )}

      <ManageFunnelStagesDialog
        funnelId={funnelId as string}
        funnelName={currentFunnel?.name || ""}
        isOpen={isManageStagesOpen}
        onClose={() => setIsManageStagesOpen(false)}
        onUpdate={() => {
          loadFunnelStages();
          loadLeads();
        }}
      />
    </>
  );
}