import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, supabase } from "@/lib/supabase";
import { brandService } from "@/services/brandService";
import { FunnelLeakageStats, StageVelocity, HeatmapDataPoint, BottleneckWarning, FunnelJourneySummary, FunnelDualFlowData } from "@/types/analytics";
import { Brand, Funnel } from "@/types/brand";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { HeatmapGrid } from "@/components/analytics/HeatmapGrid";
import { FunnelHealthCards } from "@/components/analytics/FunnelHealthCards";
import { BottleneckWarnings } from "@/components/analytics/BottleneckWarnings";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { FunnelDualTrackFlow } from "@/components/analytics/FunnelDualTrackFlow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingUp, Filter, Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface FunnelJourneyReportRow extends FunnelJourneySummary {
  traffic_platform: string | null;
  traffic_campaign_name: string | null;
  traffic_start_date: string | null;
  traffic_audience_behavior: string | null;
  traffic_audience_interest: string | null;
  traffic_keyword: string | null;
  traffic_goal_campaign: string | null;
  traffic_notes: string | null;
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
  const [dualFlowDataMap, setDualFlowDataMap] = useState<{ funnel: Funnel; data: FunnelDualFlowData }[]>([]);
  const [journeySummaries, setJourneySummaries] = useState<FunnelJourneyReportRow[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        loadBrands();
      }
    });
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

      // Load analytics data using fresh brandFunnels
      await loadAnalyticsDataForFunnels(brandFunnels, undefined);
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
    }
  }, [selectedFunnelId]);

  const loadAnalyticsDataForFunnels = async (funnelsList: Funnel[], funnelId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear existing data to prevent showing stale data
      setFunnelLeakageStats([]);
      setStageVelocity([]);
      setHeatmapData([]);
      setBottleneckWarnings([]);
      setDualFlowDataMap([]);
      setJourneySummaries([]);
      
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

      // Fetch unified journey summaries per funnel
      const funnelsToSummarize = funnelId
        ? funnelsList.filter(f => f.id === funnelId)
        : funnelsList;

      const summaryResults = await Promise.all(
        funnelsToSummarize.map(async (funnel) => {
          const summary = await db.analytics.getFunnelJourneySummary(funnel.id);
          if (!summary) return null;
          return {
            ...summary,
            funnel_name: funnel.name,
            traffic_platform: funnel.traffic_platform || null,
            traffic_campaign_name: funnel.traffic_campaign_name || null,
            traffic_start_date: funnel.traffic_start_date || null,
            traffic_audience_behavior: funnel.traffic_audience_behavior || null,
            traffic_audience_interest: funnel.traffic_audience_interest || null,
            traffic_keyword: funnel.traffic_keyword || null,
            traffic_goal_campaign: funnel.traffic_goal_campaign || null,
            traffic_notes: funnel.traffic_notes || null,
          };
        })
      );

      setJourneySummaries(
        summaryResults.filter((s): s is FunnelJourneyReportRow => s !== null)
      );

      // Fetch other analytics data in parallel
      const [velocity, heatmap, warnings] = await Promise.allSettled([
        db.analytics.getStageVelocity(funnelId),
        db.analytics.getHeatmapAnalytics("all", funnelId),
        db.analytics.getBottleneckWarnings(funnelId),
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

      // Load per-funnel dual-track flow data
      const funnelsToLoad = funnelId
        ? funnelsList.filter(f => f.id === funnelId)
        : funnelsList;
      const dualResults = await Promise.all(
        funnelsToLoad.map(async (funnel) => ({
          funnel,
          data: await db.analytics.getDualFlowByFunnel(funnel.id),
        }))
      );
      // Show all funnels — empty ones get an appropriate empty state in the component
      setDualFlowDataMap(dualResults);

    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
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

  const formatShortDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

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
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <AnalyticsHeader />
          </div>
          
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

        {/* Unified Funnel Journey Report */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Unified Funnel Journey Report</h2>
              <p className="text-sm text-gray-600">
                Perjalanan lead sebagai satu kesatuan (Follow Up + Broadcast) dan metadata iklan
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Journey + Traffic Summary</CardTitle>
              <CardDescription>
                Bandingkan funnel dan iklan mana yang paling konversi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {journeySummaries.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Funnel</TableHead>
                          <TableHead>Traffic</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Goal</TableHead>
                          <TableHead className="text-right">Leads</TableHead>
                          <TableHead className="text-right">Win</TableHead>
                          <TableHead className="text-right">Lost</TableHead>
                          <TableHead className="text-right">Conv %</TableHead>
                          <TableHead className="text-right">FU→BC</TableHead>
                          <TableHead className="text-right">BC→FU</TableHead>
                          <TableHead className="text-right">Avg Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {journeySummaries.map((row) => (
                          <TableRow key={row.funnel_id}>
                            <TableCell className="font-medium">{row.funnel_name}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {row.traffic_platform || "-"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {row.traffic_campaign_name || "-"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatShortDate(row.traffic_start_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{row.traffic_audience_behavior || "-"}</div>
                              <div className="text-xs text-slate-500">{row.traffic_audience_interest || "-"}</div>
                            </TableCell>
                            <TableCell>{row.traffic_keyword || "-"}</TableCell>
                            <TableCell>{row.traffic_goal_campaign || "-"}</TableCell>
                            <TableCell className="text-right">{row.total_leads}</TableCell>
                            <TableCell className="text-right">{row.won_count}</TableCell>
                            <TableCell className="text-right">{row.lost_count}</TableCell>
                            <TableCell className="text-right">{row.conversion_rate.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{row.switches_to_broadcast}</TableCell>
                            <TableCell className="text-right">{row.switches_to_followup}</TableCell>
                            <TableCell className="text-right">{row.avg_journey_days.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {journeySummaries.some((row) => row.traffic_notes) && (
                    <div className="mt-6 space-y-2">
                      <div className="text-sm font-semibold text-slate-700">Catatan Funnel</div>
                      <div className="space-y-2">
                        {journeySummaries
                          .filter((row) => row.traffic_notes)
                          .map((row) => (
                            <div key={`${row.funnel_id}-note`} className="text-sm text-slate-600">
                              <span className="font-medium text-slate-800">{row.funnel_name}:</span>{" "}
                              {row.traffic_notes}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  {loading ? "Loading journey data..." : selectedBrandId ? "Belum ada data journey untuk brand ini. Pastikan funnel sudah memiliki leads." : "Pilih brand untuk melihat Journey Report."}
                </div>
              )}
            </CardContent>
          </Card>
          <Separator className="my-8" />
        </section>

        {/* Per-Funnel Dual-Track Flow */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Funnel Flow Analysis</h2>
              <p className="text-sm text-gray-600">Perjalanan lead per funnel — Follow Up & Broadcast track, termasuk perpindahan antar track</p>
            </div>
          </div>
          {dualFlowDataMap.length > 0 ? (
            <div className="space-y-6">
              {dualFlowDataMap.map(({ funnel, data }) => (
                <FunnelDualTrackFlow key={funnel.id} funnelName={funnel.name} data={data} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              {loading ? "Loading funnel data..." : selectedBrandId ? "Belum ada data funnel untuk brand ini. Tambahkan leads terlebih dahulu." : "Pilih brand untuk melihat Funnel Flow Analysis."}
            </div>
          )}
          <Separator className="my-8" />
        </section>

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

        <Separator className="my-8" />
      </div>
    </div>
  );
}