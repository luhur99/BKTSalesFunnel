import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, BarChart3, LayoutGrid, List } from "lucide-react";
import { db } from "@/lib/supabase";
import { getFunnelById } from "@/services/brandService";
import type { Funnel } from "@/types/brand";
import type { Lead, Stage } from "@/types/lead";
import LeadKanban from "@/components/LeadKanban";
import { LeadListView } from "@/components/LeadListView";
import AddLeadModal from "@/components/AddLeadModal";
import { useToast } from "@/hooks/use-toast";

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

  // Load initial data
  useEffect(() => {
    if (!funnelId || typeof funnelId !== "string") return;

    async function loadData() {
      try {
        setLoading(true);
        const [funnelData, stagesData] = await Promise.all([
          getFunnelById(funnelId as string),
          db.stages.getAll()
        ]);
        setFunnel(funnelData);
        setStages(stagesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load funnel data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [funnelId, toast]);

  // Fetch leads for this funnel
  useEffect(() => {
    if (!funnelId || typeof funnelId !== "string") return;

    async function loadLeads() {
      try {
        console.log("🔍 Fetching leads for funnel:", funnelId);
        const leadsData = await db.leads.getByFunnelId(funnelId as string);
        console.log("✅ Leads loaded:", leadsData?.length || 0);
        setLeads(leadsData || []);
      } catch (error) {
        console.error("❌ Error loading leads:", error);
        toast({
          title: "Error",
          description: "Failed to load leads",
          variant: "destructive",
        });
      }
    }

    loadLeads();
  }, [funnelId, toast]);

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
      const leadsData = await db.leads.getByFunnelId(funnelId);
      setLeads(leadsData || []);
    }
  };

  // Placeholder handlers for list view
  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await db.leads.update(leadId, updates);
      handleLeadAdded();
      toast({ title: "Success", description: "Lead updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead", variant: "destructive" });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await db.leads.delete(leadId);
      handleLeadAdded();
      toast({ title: "Success", description: "Lead deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lead", variant: "destructive" });
    }
  };

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
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
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

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
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
      </div>
    </>
  );
}