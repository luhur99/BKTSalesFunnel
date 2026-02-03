import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/supabase";
import { brandService } from "@/services/brandService";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, FunnelFlowStep, FunnelPerformanceComparison, AutoLostLeadStats } from "@/types/analytics";
import { Brand, Funnel } from "@/types/brand";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { HeatmapGrid } from "@/components/analytics/HeatmapGrid";
import { FunnelHealthCards } from "@/components/analytics/FunnelHealthCards";
import { BottleneckWarnings } from "@/components/analytics/BottleneckWarnings";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { FollowUpFunnelFlow } from "@/components/analytics/FollowUpFunnelFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingUp, Filter, BarChart3, ArrowRight, UserX } from "lucide-react";
import { TrendingDown, Clock, AlertTriangle, Activity } from "lucide-react";

// Type definitions for chart data
interface VelocityChartData {
  stage: string;
  hours: number;
  leads: number;
}

interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  intensity: "low" | "medium" | "high" | "none";
}

export default function AnalyticsReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>("all");

  // Analytics Data States
  const [funnelLeakageStats, setFunnelLeakageStats] = useState<Array<FunnelLeakageStats & { funnel_name: string }>>([]);
  const [stageVelocity, setStageVelocity] = useState<StageVelocity[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [bottleneckWarnings, setBottleneckWarnings] = useState<BottleneckWarning[]>([]);
  const [funnelComparison, setFunnelComparison] = useState<FunnelPerformanceComparison[]>([]);
  const [autoLostStats, setAutoLostStats] = useState<AutoLostLeadStats[]>([]);

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Initial load - fetch brands first
    loadBrands();
  }, [router]);

  // Load Brands
  const loadBrands = async () => {
    try {
      const allBrands = await brandService.getBrands();
      setBrands(allBrands);
      
      // Auto-select first brand if available
      if (allBrands.length > 0) {
        setSelectedBrandId(allBrands[0].id);
      } else {
        // Fallback to loading data without brand filter if no brands exist
        loadAnalyticsDataForFunnels([], undefined);
      }
    } catch (err) {
      console.error("Error loading brands:", err);
      setError("Failed to load brands.");
      setLoading(false);
    }
  };

  // Load Funnels when Brand changes
  useEffect(() => {
    if (selectedBrandId) {
      loadFunnels(selectedBrandId);
    }
  }, [selectedBrandId]);

  const loadFunnels = async (brandId: string) => {
    try {
      setLoading(true);
      const brandFunnels = await brandService.getFunnelsByBrand(brandId);
      setFunnels(brandFunnels);
      setSelectedFunnelId("all"); // Reset to 'All Funnels' when brand changes
      
      // Load comparison data for the brand
      const comparison = await db.analytics.getFunnelPerformanceComparison(brandId);
      setFunnelComparison(comparison);

      // Trigger auto-lost check (background)
      db.analytics.markStaleBroadcastLeadsAsLost().then((result) => {
        if (result.length > 0) {
          console.log(`Auto-marked ${result.length} stale broadcast leads as lost`);
        }
      });

      // Load analytics data using fresh brandFunnels
      await loadAnalyticsDataForFunnels(brandFunnels, undefined);
      await loadAutoLostStats(undefined);
    } catch (err) {
      console.error("Error loading funnels:", err);
      setError("Failed to load funnels.");
    } finally {
      setLoading(false);
    }
  };

  // Load Analytics Data when funnel filter changes (brand changes are handled in loadFunnels)
  useEffect(() => {
    if (selectedBrandId && funnels.length > 0) {
      const funnelIdToUse = selectedFunnelId === "all" ? undefined : selectedFunnelId;
      loadAnalyticsDataForFunnels(funnels, funnelIdToUse);
      loadAutoLostStats(funnelIdToUse);
    }
  }, [selectedFunnelId]);

  const loadAnalyticsDataForFunnels = async (funnelsList: Funnel[], funnelId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load auto-lost stats
      await loadAutoLostStats(funnelId);

      // Fetch leakage stats for each funnel in the brand
      let leakageStatsData: Array<FunnelLeakageStats & { funnel_name: string }> = [];
      
      if (funnelId && funnelId !== "all") {
        // Single funnel selected - get its stats
        const stats = await db.analytics.getFunnelLeakageStats(funnelId);
        const funnelName = funnelsList.find(f => f.id === funnelId)?.name || "Unknown Funnel";
        if (stats) {
          leakageStatsData = [{ ...stats, funnel_name: funnelName }];
        }
      } else if (funnelsList.length > 0) {
        // All funnels - get stats for each
        const statsPromises = funnelsList.map(async (funnel) => {
          const stats = await db.analytics.getFunnelLeakageStats(funnel.id);
          return stats ? { ...stats, funnel_name: funnel.name } : null;
        });
        
        const results = await Promise.all(statsPromises);
        leakageStatsData = results.filter((s): s is FunnelLeakageStats & { funnel_name: string } => s !== null);
      }
      
      setFunnelLeakageStats(leakageStatsData);

      // Fetch other analytics data in parallel
      const [velocity, heatmap, warnings] = await Promise.allSettled([
        db.analytics.getStageVelocity(funnelId),
        db.analytics.getHeatmapAnalytics("all", funnelId),
        db.analytics.getBottleneckWarnings(funnelId)
      ]);

      // Process stage velocity
      if (velocity.status === "fulfilled" && Array.isArray(velocity.value)) {
        setStageVelocity(velocity.value);
      }

      // Process heatmap data
      if (heatmap.status === "fulfilled" && Array.isArray(heatmap.value)) {
        setHeatmapData(heatmap.value);
      }

      // Process bottleneck warnings
      if (warnings.status === "fulfilled" && Array.isArray(warnings.value)) {
        setBottleneckWarnings(warnings.value);
      }

    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAutoLostStats = async (funnelId?: string) => {
    try {
      const stats = await db.analytics.getAutoLostLeadsStats(funnelId);
      setAutoLostStats(stats);
    } catch (error) {
      console.error("Error loading auto-lost stats:", error);
    }
  };

  // Transform stage velocity data for chart with safety checks
  const velocityChartData: VelocityChartData[] = Array.isArray(stageVelocity) 
    ? stageVelocity.map(stage => ({
        stage: stage.stage_name_out || "Unknown",
        hours: parseFloat(stage.avg_hours || "0"),
        leads: Number(stage.total_leads_passed || 0)
      }))
    : [];

  // Transform heatmap data for grid with safety checks
  const heatmapCells: HeatmapCell[] = Array.isArray(heatmapData)
    ? heatmapData.map(point => {
        const value = Number(point.count || 0);
        let intensity: "low" | "medium" | "high" | "none" = "none";
        
        if (value > 0 && value <= 5) intensity = "low";
        else if (value > 5 && value <= 10) intensity = "medium";
        else if (value > 10) intensity = "high";

        return {
          day: (point.day_name || "").trim(),
          hour: point.hour_of_day || 0,
          value,
          intensity
        };
      })
    : [];

  if (loading && funnelLeakageStats.length === 0) { // Only show full skeleton on initial load
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full mb-8 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && funnelLeakageStats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <AnalyticsHeader />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto bg-white/80 p-4 rounded-xl shadow-sm border border-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            {/* Brand Filter */}
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white border-slate-200">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Funnel Filter */}
            <Select 
              value={selectedFunnelId} 
              onValueChange={setSelectedFunnelId}
              disabled={!selectedBrandId}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-white border-slate-200">
                <SelectValue placeholder="Select Funnel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funnels</SelectItem>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auto-Lost Leads Section */}
        {selectedBrandId && selectedFunnelId !== "all" && autoLostStats.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <UserX className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Auto-Lost Leads (7+ Days Inactive)</h2>
                <p className="text-sm text-gray-600">Leads automatically marked as lost from last broadcast stage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {autoLostStats.map((stat) => (
                <Card key={stat.funnelId} className="border-red-100 hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-slate-800">{stat.funnelName}</CardTitle>
                    <CardDescription>Inactive in Last Stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-red-600">{stat.autoLostCount}</p>
                        <p className="text-xs text-red-400 font-medium">Leads Lost</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">{stat.avgDaysInStage} days</p>
                        <p className="text-xs text-slate-400">Avg. Inactivity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Separator className="my-8" />
          </section>
        )}

        {/* Funnel Performance Comparison (Only when 'All Funnels' is selected) */}
        {selectedFunnelId === "all" && funnelComparison.length > 0 && (
          <section>
             <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Funnel Sales Comparison</h2>
                <p className="text-sm text-gray-600">Analyze which funnel drives the best sales performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funnelComparison.map((funnel) => (
                <Card key={funnel.funnel_id} className="border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-slate-800">{funnel.funnel_name}</CardTitle>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        funnel.conversion_rate > 20 ? 'bg-green-100 text-green-700' : 
                        funnel.conversion_rate > 10 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {funnel.conversion_rate.toFixed(1)}% CR
                      </div>
                    </div>
                    <CardDescription>Total Leads: {funnel.total_leads}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <p className="text-xs text-green-600 font-medium mb-1">Won Deals</p>
                          <p className="text-2xl font-bold text-green-700">{funnel.won_count}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <p className="text-xs text-red-600 font-medium mb-1">Lost Deals</p>
                          <p className="text-2xl font-bold text-red-700">{funnel.lost_count}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Avg. Close Time</span>
                          <span className="font-medium text-slate-700">{funnel.avg_close_time_days} days</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedFunnelId(funnel.funnel_id)}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors text-sm font-medium border border-slate-200"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Separator className="my-8" />
          </section>
        )}

        {/* Funnel Health Cards */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Funnel Health Overview</h2>
              <p className="text-sm text-gray-600">Individual performance metrics for each funnel</p>
            </div>
          </div>
          <FunnelHealthCards funnelStats={funnelLeakageStats} />
        </section>

        <Separator className="my-8" />

        {/* Follow-Up Funnel Flow - FEATURED SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Follow-Up Funnel Flow</h2>
              <p className="text-sm text-gray-600">Visualisasi perjalanan lead dari masuk hingga closing</p>
            </div>
          </div>
          <FollowUpFunnelFlow />
        </section>

        <Separator className="my-8" />

        {/* Bottleneck Warnings */}
        {bottleneckWarnings.length > 0 && (
          <section>
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5" />
                  Bottleneck Alerts
                </CardTitle>
                <CardDescription>Stages requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <BottleneckWarnings warnings={bottleneckWarnings} />
              </CardContent>
            </Card>
          </section>
        )}

        {bottleneckWarnings.length > 0 && <Separator className="my-8" />}

        {/* Detailed Analytics Tabs */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics</h2>
            <p className="text-sm text-gray-600">Deep dive into stage performance and lead patterns</p>
          </div>

          <Tabs defaultValue="velocity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger 
                value="velocity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                📊 Stage Velocity
              </TabsTrigger>
              <TabsTrigger 
                value="heatmap"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                🔥 Lead Entry Patterns
              </TabsTrigger>
            </TabsList>

            {/* Stage Velocity Tab */}
            <TabsContent value="velocity">
              <Card className="border-slate-200 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle>📊 Stage Velocity Analysis</CardTitle>
                  <CardDescription>
                    Average time leads spend in each stage and total leads processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {velocityChartData.length > 0 ? (
                    <VelocityChart data={velocityChartData} />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium mb-2">No velocity data available yet</p>
                      <p className="text-sm text-slate-500">Add some leads and move them through stages to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Heatmap Tab */}
            <TabsContent value="heatmap">
              <Card className="border-slate-200 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle>🔥 Lead Entry Heatmap</CardTitle>
                  <CardDescription>
                    Identify peak times when leads enter your funnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {heatmapCells.length > 0 ? (
                    <HeatmapGrid data={heatmapCells} />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium mb-2">No heatmap data available yet</p>
                      <p className="text-sm text-slate-500">Add some leads to see entry patterns</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-8" />

        {/* Navigation Buttons */}
        <section className="text-center pb-8">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ← Previous Page
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🏠 Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}