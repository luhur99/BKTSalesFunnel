import { useState, useEffect } from "react";
import Head from "next/head";
import { BarChart3, Users, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadListView } from "@/components/LeadListView";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { BottleneckAnalytics } from "@/components/BottleneckAnalytics";
import { AddLeadModal } from "@/components/AddLeadModal";
import { Lead } from "@/types/lead";
import { db } from "@/lib/supabase";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_leads: 0,
    active_leads: 0,
    deals_closed: 0,
    lost_leads: 0,
    follow_up_leads: 0,
    broadcast_leads: 0,
    conversion_rate: 0,
    total_deal_value: 0
  });
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadMetrics();
    loadBottlenecks();
  }, [refreshTrigger]);

  const loadMetrics = async () => {
    try {
      const stats = await db.leads.getStats();
      setMetrics(stats);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const loadBottlenecks = async () => {
    try {
      const analytics = await db.analytics.getBottleneckAnalytics();
      const sorted = analytics
        .filter(a => a.conversion_rate < 70)
        .sort((a, b) => a.conversion_rate - b.conversion_rate)
        .slice(0, 2);
      setBottlenecks(sorted);
    } catch (error) {
      console.error("Error loading bottlenecks:", error);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setEditLead(lead);
    setIsAddLeadModalOpen(true);
  };

  const handleLeadUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    loadMetrics();
  };

  const handleCloseEditModal = () => {
    setEditLead(null);
    setIsAddLeadModalOpen(false);
  };

  return (
    <>
      <Head>
        <title>BKT-Leads - Dashboard CRM Budi Karya Teknologi</title>
        <meta name="description" content="Sistem manajemen leads dengan dual-funnel: Follow Up & Broadcast" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    BKT-Leads
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">Budi Karya Teknologi CRM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => setIsAddLeadModalOpen(true)}
                >
                  + Tambah Lead
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600 font-medium">Total Leads</CardDescription>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">{metrics.total_leads}</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-semibold">+12%</span>
                  </div>
                  <span className="text-slate-500">vs bulan lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600 font-medium">Leads Aktif</CardDescription>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">{metrics.active_leads}</div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600"><strong>{metrics.follow_up_leads}</strong> Follow Up</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600"><strong>{metrics.broadcast_leads}</strong> Broadcast</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600 font-medium">Deals Closed</CardDescription>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">{metrics.deals_closed}</div>
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-green-600">{metrics.conversion_rate.toFixed(1)}%</span>
                  <span className="ml-1">tingkat konversi</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600 font-medium">Top Bottlenecks</CardDescription>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bottlenecks.length > 0 ? (
                  <div className="space-y-3">
                    {bottlenecks.map((bn, idx) => (
                      <div key={bn.stage_id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-700 truncate">
                            {bn.stage_name}
                          </div>
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            {bn.conversion_rate.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{bn.leads_stuck} stuck</span>
                          <span>•</span>
                          <span className="capitalize">{bn.funnel_type.replace("_", " ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-4">
                    Tidak ada bottleneck terdeteksi
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
              <TabsTrigger 
                value="leads" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Daftar Leads
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                Analytics & Bottleneck
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="space-y-6">
              <Card className="border-slate-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Semua Leads (Follow Up & Broadcast)
                      </CardTitle>
                      <CardDescription>Kelola leads dari semua funnel dalam satu tampilan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadListView 
                    onLeadClick={handleLeadClick}
                    onEditClick={handleEditClick}
                    refreshTrigger={refreshTrigger}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <BottleneckAnalytics key={`analytics-${refreshTrigger}`} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setSelectedLead(null);
        }}
        onUpdate={handleLeadUpdate}
      />

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleLeadUpdate}
        editLead={editLead}
      />
    </>
  );
}