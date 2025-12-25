import { useState, useEffect } from "react";
import Head from "next/head";
import { BarChart3, Users, TrendingUp, DollarSign, Filter, Plus, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LeadKanban } from "@/components/LeadKanban";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { BottleneckAnalytics } from "@/components/BottleneckAnalytics";
import { AddLeadModal } from "@/components/AddLeadModal";
import { Lead, FunnelType } from "@/types/lead";
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, [refreshTrigger]);

  const loadMetrics = async () => {
    try {
      const stats = await db.leads.getStats();
      setMetrics(stats);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleLeadUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    loadMetrics();
  };

  const getGrowthIndicator = (current: number, previous: number = 0) => {
    if (previous === 0) return { percentage: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(growth), isPositive: growth >= 0 };
  };

  return (
    <>
      <Head>
        <title>BKT-Leads - Dashboard CRM Budi Karya Teknologi</title>
        <meta name="description" content="Sistem manajemen leads dengan dual-funnel: Follow Up & Broadcast" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => setIsAddLeadModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Lead
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Metrics Overview */}
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
                  <CardDescription className="text-slate-600 font-medium">Total Nilai Deal</CardDescription>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  Rp {(metrics.total_deal_value / 1000).toFixed(0)}jt
                </div>
                <div className="text-sm text-slate-600">
                  Nilai deals yang berhasil ditutup
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="follow-up" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  Follow Up Funnel
                </TabsTrigger>
                <TabsTrigger 
                  value="broadcast" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                >
                  Broadcast Funnel
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      Follow Up Pipeline
                    </CardTitle>
                    <CardDescription>10 stage proses follow up intensif</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="text-5xl font-bold text-blue-600 mb-2">{metrics.follow_up_leads}</div>
                        <p className="text-slate-600">Leads aktif di Follow Up</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => setActiveTab("follow-up")}
                      >
                        Lihat Detail Pipeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      Broadcast Pipeline
                    </CardTitle>
                    <CardDescription>10 stage re-engagement sequence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="text-5xl font-bold text-purple-600 mb-2">{metrics.broadcast_leads}</div>
                        <p className="text-slate-600">Leads di Broadcast</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => setActiveTab("broadcast")}
                      >
                        Lihat Detail Pipeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <Card className="border-slate-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl">Statistik Hari Ini</CardTitle>
                  <CardDescription>Performance metrics real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{metrics.follow_up_leads}</div>
                      <div className="text-sm text-slate-600">Leads baru hari ini</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">{metrics.deals_closed}</div>
                      <div className="text-sm text-slate-600">Deals ditutup hari ini</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{metrics.broadcast_leads}</div>
                      <div className="text-sm text-slate-600">Re-engagement aktif</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="follow-up" className="space-y-6">
              <Card className="border-slate-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Follow Up Funnel - 10 Stages
                      </CardTitle>
                      <CardDescription>Proses follow up intensif untuk konversi maksimal</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => setIsAddLeadModalOpen(true)}>
                      <Plus className="w-4 h-4" />
                      Tambah Lead
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadKanban 
                    funnelType="follow_up" 
                    onLeadClick={handleLeadClick}
                    key={`follow-up-${refreshTrigger}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-6">
              <Card className="border-slate-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Broadcast Funnel - 10 Stages
                  </CardTitle>
                  <CardDescription>Re-engagement sequence untuk leads yang tidak merespon</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadKanban 
                    funnelType="broadcast" 
                    onLeadClick={handleLeadClick}
                    key={`broadcast-${refreshTrigger}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <BottleneckAnalytics key={`analytics-${refreshTrigger}`} />
            </TabsContent>
          </Tabs>

          {/* CTA Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-3">Hubungkan ke Supabase</h2>
              <p className="text-blue-100 mb-6 text-lg">
                Untuk mulai mengelola leads Anda, hubungkan database Supabase menggunakan tombol di navbar. 
                Schema database sudah siap dan menunggu Anda!
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                  Lihat Panduan Setup
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Dokumentasi
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
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
        onClose={() => setIsAddLeadModalOpen(false)}
        onSuccess={handleLeadUpdate}
      />
    </>
  );
}